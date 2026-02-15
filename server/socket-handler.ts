/**
 * Socket.io Event Handlers
 * Handles all client-server socket communication
 */

import { Server as SocketServer, Socket } from 'socket.io';
import {
  ClientJoinRoomEventSchema,
  ClientCreateRoomEventSchema,
  ClientStartGameEventSchema,
  ClientCallNumberEventSchema,
  ClientClaimWinEventSchema,
  ClientGenerateTicketsEventSchema,
  ClientKickPlayerEventSchema,
  ClientLeaveRoomEventSchema,
  ClientChangeCallerModeEventSchema,
  ClientChangeCallerEventSchema,
  ClientSelectCardEventSchema,
  ClientDeselectCardEventSchema,
  ClientResetGameEventSchema,
  ServerRoomUpdateEvent,
  ServerPlayerJoinedEvent,
  ServerPlayerLeftEvent,
  ServerGameStartedEvent,
  ServerNumberCalledEvent,
  ServerGameFinishedEvent,
  ServerGameResetEvent,
  ServerErrorEvent,
  ServerTicketsGeneratedEvent,
  ServerCallerModeChangedEvent,
  ServerCallerChangedEvent,
  ServerCardSelectedEvent,
  ServerCardDeselectedEvent,
  serializeRoom,
} from '../types/index';
import { roomManager } from './room-manager';
import { gameManager } from './game-manager';
import { generatePredefinedCard } from '../lib/card-generator';

/**
 * Setup all socket event handlers
 */
