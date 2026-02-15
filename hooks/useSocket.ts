/**
 * Socket.io Client Hook
 * Custom React hook for connecting to Socket.io server and syncing with Zustand store
 *
 * FEATURES:
 * - Auto-connect/reconnect with Socket.io server
 * - Listen to 9 server events and update Zustand store
 * - Emit 9 client events with type-safe parameters
 * - Handle connection state and errors
 * - Auto-cleanup on unmount
 * - Deserialize room data (Date strings → Date objects)
 *
 * USAGE:
 * ```tsx
 * const {
 *   connected,
 *   connecting,
 *   createRoom,
 *   joinRoom,
 *   startGame,
 *   // ... other actions
 * } = useSocket();
 * ```
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl, socketOptions } from '@/lib/socket-config';
import { useGameStore } from '@/store/useGameStore';
import {
  ServerRoomUpdateEvent,
  ServerPlayerJoinedEvent,
  ServerPlayerLeftEvent,
  ServerGameStartedEvent,
  ServerNumberCalledEvent,
  ServerGameFinishedEvent,
  ServerErrorEvent,
  ServerTicketsGeneratedEvent,
  ServerCallerModeChangedEvent,
  ServerCallerChangedEvent,
  ServerMarkingModeChangedEvent,
  ServerGameResetEvent,
  deserializeRoom,
  CallerMode,
} from '@/types';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

export interface UseSocketReturn {
  // Connection state
  connected: boolean;
  connecting: boolean;

  // Actions
  createRoom: (playerName: string, cardCount: number) => void;
  joinRoom: (roomId: string, playerName: string, cardCount: number) => void;
  startGame: () => void;
  callNumber: (number: number) => void;
  claimWin: () => void;
  generateTickets: (cardCount: number, boardsPerCard: number) => void;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => void;
  changeCallerMode: (mode: CallerMode) => void;
  changeCaller: (targetPlayerId: string) => void;
  changeMarkingMode: (manualMarkingMode: boolean) => void;
  resetGame: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for Socket.io connection and state synchronization
 */
