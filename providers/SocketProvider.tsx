/**
 * Socket Provider - Single Socket.io connection for entire app
 * Prevents multiple socket connections and handles HMR properly
 */

'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/useGameStore';
import { getSocketUrl, socketOptions } from '@/lib/socket-config';
import type { CallerMode } from '@/types';
import { deserializeRoom } from '@/types';
import {
  getSession,
  saveSession,
  clearSession,
  updateSessionPlayerId,
  generateSessionId,
  type PlayerSession,
} from '@/lib/session-storage';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
  isReconnecting: boolean;
  createRoom: (playerName: string, cardCount: number) => void;
  joinRoom: (roomId: string, playerName: string, cardCount: number) => void;
  startGame: () => void;
  callNumber: (number: number) => void;
  claimWin: () => void;
  generateTickets: (cardCount: number, boardsPerCard: number) => void;
  leaveRoom: () => void;
  kickPlayer: (playerId: string) => void;
  changeCallerMode: (mode: CallerMode, interval?: number) => void;
  changeCaller: (targetPlayerId: string) => void;
  changeMarkingMode: (manualMarkingMode: boolean) => void;
  changeVisibilitySettings: (showCurrentNumber?: boolean, showHistory?: boolean) => void;
  resetGame: () => void;
  renamePlayer: (newName: string) => void;
  pauseMachine: () => void;
  resumeMachine: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnectingState] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const hasInitialized = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const isReconnectingRef = useRef(false);

  // Zustand actions
  const setRoom = useGameStore((state) => state.setRoom);
  const removePlayer = useGameStore((state) => state.removePlayer);
  const setGameState = useGameStore((state) => state.setGameState);
  const addCalledNumber = useGameStore((state) => state.addCalledNumber);
  const setCurrentNumber = useGameStore((state) => state.setCurrentNumber);
  const setWinner = useGameStore((state) => state.setWinner);
  const setError = useGameStore((state) => state.setError);
  const clearError = useGameStore((state) => state.clearError);
  const setPlayerCards = useGameStore((state) => state.setPlayerCards);
  const setCurrentPlayerId = useGameStore((state) => state.setCurrentPlayerId);
  const setConnecting = useGameStore((state) => state.setConnecting);
  const roomId = useGameStore((state) => state.room?.id || null);

  useEffect(() => {
    // Prevent multiple initializations (HMR protection)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Only run on client side
    if (typeof window === 'undefined') return;

    // Create socket connection
    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, socketOptions);
    socketRef.current = socket;

    setConnectingState(true);
    setConnecting(true);

    // Connection event listeners
    socket.on('connect', () => {
      setConnected(true);
      setConnectingState(false);
      setConnecting(false);
      setCurrentPlayerId(socket.id || null);
      clearError();

      // Check for existing session and attempt reconnection
      const existingSession = getSession();
      if (existingSession && !isReconnectingRef.current) {
        isReconnectingRef.current = true;
        setIsReconnecting(true);

        // Emit reconnect event to server
        socket.emit('reconnect_session', {
          sessionId: existingSession.sessionId,
          roomId: existingSession.roomId,
          oldPlayerId: existingSession.playerId,
          playerName: existingSession.playerName,
        });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket Provider] Connection error:', error);
      setConnected(false);
      setConnectingState(false);
      setConnecting(false);
      setError('Failed to connect to server.');
    });

    socket.on('disconnect', (_reason) => {
      setConnected(false);
    });

    // Game event listeners
    socket.on('room_update', (data) => {
      const room = deserializeRoom(data.room);
      setRoom(room);

      // Always ensure currentPlayerId is set to socket.id when room updates
      if (socket.id) {
        setCurrentPlayerId(socket.id);
      }

      // Update session with current room data if player is in the room
      if (socket.id && room && sessionIdRef.current) {
        const currentPlayer = room.players.find((p) => p.id === socket.id);
        if (currentPlayer) {
          const session: PlayerSession = {
            sessionId: sessionIdRef.current,
            playerId: socket.id,
            playerName: currentPlayer.name,
            roomId: room.id,
            timestamp: Date.now(),
          };
          saveSession(session);
        }
      }
    });

    socket.on('player_joined', (_data) => {
    });

    socket.on('player_left', (data) => {
      removePlayer(data.playerId);
    });

    socket.on('game_started', () => {
      setGameState('playing');
    });

    socket.on('number_called', (data) => {
      addCalledNumber(data.number);
      setCurrentNumber(data.number);
    });

    socket.on('game_finished', (data) => {
      setWinner(data.winner);
      setGameState('finished');
    });

    socket.on('game_reset', (_data) => {
      setGameState('waiting');
      setWinner(null);
      setCurrentNumber(null);
      // Room update will handle clearing called history
    });

    socket.on('error', (data) => {
      console.error('[Socket Provider] Error:', data.message);
      setError(data.message);
      setTimeout(clearError, 5000);
    });

    socket.on('tickets_generated', (data) => {
      // Only update if this is for the current player
      if (socket.id === data.playerId) {
        setPlayerCards(data.tickets);
      }
    });

    socket.on('caller_mode_changed', (_data) => {
    });

    socket.on('caller_changed', (_data) => {
    });

    socket.on('marking_mode_changed', (_data) => {
    });

    socket.on('player_renamed', (_data) => {
    });

    socket.on('machine_paused', (_data) => {
      // Room update will handle state change
    });

    socket.on('machine_resumed', (_data) => {
      // Room update will handle state change
    });

    // Session reconnection success
    socket.on('session_reconnected', () => {
      isReconnectingRef.current = false;
      setIsReconnecting(false);

      // Update session with new socket ID
      if (socket.id) {
        updateSessionPlayerId(socket.id);
      }

      // Room update will be sent automatically by server
    });

    // Session reconnection failed
    socket.on('session_reconnect_failed', (_data) => {
      isReconnectingRef.current = false;
      setIsReconnecting(false);

      // Clear invalid session
      clearSession();
      sessionIdRef.current = null;
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
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
      socket.off('player_renamed');
      socket.off('session_reconnected');
      socket.off('session_reconnect_failed');
      socket.disconnect();
      socketRef.current = null;
      hasInitialized.current = false;
    };
  }, []); // Only run once

  // Action functions
  const createRoom = (playerName: string, cardCount: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    // Generate new session ID
    const newSessionId = generateSessionId();
    sessionIdRef.current = newSessionId;

    socket.emit('create_room', {
      playerName,
      cardCount,
      callerMode: 'machine' as CallerMode,
      sessionId: newSessionId,
    });
  };

  const joinRoom = (roomId: string, playerName: string, cardCount: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    // Generate new session ID
    const newSessionId = generateSessionId();
    sessionIdRef.current = newSessionId;

    socket.emit('join_room', {
      roomId,
      playerName,
      cardCount,
      sessionId: newSessionId,
    });
  };

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

    socket.emit('start_game', { roomId });
  };

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

    socket.emit('call_number', { roomId, number });
  };

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

    socket.emit('claim_win', { roomId });
  };

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

    socket.emit('generate_tickets', { roomId, cardCount, boardsPerCard });
  };

  const leaveRoom = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    if (!roomId) return;

    socket.emit('leave_room', { roomId });

    // Clear session when leaving room
    clearSession();
    sessionIdRef.current = null;
  };

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

    socket.emit('kick_player', { roomId, playerId });
  };

  const changeCallerMode = (mode: CallerMode, interval?: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }
    if (!roomId) {
      setError('Not in a room');
      return;
    }

    socket.emit('change_caller_mode', { roomId, callerMode: mode, machineInterval: interval });
  };

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

    socket.emit('change_caller', { roomId, targetPlayerId });
  };

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

    socket.emit('change_marking_mode', { roomId, manualMarkingMode });
  };

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

    socket.emit('reset_game', { roomId });
  };

  const renamePlayer = (newName: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }
    if (!roomId) {
      setError('Not in a room');
      return;
    }

    socket.emit('rename_player', { roomId, newName });
  };

  const changeVisibilitySettings = (showCurrentNumber?: boolean, showHistory?: boolean) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }
    if (!roomId) {
      setError('Not in a room');
      return;
    }

    socket.emit('change_visibility_settings', { roomId, showCurrentNumber, showHistory });
  };

  const pauseMachine = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }
    if (!roomId) {
      setError('Not in a room');
      return;
    }

    socket.emit('pause_machine', { roomId });
  };

  const resumeMachine = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }
    if (!roomId) {
      setError('Not in a room');
      return;
    }

    socket.emit('resume_machine', { roomId });
  };

  const value: SocketContextValue = {
    socket: socketRef.current,
    connected,
    connecting,
    isReconnecting,
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
    changeVisibilitySettings,
    resetGame,
    renamePlayer,
    pauseMachine,
    resumeMachine,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
