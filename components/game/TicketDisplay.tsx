/**
 * TicketDisplay Component - Container for displaying player's multiple cards
 *
 * Displays all cards a player is playing with in a responsive layout:
 * - Desktop (lg+): Up to 3 cards per row
 * - Tablet (md): 2 cards per row
 * - Mobile (sm): Stacked vertically (1 per row)
 *
 * Features:
 * - Responsive grid layout
 * - Auto-marking when numbers are called
 * - Manual marking support
 * - Win detection per card
 * - Empty state when no cards
 * - Accessibility support
 */

'use client';

import { memo, useMemo } from 'react';
import type { Card } from '@/types';
import { CardGrid } from './CardGrid';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// PROPS
// ============================================================================

interface TicketDisplayProps {
  /** Array of cards owned by the player */
  cards: Card[];

  /** Set of called numbers (1-90) */
  calledNumbers: Set<number>;

  /** Optional click handler for cells (cardIndex, row, col) */
  onCellClick?: (cardIndex: number, row: number, col: number) => void;

  /** Optional winning card information */
  winningCardIndex?: number;

  /** Optional winning row index (0-2) */
  winningRow?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TicketDisplay = memo(function TicketDisplay({
  cards,
  calledNumbers,
  onCellClick,
  winningCardIndex,
  winningRow,
}: TicketDisplayProps) {
  // Create handlers
  const handleCellClick = (cardIndex: number) => (row: number, col: number) => {
    onCellClick?.(cardIndex, row, col);
  };

  // Calculate total statistics
  const statistics = useMemo(() => {
    let totalNumbers = 0;
    let totalCalled = 0;

    cards.forEach((card) => {
      card.forEach((row) => {
        row.forEach((cell) => {
          if (cell !== null) {
            totalNumbers++;
            if (calledNumbers.has(cell)) {
              totalCalled++;
            }
          }
        });
      });
    });

    return { totalNumbers, totalCalled };
  }, [cards, calledNumbers]);

  // Check for complete rows
  const hasCompleteRow = useMemo(() => {
    return cards.some((card) =>
      card.some((row) => {
        const rowNumbers = row.filter((cell): cell is number => cell !== null);
        return rowNumbers.every((num) => calledNumbers.has(num));
      })
    );
  }, [cards, calledNumbers]);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-2">
            Chưa có thẻ
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            Bạn chưa có thẻ nào. Hãy tạo thẻ mới để tham gia chơi!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Statistics header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-gray-600">
              Tổng số thẻ:
            </span>
            <span className="text-lg sm:text-xl font-bold text-loto-green">
              {cards.length}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base text-gray-600">
              Số đã gọi:
            </span>
            <span className="text-lg sm:text-xl font-bold text-loto-gold-dark">
              {statistics.totalCalled}
            </span>
            <span className="text-sm text-gray-500">
              / {statistics.totalNumbers}
            </span>
          </div>
        </div>

        {/* Win indicator */}
        <AnimatePresence>
          {hasCompleteRow && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-loto-gold via-loto-gold-light to-loto-gold rounded-full border-2 border-loto-gold-dark"
            >
              <svg
                className="w-5 h-5 text-loto-green"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-bold text-loto-green">
                Có dòng hoàn thành!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cards grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            layout
          >
            <CardGrid
              card={card}
              calledNumbers={calledNumbers}
              cardIndex={index}
              onCellClick={handleCellClick(index)}
              isWinning={winningCardIndex === index}
              winningRow={winningRow}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Helpful tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-paper-dark rounded-lg border border-loto-green/20"
      >
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-loto-green flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-semibold text-loto-green mb-1">
              Mẹo chơi:
            </p>
            <p>
              Bấm vào các ô số để đánh dấu thủ công. Các số đã được gọi sẽ tự động
              được tô màu vàng. Hoàn thành một dòng ngang (5 số) để chiến thắng!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
