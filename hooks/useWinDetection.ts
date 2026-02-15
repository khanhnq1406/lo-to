/**
 * Win Detection Hook
 * Automatic win detection for player's cards
 *
 * FEATURES:
 * - Monitors called numbers for wins
 * - Checks player's cards after each number called
 * - Auto-claims win via Socket.io when detected
 * - Prevents duplicate claims
 * - Only active during 'playing' game state
 *
 * USAGE:
 * ```tsx
 * const { hasWon, winResult } = useWinDetection();
 *
 * if (hasWon) {
 *   console.log('You won!', winResult);
 * }
 * ```
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { detectWin, type CardWinResult } from '@/lib/winDetection';

/**
 * Hook return interface
 */
export interface UseWinDetectionReturn {
  /** Whether the current player has won */
  hasWon: boolean;

  /** Detailed win result if won */
  winResult: CardWinResult | null;

  /** Whether a claim is currently being processed */
  claiming: boolean;
}

/**
 * Hook for automatic win detection
 * Monitors the game state and automatically claims wins
 *
 * @param socket - Socket.io instance for emitting win claims
 * @returns Win detection state
 */
export function useWinDetection(
  socket?: {
    emit: (event: string, data: unknown) => void;
    connected: boolean;
  }
): UseWinDetectionReturn {
  // Local state for win tracking
  const [hasWon, setHasWon] = useState(false);
  const [winResult, setWinResult] = useState<CardWinResult | null>(null);
  const [claiming, setClaiming] = useState(false);

  // Track if we've already claimed (prevent duplicates)
  const claimedRef = useRef(false);

  // Get game state from store
  const room = useGameStore((state) => state.room);
  const currentPlayerId = useGameStore((state) => state.currentPlayerId);
  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());
  const gameState = room?.gameState;
  const calledHistory = room?.calledHistory || [];
  const winner = room?.winner;

  // Check for wins whenever called numbers change
  useEffect(() => {
    // Only check during 'playing' state
    if (gameState !== 'playing') {
      return;
    }

    // Skip if no player or no cards
    if (!currentPlayer || !currentPlayer.tickets || currentPlayer.tickets.length === 0) {
      return;
    }

    // Skip if already claimed
    if (claimedRef.current) {
      return;
    }

    // Skip if game already has a winner
    if (winner) {
      return;
    }

    // Convert called history to Set for efficient lookup
    const calledNumbers = new Set(calledHistory);

    // Check for wins
    const win = detectWin(currentPlayer.tickets, calledNumbers);

    if (win) {
      console.log('[WinDetection] Win detected:', win);

      // Update local state
      setHasWon(true);
      setWinResult(win);

      // Auto-claim the win
      claimWin(win);
    }
  }, [calledHistory, gameState, currentPlayer, winner]);

  // Reset when game state changes
  useEffect(() => {
    if (gameState === 'waiting' || gameState === 'finished') {
      // Reset state
      setHasWon(false);
      setWinResult(null);
      setClaiming(false);
      claimedRef.current = false;
    }
  }, [gameState]);

  // Reset when winner is declared
  useEffect(() => {
    if (winner) {
      setClaiming(false);
    }
  }, [winner]);

  /**
   * Claims a win by emitting to the server
   */
  const claimWin = (win: CardWinResult) => {
    // Prevent duplicate claims
    if (claimedRef.current) {
      console.log('[WinDetection] Already claimed, skipping');
      return;
    }

    // Check if socket is available and connected
    if (!socket || !socket.connected) {
      console.error('[WinDetection] Socket not connected, cannot claim win');
      return;
    }

    // Check if we have player info
    if (!currentPlayerId || !currentPlayer) {
      console.error('[WinDetection] No current player, cannot claim win');
      return;
    }

    // Check if we have room
    if (!room) {
      console.error('[WinDetection] No room, cannot claim win');
      return;
    }

    // Mark as claimed to prevent duplicates
    claimedRef.current = true;
    setClaiming(true);

    console.log('[WinDetection] Claiming win:', win);

    // Emit win claim to server
    socket.emit('claim_win', {
      roomId: room.id,
      ticketIndex: win.cardIndex,
      boardIndex: 0,
      type: win.type,
    });

    console.log('[WinDetection] Win claimed successfully');
  };

  return {
    hasWon,
    winResult,
    claiming,
  };
}

/**
 * Default export
 */
export default useWinDetection;
