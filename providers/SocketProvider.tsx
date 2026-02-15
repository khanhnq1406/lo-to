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

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  connecting: boolean;
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

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnectingState] = useState(false);
  const hasInitialized = useRef(false);

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

    console.log('[Socket Provider] Connecting to:', socketUrl);
    setConnectingState(true);
    setConnecting(true);

    // Connection event listeners
    socket.on('connect', () => {
      console.log('[Socket Provider] Connected:', socket.id);
      setConnected(true);
      setConnectingState(false);
      setConnecting(false);
      setCurrentPlayerId(socket.id || null);
      clearError();
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket Provider] Connection error:', error);
      setConnected(false);
      setConnectingState(false);
      setConnecting(false);
      setError('Failed to connect to server.');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket Provider] Disconnected:', reason);
      setConnected(false);
    });

    // Game event listeners
    socket.on('room_update', (data) => {
      console.log('[Socket Provider] Room update received');
      setRoom(deserializeRoom(data.room));
    });

    socket.on('player_joined', (data) => {
      console.log('[Socket Provider] Player joined:', data.playerName);
    });

    socket.on('player_left', (data) => {
      console.log('[Socket Provider] Player left:', data.playerId);
      removePlayer(data.playerId);
    });

    socket.on('game_started', () => {
      console.log('[Socket Provider] Game started');
      setGameState('playing');
    });

    socket.on('number_called', (data) => {
      console.log('[Socket Provider] Number called:', data.number);
      addCalledNumber(data.number);
      setCurrentNumber(data.number);
    });

    socket.on('game_finished', (data) => {
      console.log('[Socket Provider] Game finished. Winner:', data.winner.playerName);
      setWinner(data.winner);
      setGameState('finished');
    });

    socket.on('game_reset', (data) => {
      console.log('[Socket Provider] Game reset in room:', data.roomId);
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
      console.log('[Socket Provider] Tickets generated:', data.tickets.length, 'cards');
      // Only update if this is for the current player
      if (socket.id === data.playerId) {
        setPlayerCards(data.tickets);
      }
    });

    socket.on('caller_mode_changed', (data) => {
      console.log('[Socket Provider] Caller mode changed:', data.mode);
    });

    socket.on('caller_changed', (data) => {
      console.log('[Socket Provider] Caller changed from', data.oldCallerName, 'to', data.newCallerName);
    });

    socket.on('marking_mode_changed', (data) => {
      console.log('[Socket Provider] Marking mode changed to:', data.manualMarkingMode);
    });

    // Cleanup on unmount
    return () => {
      console.log('[Socket Provider] Cleaning up');
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

    console.log('[Socket Provider] Creating room:', { playerName, cardCount });
    socket.emit('create_room', { playerName, cardCount, callerMode: 'machine' as CallerMode });
  };

  const joinRoom = (roomId: string, playerName: string, cardCount: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      return;
    }

    console.log('[Socket Provider] Joining room:', { roomId, playerName, cardCount });
    socket.emit('join_room', { roomId, playerName, cardCount });
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

    console.log('[Socket Provider] Starting game');
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

    console.log('[Socket Provider] Calling number:', number);
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

    console.log('[Socket Provider] Claiming win');
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

    console.log('[Socket Provider] Generating tickets:', { roomId, cardCount, boardsPerCard });
    socket.emit('generate_tickets', { roomId, cardCount, boardsPerCard });
  };

  const leaveRoom = () => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    if (!roomId) return;

    console.log('[Socket Provider] Leaving room');
    socket.emit('leave_room', { roomId });
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

    console.log('[Socket Provider] Kicking player:', playerId);
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

    console.log('[Socket Provider] Changing caller mode:', mode, 'interval:', interval);
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

    console.log('[Socket Provider] Changing caller to:', targetPlayerId);
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

    console.log('[Socket Provider] Changing marking mode to:', manualMarkingMode);
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

    console.log('[Socket Provider] Resetting game');
    socket.emit('reset_game', { roomId });
  };

  const value: SocketContextValue = {
    socket: socketRef.current,
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

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