export function useSocket(): UseSocketReturn {
  // Socket instance (stored in ref to persist across renders)
  const socketRef = useRef<Socket | null>(null);

  // Connection state (tracked in local state for reactivity)
  const [connected, setConnected] = useState(false);

  // Get store actions
  const setRoom = useGameStore((state) => state.setRoom);
  const removePlayer = useGameStore((state) => state.removePlayer);
  const setGameState = useGameStore((state) => state.setGameState);
  const addCalledNumber = useGameStore((state) => state.addCalledNumber);
  const setCurrentNumber = useGameStore((state) => state.setCurrentNumber);
  const setWinner = useGameStore((state) => state.setWinner);
  const setCurrentPlayerId = useGameStore((state) => state.setCurrentPlayerId);
  const setPlayerCards = useGameStore((state) => state.setPlayerCards);
  const setConnecting = useGameStore((state) => state.setConnecting);
  const setError = useGameStore((state) => state.setError);
  const clearError = useGameStore((state) => state.clearError);

  // Get connecting state from store
  const connecting = useGameStore((state) => state.connecting);

  // Get current room ID from store
  const roomId = useGameStore((state) => state.room?.id || null);

  // Track if we need to auto-generate tickets
  const needsTicketsRef = useRef(false);
  const pendingCardCountRef = useRef<number>(3);

  // ===========================
  // CONNECTION LIFECYCLE
  // ===========================

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Create socket connection
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, socketOptions);
    socketRef.current = socket;

    console.log('[Socket] Connecting to:', socketUrl);
    setConnecting(true);

    // ===========================
    // CONNECTION EVENT LISTENERS
    // ===========================

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      setConnecting(false);
      setCurrentPlayerId(socket.id || null);
      clearError();
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      setConnected(false);
      setConnecting(false);
      setError('Failed to connect to server. Please check your internet connection.');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
      setConnecting(false);

      if (reason === 'io server disconnect') {
        // Server disconnected us, show error
        setError('Server disconnected. Please try reconnecting.');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      setConnected(true);
      setConnecting(false);
      clearError();
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnect attempt', attemptNumber);
      setConnecting(true);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnect error:', error);
      setError('Failed to reconnect to server. Retrying...');
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnect failed after all attempts');
      setConnecting(false);
      setError('Failed to reconnect to server. Please refresh the page.');
    });

    // ===========================
    // SERVER EVENT LISTENERS
    // ===========================

    // 1. room_update - Update entire room state
    socket.on('room_update', (data: ServerRoomUpdateEvent) => {
      try {
        console.log('[Socket] Room update received:', data);
        const room = deserializeRoom(data.room);
        setRoom(room);

        // Auto-generate tickets if needed
        if (needsTicketsRef.current && socket.id) {
          const currentPlayer = room.players.find((p) => p.id === socket.id);

          // Only generate if player has no tickets and room is in waiting state
          if (currentPlayer && currentPlayer.tickets.length === 0 && room.gameState === 'waiting') {
            console.log('[Socket] Auto-generating tickets after room update');
            needsTicketsRef.current = false; // Reset flag

            // Emit generate_tickets with the stored card count
            socket.emit('generate_tickets', {
              roomId: room.id,
              cardCount: pendingCardCountRef.current,
              boardsPerCard: 1 as 1 | 2 | 3,
            });
          } else {
            // Reset flag if player already has tickets
            needsTicketsRef.current = false;
          }
        }
      } catch (error) {
        console.error('[Socket] Error processing room_update:', error);
      }
    });

    // 2. player_joined - Player joined the room
    socket.on('player_joined', (data: ServerPlayerJoinedEvent) => {
      try {
        console.log('[Socket] Player joined:', data);
        // Room update will handle the actual player list update
        // This event is mainly for notifications
      } catch (error) {
        console.error('[Socket] Error processing player_joined:', error);
      }
    });

    // 3. player_left - Player left the room
    socket.on('player_left', (data: ServerPlayerLeftEvent) => {
      try {
        console.log('[Socket] Player left:', data);
        removePlayer(data.playerId);
      } catch (error) {
        console.error('[Socket] Error processing player_left:', error);
      }
    });

    // 4. game_started - Game has started
    socket.on('game_started', (data: ServerGameStartedEvent) => {
      try {
        console.log('[Socket] Game started:', data);
        setGameState('playing');
      } catch (error) {
        console.error('[Socket] Error processing game_started:', error);
      }
    });

    // 5. number_called - New number was called
    socket.on('number_called', (data: ServerNumberCalledEvent) => {
      try {
        console.log('[Socket] Number called:', data);
        addCalledNumber(data.number);
        setCurrentNumber(data.number);
      } catch (error) {
        console.error('[Socket] Error processing number_called:', error);
      }
    });

    // 6. game_finished - Game finished with winner
    socket.on('game_finished', (data: ServerGameFinishedEvent) => {
      try {
        console.log('[Socket] Game finished:', data);
        setWinner(data.winner);
        setGameState('finished');
      } catch (error) {
        console.error('[Socket] Error processing game_finished:', error);
      }
    });

    // 7. error - Server error message
    socket.on('error', (data: ServerErrorEvent) => {
      try {
        console.error('[Socket] Server error:', data);
        setError(data.message);

        // Auto-clear error after 5 seconds
        setTimeout(() => {
          clearError();
        }, 5000);
      } catch (error) {
        console.error('[Socket] Error processing error event:', error);
      }
    });

    // 8. tickets_generated - Cards generated for player
    socket.on('tickets_generated', (data: ServerTicketsGeneratedEvent) => {
      try {
        console.log('[Socket] Tickets generated:', data);
        // Only update if it's for the current player
        if (data.playerId === socket.id) {
          setPlayerCards(data.tickets);
        }
      } catch (error) {
        console.error('[Socket] Error processing tickets_generated:', error);
      }
    });

    // 9. caller_mode_changed - Caller mode changed
    socket.on('caller_mode_changed', (data: ServerCallerModeChangedEvent) => {
      try {
        console.log('[Socket] Caller mode changed:', data);
        // Room update will handle the actual state update
        // This event is mainly for notifications
      } catch (error) {
        console.error('[Socket] Error processing caller_mode_changed:', error);
      }
    });

    // 10. caller_changed - Caller changed
    socket.on('caller_changed', (data: ServerCallerChangedEvent) => {
      try {
        console.log('[Socket] Caller changed:', data);
        // Room update will handle the actual state update
        // This event is mainly for notifications
      } catch (error) {
        console.error('[Socket] Error processing caller_changed:', error);
      }
    });

    // 11. marking_mode_changed - Marking mode changed
    socket.on('marking_mode_changed', (data: ServerMarkingModeChangedEvent) => {
      try {
        console.log('[Socket] Marking mode changed:', data);
        // Room update will handle the actual state update
        // This event is mainly for notifications
      } catch (error) {
        console.error('[Socket] Error processing marking_mode_changed:', error);
      }
    });

    // 12. game_reset - Game reset
    socket.on('game_reset', (data: ServerGameResetEvent) => {
      try {
        console.log('[Socket] Game reset:', data);
        // Room update will handle the actual state update
        // This event is mainly for notifications
      } catch (error) {
        console.error('[Socket] Error processing game_reset:', error);
      }
    });

    // ===========================
    // CLEANUP
    // ===========================

    return () => {
      console.log('[Socket] Cleaning up and disconnecting');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('reconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect_error');
      socket.off('reconnect_failed');
      socket.off('room_update');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_started');
      socket.off('number_called');
      socket.off('game_finished');
      socket.off('error');
      socket.off('tickets_generated');
      socket.off('caller_mode_changed');
      socket.off('caller_changed');
      socket.off('marking_mode_changed');
      socket.off('game_reset');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Empty deps - only run once on mount

  // ===========================
  // CLIENT ACTIONS (EMIT EVENTS)
  // ===========================

  /**
   * 1. Create a new room
   */
  const createRoom = (playerName: string, cardCount: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    console.log('[Socket] Creating room:', { playerName, cardCount });

    // Set flag and card count for auto-generation on room_update
    needsTicketsRef.current = true;
    pendingCardCountRef.current = cardCount;

    socket.emit('create_room', {
      playerName,
      callerMode: 'machine' as CallerMode,
      machineInterval: 3000,
    });
  };

  /**
   * 2. Join an existing room
   */
  const joinRoom = (roomId: string, playerName: string, cardCount: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    console.log('[Socket] Joining room:', { roomId, playerName, cardCount });

    // Set flag and card count for auto-generation on room_update
    needsTicketsRef.current = true;
    pendingCardCountRef.current = cardCount;

    socket.emit('join_room', {
      roomId,
      playerName,
    });
  };

  /**
   * 3. Start the game (host only)
   */
  const startGame = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Starting game:', { roomId });
    socket.emit('start_game', {
      roomId,
    });
  };

  /**
   * 4. Call a number (manual mode only)
   */
  const callNumber = (number: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Calling number:', { roomId, number });
    socket.emit('call_number', {
      roomId,
      number,
    });
  };

  /**
   * 5. Claim a win
   */
  const claimWin = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Claiming win:', { roomId });
    // Note: The client should determine which ticket/board won
    // For now, we'll send a simple claim and let the server validate
    socket.emit('claim_win', {
      roomId,
      ticketIndex: 0,
      boardIndex: 0,
      type: 'row' as const,
    });
  };

  /**
   * 6. Generate tickets for the player
   */
  const generateTickets = (cardCount: number, boardsPerCard: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Generating tickets:', { roomId, cardCount, boardsPerCard });
    socket.emit('generate_tickets', {
      roomId,
      cardCount,
      boardsPerCard: boardsPerCard as 1 | 2 | 3,
    });
  };

  /**
   * 7. Leave the current room
   */
  const leaveRoom = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Leaving room:', { roomId });
    socket.emit('leave_room', {
      roomId,
    });

    // Reset local state
    setRoom(null);
    setCurrentPlayerId(null);
  };

  /**
   * 8. Kick a player from the room (host only)
   */
  const kickPlayer = (playerId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Kicking player:', { roomId, playerId });
    socket.emit('kick_player', {
      roomId,
      playerId,
    });
  };

  /**
   * 9. Change caller mode (host only)
   */
  const changeCallerMode = (mode: CallerMode) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Changing caller mode:', { roomId, mode });
    socket.emit('change_caller_mode', {
      roomId,
      callerMode: mode,
      machineInterval: mode === 'machine' ? 3000 : undefined,
    });
  };

  /**
   * 10. Change caller (host only)
   */
  const changeCaller = (targetPlayerId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Changing caller:', { roomId, targetPlayerId });
    socket.emit('change_caller', {
      roomId,
      targetPlayerId,
    });
  };

  /**
   * 11. Change marking mode (host only)
   */
  const changeMarkingMode = (manualMarkingMode: boolean) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Changing marking mode:', { roomId, manualMarkingMode });
    socket.emit('change_marking_mode', {
      roomId,
      manualMarkingMode,
    });
  };

  /**
   * 12. Reset game (host only)
   */
  const resetGame = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    if (!roomId) {
      setError('Not in a room');
      return;
    }

    console.log('[Socket] Resetting game:', { roomId });
    socket.emit('reset_game', {
      roomId,
    });
  };

  // ===========================
  // RETURN HOOK INTERFACE
  // ===========================

  return {
    connected,
    connecting,
    createRoom,
    joinRoom,
    startGame,
    callNumber,
    claimWin,
    generateTickets,
    leaveRoom,
    kickPlayer,
    changeCallerMode,
    changeCaller,
    changeMarkingMode,
    resetGame,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useSocket;
