/**
 * PlayerList Component - Display All Players in Room
 *
 * Displays all players in the game room with:
 * - List of all players with PlayerCard components
 * - Host badge (crown icon)
 * - Caller badge (microphone icon)
 * - Connection status indicators
 * - Number of cards each player has
 * - Kick button for each player (host only, can't kick self)
 * - Responsive list layout
 * - Empty state when no players
 *
 * Features:
 * - Integrates with Zustand store (usePlayers, useCurrentPlayerId, useIsHost)
 * - Integrates with useSocket() for kick action
 * - Traditional Vietnamese styling
 * - Responsive design (grid on desktop, stack on mobile)
 * - Accessibility (ARIA labels, semantic HTML)
 * - Animations with Framer Motion
 */

'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { usePlayers, useCurrentPlayerId, useIsHost } from '@/store/useGameStore';
import { useSocket } from '@/providers/SocketProvider';
import { PlayerCard } from './PlayerCard';

// ============================================================================
// PROPS
// ============================================================================

interface PlayerListProps {
  /** Optional className for styling */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PlayerList = memo(function PlayerList({
  className = '',
}: PlayerListProps) {
  // Get data from store
  const players = usePlayers();
  const currentPlayerId = useCurrentPlayerId();
  const isHost = useIsHost();

  // Get socket actions
  const { kickPlayer } = useSocket();

  /**
   * Handle kick player action
   */
  const handleKick = useCallback((playerId: string) => {
    // Confirm before kicking
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn đuổi ${player.name} khỏi phòng?`
    );

    if (confirmed) {
      kickPlayer(playerId);
    }
  }, [players, kickPlayer]);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Empty state
  if (players.length === 0) {
    return (
      <div className={`${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex flex-col items-center justify-center py-12 px-4 text-center bg-paper rounded-xl border-2 border-dashed border-gray-300"
        >
          <Users className="w-16 h-16 text-gray-300 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-bold text-gray-400 mb-2">
            Chưa có người chơi
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Hãy mời bạn bè tham gia phòng để bắt đầu chơi!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${className}`} role="region" aria-label="Player list">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-loto-green" aria-hidden="true" />
          <h3 className="text-lg font-bold text-gray-800">
            Người chơi
          </h3>
          <span
            className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-bold text-white bg-loto-green rounded-full"
            aria-label={`${players.length} players`}
          >
            {players.length}
          </span>
        </div>
      </div>

      {/* Player list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div
              key={player.id}
              variants={itemVariants}
              layout
              exit="exit"
            >
              <PlayerCard
                player={player}
                isCurrentUserHost={isHost}
                isCurrentUser={player.id === currentPlayerId}
                onKick={handleKick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Help text for host */}
      {isHost && players.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
          role="note"
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 text-sm text-blue-800">
              <p className="font-semibold mb-1">Bạn là chủ phòng</p>
              <p className="text-blue-700">
                Bạn có thể đuổi người chơi khỏi phòng bằng cách nhấn nút đuổi bên cạnh tên của họ.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Responsive layout info */}
      <div className="sr-only" aria-live="polite">
        {players.length} người chơi trong phòng
      </div>
    </div>
  );
});
