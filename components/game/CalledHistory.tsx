/**
 * CalledHistory Component - 1-90 number grid showing call history
 *
 * Features:
 * - 10 columns × 9 rows grid (numbers 1-90)
 * - Called numbers: highlighted in green
 * - Uncalled numbers: gray/disabled appearance
 * - Current number: gold highlight with pulse animation
 * - Responsive grid layout
 * - Smooth animations on number calls
 * - Accessibility support
 */

'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// PROPS
// ============================================================================

interface CalledHistoryProps {
  /** Array of called numbers (1-90) */
  calledNumbers: number[];

  /** Current number being displayed (for special highlight) */
  currentNumber: number | null;

  /** Hide the history (for manual mode where only caller sees it) */
  hideHistory?: boolean;

  /** Optional className for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CalledHistory = memo(function CalledHistory({
  calledNumbers,
  currentNumber,
  hideHistory = false,
  className = '',
}: CalledHistoryProps) {
  // Convert array to Set for O(1) lookup
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers]);

  // Generate all numbers 1-90
  const allNumbers = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => i + 1);
  }, []);

  // Get cell state
  const getCellState = (num: number): 'current' | 'called' | 'uncalled' => {
    // If history is hidden, treat all numbers as uncalled except current
    if (hideHistory) {
      if (num === currentNumber) return 'current';
      return 'uncalled';
    }

    if (num === currentNumber) return 'current';
    if (calledSet.has(num)) return 'called';
    return 'uncalled';
  };

  // Cell variants for animation
  const cellVariants = {
    uncalled: {
      scale: 1,
      backgroundColor: 'rgb(229, 231, 235)', // gray-200
      color: 'rgb(156, 163, 175)', // gray-400
    },
    called: {
      scale: 1,
      backgroundColor: 'rgb(45, 80, 22)', // loto-green
      color: 'rgb(251, 249, 244)', // paper
    },
    current: {
      scale: [1, 1.1, 1],
      backgroundColor: ['rgb(255, 215, 0)', 'rgb(255, 228, 77)', 'rgb(255, 215, 0)'], // loto-gold
      color: 'rgb(45, 80, 22)', // loto-green
    },
  };

  return (
    <div
      className={`
        bg-gradient-to-br from-paper via-paper-dark to-paper-darker
        border-3 border-loto-green
        rounded-xl
        shadow-loto-ticket
        p-4 sm:p-6
        ${className}
      `}
      role="region"
      aria-label="Lịch sử các số đã gọi"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-loto-green">
          {hideHistory ? 'CHỜ NGƯỜI GỌI CÔNG BỐ' : 'Bảng số (1-90)'}
        </h3>
        {!hideHistory && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-loto-green" />
              <span className="text-gray-600">Đã gọi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-loto-gold animate-pulse" />
              <span className="text-gray-600">Hiện tại</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid - 10 columns × 9 rows */}
      <div
        className="
          grid
          grid-cols-10
          gap-1 sm:gap-2
          w-full
        "
        style={{
          aspectRatio: '10 / 9',
        }}
      >
        {allNumbers.map((num) => {
          const state = getCellState(num);
          const isCalled = state !== 'uncalled';
          const isCurrent = state === 'current';

          return (
            <motion.div
              key={num}
              variants={cellVariants}
              initial="uncalled"
              animate={state}
              transition={{
                duration: isCurrent ? 0.8 : 0.3,
                repeat: isCurrent ? Infinity : 0,
                repeatType: 'reverse',
              }}
              className={`
                flex items-center justify-center
                rounded
                font-bold
                text-xs sm:text-sm md:text-base
                transition-shadow
                ${isCurrent ? 'ring-2 ring-loto-gold-dark shadow-loto-ball' : ''}
                ${isCalled && !isCurrent ? 'shadow-md' : 'shadow-sm'}
              `}
              role="gridcell"
              aria-label={`Số ${num}${isCurrent ? ' (hiện tại)' : isCalled ? ' (đã gọi)' : ' (chưa gọi)'}`}
            >
              {num}
            </motion.div>
          );
        })}
      </div>

      {/* Hidden history message */}
      {hideHistory && (
        <div className="mt-4 p-4 bg-loto-gold/10 rounded-lg border-2 border-loto-gold/30 text-center">
          <p className="text-sm font-semibold text-loto-green">
            Lịch sử gọi số sẽ được hiển thị sau khi người gọi công bố
          </p>
        </div>
      )}

      {/* Stats footer - Only show if history not hidden */}
      {!hideHistory && (
        <>
          <div className="mt-4 pt-4 border-t border-loto-green/20 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Đã gọi:</span>
              <span className="text-lg font-bold text-loto-green">
                {calledNumbers.length}
              </span>
              <span className="text-gray-500">/ 90</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Còn lại:</span>
              <span className="text-lg font-bold text-loto-gold-dark">
                {90 - calledNumbers.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-loto-green to-loto-gold"
              initial={{ width: 0 }}
              animate={{ width: `${(calledNumbers.length / 90) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </>
      )}
    </div>
  );
});
