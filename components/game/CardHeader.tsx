/**
 * CardHeader Component - Header for Vietnamese Lô Tô card
 *
 * Displays:
 * - Card number/title ("Card 1", "Card 2", etc.)
 * - Win status indicator (if any row is won)
 * - Optional card statistics
 *
 * Features:
 * - Compact design to not take space from card
 * - Winning state animation
 * - Responsive text sizing
 */

"use client";

import { memo } from "react";
import { motion } from "framer-motion";

// ============================================================================
// PROPS
// ============================================================================

interface CardHeaderProps {
  /** Card index (0-based) */
  cardIndex: number;

  /** Is this card a winning card? */
  isWinning?: boolean;

  /** Which row won (0-2)? Only set if isWinning is true */
  winningRow?: number;

  /** Total numbers on this card */
  totalNumbers?: number;

  /** How many numbers have been called on this card */
  calledNumbers?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CardHeader = memo(function CardHeader({
  cardIndex,
  isWinning = false,
  winningRow,
  totalNumbers = 15,
  calledNumbers = 0,
}: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      {/* Card title */}
      <h3 className="text-sm sm:text-base md:text-lg font-bold text-loto-green">
        Phiếu dò {cardIndex + 1}
      </h3>

      {/* Win indicator or progress */}
      <div className="flex items-center gap-2">
        {isWinning && winningRow !== undefined ? (
          <motion.div
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-loto-gold via-loto-gold-light to-loto-gold rounded-full border-2 border-loto-gold-dark"
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <motion.svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-loto-green"
              fill="currentColor"
              viewBox="0 0 20 20"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </motion.svg>
            <span className="text-xs sm:text-sm font-bold text-loto-green">
              Dòng {winningRow + 1} thắng!
            </span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
            <span className="font-semibold text-loto-green">
              {calledNumbers}
            </span>
            <span>/</span>
            <span className="text-gray-500">{totalNumbers}</span>
          </div>
        )}
      </div>
    </div>
  );
});
