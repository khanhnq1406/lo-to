/**
 * RoomInfo Component - Room ID and Information Display
 *
 * Displays room information including:
 * - Room ID (large, prominent display)
 * - Player count (X/16 players)
 * - Game state indicator (Waiting/Playing/Finished)
 * - Created time (relative or formatted)
 * - Share button integration
 *
 * Features:
 * - Traditional Vietnamese styling
 * - Responsive layout
 * - Visual status indicators with colors
 * - Accessibility (ARIA labels)
 * - Time formatting utilities
 */

'use client';

import { memo, useMemo } from 'react';
import { Users, Clock, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GameState } from '@/types';
import { ShareButton } from './ShareButton';

// ============================================================================
// PROPS
// ============================================================================

interface RoomInfoProps {
  /** Unique room ID */
  roomId: string;

  /** Current number of players in room */
  playerCount: number;

  /** Maximum allowed players (default: 16) */
  maxPlayers?: number;

  /** Current game state */
  gameState: GameState;

  /** Room creation timestamp */
  createdAt: Date;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format relative time (e.g., "2 phút trước")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

/**
 * Get game state display text and color
 */
function getGameStateInfo(state: GameState): { text: string; color: string; bgColor: string } {
  switch (state) {
    case 'waiting':
      return {
        text: 'Đang chờ',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100 border-yellow-500',
      };
    case 'playing':
      return {
        text: 'Đang chơi',
        color: 'text-green-700',
        bgColor: 'bg-green-100 border-green-500',
      };
    case 'finished':
      return {
        text: 'Đã kết thúc',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100 border-gray-500',
      };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RoomInfo = memo(function RoomInfo({
  roomId,
  playerCount,
  maxPlayers = 16,
  gameState,
  createdAt,
}: RoomInfoProps) {
  // Format relative time
  const relativeTime = useMemo(() => formatRelativeTime(createdAt), [createdAt]);

  // Get game state styling
  const stateInfo = getGameStateInfo(gameState);

  // Check if room is full
  const isFull = playerCount >= maxPlayers;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative bg-gradient-to-br from-paper via-paper-dark to-paper p-6 rounded-xl border-2 border-loto-green shadow-lg"
      role="region"
      aria-label="Room information"
    >
      {/* Room ID */}
      <div className="relative z-10 mb-4 text-center">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">
          Mã phòng
        </h2>
        <div
          className="inline-block px-6 py-3 bg-white rounded-lg border-2 border-loto-gold shadow-sm"
          role="text"
          aria-label={`Room ID: ${roomId}`}
        >
          <span className="text-3xl sm:text-4xl font-black text-loto-gold-dark tracking-wider font-mono">
            {roomId}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Player count */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-loto-green/10 rounded-full">
            <Users className="w-4 h-4 text-loto-green" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600">Người chơi</p>
            <p
              className={`text-lg font-bold ${isFull ? 'text-red-600' : 'text-loto-green'}`}
              aria-label={`${playerCount} out of ${maxPlayers} players`}
            >
              {playerCount}/{maxPlayers}
            </p>
          </div>
        </div>

        {/* Game state */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${stateInfo.bgColor} rounded-full border`}>
            {gameState === 'finished' ? (
              <Trophy className="w-4 h-4 text-gray-700" aria-hidden="true" />
            ) : (
              <div className={`w-3 h-3 rounded-full ${gameState === 'playing' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600">Trạng thái</p>
            <p className={`text-lg font-bold ${stateInfo.color}`} aria-label={`Game state: ${stateInfo.text}`}>
              {stateInfo.text}
            </p>
          </div>
        </div>

        {/* Created time */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
            <Clock className="w-4 h-4 text-gray-600" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600">Tạo lúc</p>
            <p
              className="text-sm font-semibold text-gray-700 truncate"
              title={createdAt.toLocaleString('vi-VN')}
              aria-label={`Created ${relativeTime}`}
            >
              {relativeTime}
            </p>
          </div>
        </div>
      </div>

      {/* Share button */}
      <div className="relative z-10 flex justify-center">
        <ShareButton roomId={roomId} className="w-full sm:w-auto" />
      </div>

      {/* Decorative border effect */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%, rgba(46,125,50,0.1) 100%)',
        }}
      />
    </motion.div>
  );
});
