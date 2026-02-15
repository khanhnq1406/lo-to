/**
 * PlayerCard Component - Individual Player Display
 *
 * Displays a single player's information including:
 * - Player name
 * - Host badge (crown icon)
 * - Caller badge (microphone icon)
 * - Connection status (green/red indicator)
 * - Number of cards owned
 * - Kick button (host only, cannot kick self)
 *
 * Features:
 * - Traditional Vietnamese styling
 * - Responsive layout
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Conditional rendering based on permissions
 */

'use client';

import { memo } from 'react';
import { Crown, Mic, Wifi, WifiOff, UserX } from 'lucide-react';
import type { Player } from '@/types';

// ============================================================================
// PROPS
// ============================================================================

interface PlayerCardProps {
  /** Player information */
  player: Player;

  /** Is the current user the host? */
  isCurrentUserHost: boolean;

  /** Is this the current user's player card? */
  isCurrentUser: boolean;

  /** Callback when kick button is clicked */
  onKick?: (playerId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const PlayerCard = memo(function PlayerCard({
  player,
  isCurrentUserHost,
  isCurrentUser,
  onKick,
}: PlayerCardProps) {
  // Can only kick if: user is host AND not kicking themselves
  const canKick = isCurrentUserHost && !isCurrentUser;

  return (
    <div
      className={`
        relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all
        ${isCurrentUser
          ? 'bg-gradient-to-r from-loto-gold/10 via-loto-gold-light/10 to-loto-gold/10 border-loto-gold'
          : 'bg-paper border-loto-green/20 hover:border-loto-green/40'
        }
        ${!player.connected ? 'opacity-60' : ''}
      `}
      role="article"
      aria-label={`Player ${player.name}`}
    >
      {/* Connection status indicator */}
      <div
        className="flex-shrink-0 w-3 h-3 rounded-full"
        aria-label={player.connected ? 'Connected' : 'Disconnected'}
      >
        {player.connected ? (
          <Wifi className="w-3 h-3 text-green-500" aria-hidden="true" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" aria-hidden="true" />
        )}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Player name */}
          <span
            className={`
              font-semibold truncate
              ${isCurrentUser ? 'text-loto-gold-dark' : 'text-gray-800'}
            `}
            title={player.name}
          >
            {player.name}
          </span>

          {/* Badges */}
          <div className="flex items-center gap-1">
            {/* Host badge */}
            {player.isHost && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-loto-gold-dark bg-loto-gold/20 rounded-full border border-loto-gold"
                role="status"
                aria-label="Host"
              >
                <Crown className="w-3 h-3" aria-hidden="true" />
                <span>Chủ phòng</span>
              </span>
            )}

            {/* Caller badge */}
            {player.isCaller && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-loto-green bg-loto-green/10 rounded-full border border-loto-green"
                role="status"
                aria-label="Caller"
              >
                <Mic className="w-3 h-3" aria-hidden="true" />
                <span>Gọi số</span>
              </span>
            )}
          </div>
        </div>

        {/* Card count */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600">
          <span>Số thẻ:</span>
          <span className="font-bold text-loto-green">
            {player.tickets.length}
          </span>
        </div>
      </div>

      {/* Kick button (host only, can't kick self) */}
      {canKick && (
        <button
          onClick={() => onKick?.(player.id)}
          className="
            flex-shrink-0 p-2 rounded-lg
            text-red-600 hover:text-red-700
            hover:bg-red-50
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          "
          aria-label={`Kick ${player.name}`}
          title={`Đuổi ${player.name} khỏi phòng`}
        >
          <UserX className="w-4 h-4" aria-hidden="true" />
        </button>
      )}

      {/* Current user indicator */}
      {isCurrentUser && (
        <div
          className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold text-white bg-loto-gold rounded-full border-2 border-white shadow-md"
          role="status"
          aria-label="You"
        >
          Bạn
        </div>
      )}
    </div>
  );
});
