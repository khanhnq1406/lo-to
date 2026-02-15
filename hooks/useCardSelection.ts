/**
 * useCardSelection Hook - Client-side card selection management
 * Handles socket events for selecting/deselecting cards
 */

'use client';

import { useCallback } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useRoomId } from '@/store/useGameStore';

export function useCardSelection() {
  const { socket } = useSocket();
  const roomId = useRoomId();

  /**
   * Select a card
   */
  const selectCard = useCallback(
    (cardId: number) => {
      if (!socket || !roomId) {
        console.error('Cannot select card: no socket or room');
        return;
      }

      console.log('[CardSelection] Selecting card:', cardId);
      socket.emit('select_card', {
        roomId,
        cardId,
      });
    },
    [socket, roomId]
  );

  /**
   * Deselect a specific card
   */
  const deselectCard = useCallback((cardId: number) => {
    if (!socket || !roomId) {
      console.error('Cannot deselect card: no socket or room');
      return;
    }

    console.log('[CardSelection] Deselecting card:', cardId);
    socket.emit('deselect_card', {
      roomId,
      cardId,
    });
  }, [socket, roomId]);

  return {
    selectCard,
    deselectCard,
  };
}
