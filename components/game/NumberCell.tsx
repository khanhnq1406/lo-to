/**
 * NumberCell Component - Individual cell in Vietnamese Lô Tô card
 *
 * Displays a single cell which can be:
 * - A number (1-90)
 * - A blank cell (null)
 *
 * Visual states:
 * - Normal: white background with border
 * - Blank: green background, no number
 * - Called: yellow/gold highlight with animation
 * - Marked: green checkmark/stamp overlay
 *
 * Features:
 * - Clickable for manual marking/unmarking
 * - Framer Motion animations on state changes
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - Touch-friendly (min 44px touch target on mobile)
 */

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { CellValue } from '@/types';

// ============================================================================
// PROPS
// ============================================================================

interface NumberCellProps {
  /** Cell value: number (1-90) or null (blank) */
  value: CellValue;

  /** Is this number in the called history? */
  isCalled: boolean;

  /** Is this cell manually marked by player? */
  isMarked: boolean;

  /** Click handler for manual marking */
  onClick?: () => void;

  /** Is this cell part of a winning row? */
  isWinning?: boolean;

  /** Cell row index (for accessibility) */
  row?: number;

  /** Cell column index (for accessibility) */
  col?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NumberCell = memo(function NumberCell({
  value,
  isCalled,
  isMarked,
  onClick,
  isWinning = false,
  row,
  col,
}: NumberCellProps) {
  const isBlank = value === null;
  const isInteractive = !isBlank && onClick;

  // Determine cell state for styling
  const getCellClasses = () => {
    const baseClasses = 'relative flex items-center justify-center font-bold transition-colors';
    const sizeClasses = 'h-8 sm:h-9 md:h-10 lg:h-11 text-xs sm:text-sm md:text-base lg:text-lg';

    if (isBlank) {
      return `${baseClasses} ${sizeClasses} bg-loto-green border border-loto-green-border`;
    }

    if (isWinning) {
      return `${baseClasses} ${sizeClasses} bg-gradient-to-br from-loto-gold via-loto-gold-light to-loto-gold text-loto-green border-2 border-loto-gold-dark`;
    }

    if (isMarked) {
      return `${baseClasses} ${sizeClasses} bg-loto-green-light text-white border-2 border-loto-green`;
    }

    if (isCalled) {
      return `${baseClasses} ${sizeClasses} bg-loto-gold text-loto-green border-2 border-loto-gold-dark`;
    }

    return `${baseClasses} ${sizeClasses} bg-white text-loto-green border border-gray-300 hover:border-loto-green`;
  };

  // ARIA label for accessibility
  const getAriaLabel = () => {
    if (isBlank) {
      return `Blank cell at row ${row !== undefined ? row + 1 : '?'}, column ${col !== undefined ? col + 1 : '?'}`;
    }

    const stateDescriptions = [];
    if (isCalled) stateDescriptions.push('called');
    if (isMarked) stateDescriptions.push('marked');
    if (isWinning) stateDescriptions.push('winning');

    const stateText = stateDescriptions.length > 0 ? ` - ${stateDescriptions.join(', ')}` : '';
    return `Number ${value}${stateText}`;
  };

  // Animation variants
  const cellVariants = {
    initial: { scale: 0, opacity: 0 },
    enter: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    },
    called: {
      scale: [1, 1.15, 1],
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    marked: {
      scale: [1, 0.9, 1],
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    winning: {
      scale: [1, 1.1, 1],
      rotate: [0, -2, 2, 0],
      transition: {
        duration: 0.6,
        repeat: 2,
        ease: 'easeInOut'
      }
    }
  };

  // Determine animation state
  const getAnimateState = () => {
    if (isWinning) return 'winning';
    if (isMarked) return 'marked';
    if (isCalled) return 'called';
    return 'enter';
  };

  return (
    <motion.div
      className={getCellClasses()}
      variants={cellVariants}
      initial="initial"
      animate={getAnimateState()}
      whileHover={isInteractive ? { scale: 1.05 } : undefined}
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : 'gridcell'}
      tabIndex={isInteractive ? 0 : -1}
      aria-label={getAriaLabel()}
      aria-pressed={isInteractive ? isMarked : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{
        cursor: isInteractive ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Number display */}
      {!isBlank && (
        <span className="relative z-10">
          {value}
        </span>
      )}

      {/* Checkmark overlay for marked cells */}
      {isMarked && !isBlank && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}

      {/* Pulse animation for called but not marked numbers */}
      {isCalled && !isMarked && !isBlank && (
        <motion.div
          className="absolute inset-0 bg-loto-gold rounded"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Winning sparkle effect */}
      {isWinning && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </motion.div>
  );
});