export function setupSocketHandlers(io: SocketServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Create room
    socket.on('create_room', (data) => {
      try {
        const validated = ClientCreateRoomEventSchema.parse(data);

        const room = roomManager.createRoom(
          socket.id,
          validated.playerName,
          validated.callerMode,
          validated.machineInterval
        );

        // Join socket to room
        socket.join(room.id);

        // Send room update
        const roomUpdate = {
          room: serializeRoom(room),
        };
        io.to(room.id).emit('room_update', roomUpdate);

        // Send player joined event
        const playerJoined: ServerPlayerJoinedEvent = {
          playerId: socket.id,
          playerName: validated.playerName,
          isHost: true,
        };
        socket.emit('player_joined', playerJoined);

        console.log(`[Room] Created: ${room.id} by ${validated.playerName}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to create room',
          code: 'CREATE_ROOM_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] create_room:', error);
      }
    });

    // Join room
    socket.on('join_room', (data) => {
      try {
        const validated = ClientJoinRoomEventSchema.parse(data);

        const room = roomManager.joinRoom(
          validated.roomId,
          socket.id,
          validated.playerName
        );

        // Join socket to room
        socket.join(validated.roomId);

        // Send room update to all players
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        // Notify about new player
        const playerJoined: ServerPlayerJoinedEvent = {
          playerId: socket.id,
          playerName: validated.playerName,
          isHost: false,
        };
        io.to(validated.roomId).emit('player_joined', playerJoined);

        console.log(`[Room] ${validated.playerName} joined room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to join room',
          code: 'JOIN_ROOM_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] join_room:', error);
      }
    });

    // Start game
    socket.on('start_game', (data) => {
      try {
        const validated = ClientStartGameEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        // Verify host permission
        const player = room.players.find((p) => p.id === socket.id);
        if (!player || !player.isHost) {
          throw new Error('Only host can start the game');
        }

        gameManager.startGame(room);

        // Send game started event
        const gameStarted: ServerGameStartedEvent = {
          roomId: validated.roomId,
        };
        io.to(validated.roomId).emit('game_started', gameStarted);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Game] Started in room ${validated.roomId}`);

        // If machine mode, set up number calling listener
        if (room.callerMode === 'machine') {
          setupMachineCallingListener(io, room.id);
        }
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to start game',
          code: 'START_GAME_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] start_game:', error);
      }
    });

    // Call number (manual mode)
    socket.on('call_number', (data) => {
      try {
        const validated = ClientCallNumberEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        gameManager.callNumber(room, validated.number, socket.id);

        // Broadcast number called
        const numberCalled: ServerNumberCalledEvent = {
          number: validated.number,
          calledHistory: room.calledHistory,
          remainingCount: 90 - room.calledHistory.length,
        };
        io.to(validated.roomId).emit('number_called', numberCalled);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Game] Number ${validated.number} called in room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to call number',
          code: 'CALL_NUMBER_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] call_number:', error);
      }
    });

    // Claim win
    socket.on('claim_win', (data) => {
      try {
        const validated = ClientClaimWinEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        const winResult = gameManager.validateWinClaim(
          room,
          socket.id,
          validated.ticketIndex,
          validated.boardIndex
        );

        if (!winResult) {
          throw new Error('Invalid win claim - win condition not met');
        }

        gameManager.declareWinner(room, winResult);

        // Broadcast game finished
        const gameFinished: ServerGameFinishedEvent = {
          winner: winResult,
        };
        io.to(validated.roomId).emit('game_finished', gameFinished);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Game] Win claimed by ${winResult.playerName} in room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to process win claim',
          code: 'CLAIM_WIN_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] claim_win:', error);
      }
    });

    // Generate tickets
    socket.on('generate_tickets', (data) => {
      try {
        const validated = ClientGenerateTicketsEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        const cards = gameManager.generateTickets(
          room,
          socket.id,
          validated.cardCount
        );

        // Send tickets generated event to requesting player
        const ticketsGenerated: ServerTicketsGeneratedEvent = {
          playerId: socket.id,
          tickets: cards,
        };
        socket.emit('tickets_generated', ticketsGenerated);

        // Send room update to all players
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Game] Generated ${validated.cardCount} cards for player in room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to generate tickets',
          code: 'GENERATE_TICKETS_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] generate_tickets:', error);
      }
    });

    // Kick player
    socket.on('kick_player', (data) => {
      try {
        const validated = ClientKickPlayerEventSchema.parse(data);

        const room = roomManager.kickPlayer(
          validated.roomId,
          socket.id,
          validated.playerId
        );

        // Notify kicked player
        const kickedSocket = io.sockets.sockets.get(validated.playerId);
        if (kickedSocket) {
          kickedSocket.leave(validated.roomId);
          const errorMsg: ServerErrorEvent = {
            message: 'You have been kicked from the room',
            code: 'KICKED',
          };
          kickedSocket.emit('error', errorMsg);
        }

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Room] Player ${validated.playerId} kicked from room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to kick player',
          code: 'KICK_PLAYER_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] kick_player:', error);
      }
    });

    // Leave room
    socket.on('leave_room', (data) => {
      try {
        const validated = ClientLeaveRoomEventSchema.parse(data);

        const room = roomManager.leaveRoom(validated.roomId, socket.id);

        socket.leave(validated.roomId);

        if (room) {
          // Send player left event
          const playerLeft: ServerPlayerLeftEvent = {
            playerId: socket.id,
            playerName: '', // Could be improved by storing player name before removal
          };
          io.to(validated.roomId).emit('player_left', playerLeft);

          // Send room update
          const roomUpdate: ServerRoomUpdateEvent = {
            room: serializeRoom(room),
          };
          io.to(validated.roomId).emit('room_update', roomUpdate);
        }

        console.log(`[Room] Player ${socket.id} left room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to leave room',
          code: 'LEAVE_ROOM_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] leave_room:', error);
      }
    });

    // Change caller mode
    socket.on('change_caller_mode', (data) => {
      try {
        const validated = ClientChangeCallerModeEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        gameManager.changeCallerMode(
          room,
          socket.id,
          validated.callerMode,
          validated.machineInterval
        );

        // Send caller mode changed event
        const callerModeChanged: ServerCallerModeChangedEvent = {
          callerMode: validated.callerMode,
          machineInterval: validated.machineInterval,
        };
        io.to(validated.roomId).emit('caller_mode_changed', callerModeChanged);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Room] Caller mode changed to ${validated.callerMode} in room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to change caller mode',
          code: 'CHANGE_CALLER_MODE_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] change_caller_mode:', error);
      }
    });

    // Change caller
    socket.on('change_caller', (data) => {
      try {
        const validated = ClientChangeCallerEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        // Get old and new caller names for event
        const oldCaller = room.players.find((p) => p.isCaller);
        const newCaller = room.players.find((p) => p.id === validated.targetPlayerId);

        if (!oldCaller || !newCaller) {
          throw new Error('Caller not found');
        }

        const oldCallerId = oldCaller.id;
        const oldCallerName = oldCaller.name;
        const newCallerId = newCaller.id;
        const newCallerName = newCaller.name;

        // Change the caller
        roomManager.changeCaller(validated.roomId, socket.id, validated.targetPlayerId);

        // Send caller changed event
        const callerChanged: ServerCallerChangedEvent = {
          oldCallerId,
          oldCallerName,
          newCallerId,
          newCallerName,
        };
        io.to(validated.roomId).emit('caller_changed', callerChanged);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Room] Caller changed from ${oldCallerName} to ${newCallerName} in room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to change caller',
          code: 'CHANGE_CALLER_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] change_caller:', error);
      }
    });

    // Select card
    socket.on('select_card', (data) => {
      try {
        const validated = ClientSelectCardEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        // Cannot select card if game has started
        if (room.gameState !== 'waiting') {
          throw new Error('Cannot select card after game has started');
        }

        // Get player
        const player = room.players.find((p) => p.id === socket.id);
        if (!player) {
          throw new Error('Player not found in room');
        }

        // Initialize selectedCards if not exists
        if (!room.selectedCards) {
          room.selectedCards = {};
        }

        // Check if card is already selected by someone else
        const currentOwner = room.selectedCards[validated.cardId];
        if (currentOwner && currentOwner !== socket.id) {
          throw new Error('Card already selected by another player');
        }

        // Check if player already selected this card (shouldn't happen, but just in case)
        if (currentOwner === socket.id) {
          throw new Error('You have already selected this card');
        }

        // Check if player has reached max card limit (5 cards)
        const MAX_CARDS_PER_PLAYER = 5;
        const playerCardCount = Object.values(room.selectedCards).filter(
          (playerId) => playerId === socket.id
        ).length;

        if (playerCardCount >= MAX_CARDS_PER_PLAYER) {
          throw new Error(`You can only select up to ${MAX_CARDS_PER_PLAYER} cards`);
        }

        // Assign card to player (don't remove previous selections)
        room.selectedCards[validated.cardId] = socket.id;

        // Generate the actual card data for this card ID
        const cardData = generatePredefinedCard(validated.cardId);

        // Add the card to player's tickets
        player.tickets.push(cardData);

        // Send card selected event
        const cardSelected: ServerCardSelectedEvent = {
          cardId: validated.cardId,
          playerId: socket.id,
          playerName: player.name,
        };
        io.to(validated.roomId).emit('card_selected', cardSelected);

        // Send tickets generated event (so client updates player's cards)
        const ticketsGenerated: ServerTicketsGeneratedEvent = {
          playerId: socket.id,
          tickets: player.tickets,
        };
        socket.emit('tickets_generated', ticketsGenerated);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Room] Card ${validated.cardId} selected by ${player.name} in room ${validated.roomId} (${player.tickets.length} total cards)`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to select card',
          code: 'SELECT_CARD_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] select_card:', error);
      }
    });

    // Deselect card
    socket.on('deselect_card', (data) => {
      try {
        const validated = ClientDeselectCardEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        // Cannot deselect card if game has started
        if (room.gameState !== 'waiting') {
          throw new Error('Cannot deselect card after game has started');
        }

        // Initialize selectedCards if not exists
        if (!room.selectedCards) {
          room.selectedCards = {};
        }

        // Check if card is owned by this player
        const cardOwner = room.selectedCards[validated.cardId];
        if (!cardOwner || cardOwner !== socket.id) {
          throw new Error('You have not selected this card');
        }

        // Get player
        const player = room.players.find((p) => p.id === socket.id);
        if (!player) {
          throw new Error('Player not found in room');
        }

        // Find the index of this card in player's tickets
        // Get all currently selected card IDs for this player
        const playerCardIds = Object.entries(room.selectedCards)
          .filter(([_, playerId]) => playerId === socket.id)
          .map(([id]) => parseInt(id, 10))
          .sort((a, b) => a - b);

        // Find the position of the card to remove
        const cardPosition = playerCardIds.indexOf(validated.cardId);

        if (cardPosition !== -1 && cardPosition < player.tickets.length) {
          // Remove the card at this position
          player.tickets.splice(cardPosition, 1);
        }

        // Remove the specific card from selectedCards
        const deselectedCardId = validated.cardId;
        delete room.selectedCards[deselectedCardId];

        // Send card deselected event
        const cardDeselected: ServerCardDeselectedEvent = {
          cardId: deselectedCardId,
          playerId: socket.id,
        };
        io.to(validated.roomId).emit('card_deselected', cardDeselected);

        // Send updated tickets to player
        const ticketsGenerated: ServerTicketsGeneratedEvent = {
          playerId: socket.id,
          tickets: player.tickets,
        };
        socket.emit('tickets_generated', ticketsGenerated);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Room] Card ${deselectedCardId} deselected by player ${socket.id} in room ${validated.roomId} (${player.tickets.length} remaining)`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to deselect card',
          code: 'DESELECT_CARD_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] deselect_card:', error);
      }
    });

    // Reset game
    socket.on('reset_game', (data) => {
      try {
        const validated = ClientResetGameEventSchema.parse(data);

        const room = roomManager.getRoom(validated.roomId);
        if (!room) {
          throw new Error('Room not found');
        }

        // Verify host permission
        const player = room.players.find((p) => p.id === socket.id);
        if (!player || !player.isHost) {
          throw new Error('Only host can reset the game');
        }

        // Reset the game
        gameManager.resetGame(room);

        // Send game reset event
        const gameReset: ServerGameResetEvent = {
          roomId: validated.roomId,
        };
        io.to(validated.roomId).emit('game_reset', gameReset);

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(validated.roomId).emit('room_update', roomUpdate);

        console.log(`[Game] Reset in room ${validated.roomId}`);
      } catch (error) {
        const errorMsg: ServerErrorEvent = {
          message: error instanceof Error ? error.message : 'Failed to reset game',
          code: 'RESET_GAME_ERROR',
        };
        socket.emit('error', errorMsg);
        console.error('[Error] reset_game:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const result = roomManager.disconnectPlayer(socket.id);

      if (result) {
        const { roomId, room } = result;

        // Send room update
        const roomUpdate: ServerRoomUpdateEvent = {
          room: serializeRoom(room),
        };
        io.to(roomId).emit('room_update', roomUpdate);

        console.log(`[Socket] Client disconnected: ${socket.id} from room ${roomId}`);
      } else {
        console.log(`[Socket] Client disconnected: ${socket.id} (not in any room)`);
      }
    });
  });

  // Periodic cleanup
  setInterval(() => {
    const cleaned = roomManager.cleanup();
    if (cleaned > 0) {
      console.log(`[Cleanup] Removed ${cleaned} empty rooms`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Setup machine calling listener for a room
 * This polls the room state and broadcasts number_called events
 */
function setupMachineCallingListener(io: SocketServer, roomId: string): void {
  let lastCalledLength = 0;

  const checkInterval = setInterval(() => {
    const room = roomManager.getRoom(roomId);

    if (!room || room.gameState !== 'playing' || room.callerMode !== 'machine') {
      clearInterval(checkInterval);
      return;
    }

    // Check if new number was called
    if (room.calledHistory.length > lastCalledLength) {
      const newNumber = room.calledHistory[room.calledHistory.length - 1];

      const numberCalled: ServerNumberCalledEvent = {
        number: newNumber,
        calledHistory: room.calledHistory,
        remainingCount: 90 - room.calledHistory.length,
      };
      io.to(roomId).emit('number_called', numberCalled);

      // Send room update
      const roomUpdate: ServerRoomUpdateEvent = {
        room: serializeRoom(room),
      };
      io.to(roomId).emit('room_update', roomUpdate);

      lastCalledLength = room.calledHistory.length;
      console.log(`[Game] Machine called number ${newNumber} in room ${roomId}`);
    }
  }, 100); // Check every 100ms
}
