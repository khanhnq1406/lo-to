/**
 * CardGrid Component - Single Vietnamese Lô Tô card (9×9 grid)
 *
 * Displays a Vietnamese Lô Tô card with 9×9 format:
 * - 9 rows × 9 columns = 81 cells
 * - 45 numbers (1-90) + 36 blank cells
 * - 5 numbers per row + 4 blanks per row
 * - Traditional paper style with off-white background and green borders
 *
 * Features:
 * - Called numbers highlighted
 * - Manual marking support
 * - Win detection and celebration
 * - Responsive design
 * - Accessibility support
 */

'use client';

import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import type { Card, CellValue } from '@/types';
import { NumberCell } from './NumberCell';
import { CardHeader } from './CardHeader';
import { getMarkedCells, saveMarkedCells } from '@/lib/marked-numbers-storage';
import { useGameStore } from '@/store/useGameStore';

// ============================================================================
// PROPS
// ============================================================================

interface CardGridProps {
  /** Card data (3×9 grid) */
  card: Card;

  /** Set of called numbers */
  calledNumbers: Set<number>;

  /** Card index in player's card array */
  cardIndex: number;

  /** Click handler for cells (row, col) */
  onCellClick?: (row: number, col: number) => void;

  /** Is this card a winning card? */
  isWinning?: boolean;

  /** Which row won (0-2)? Only set if isWinning is true */
  winningRow?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CardGrid = memo(function CardGrid({
  card,
  calledNumbers,
  cardIndex,
  onCellClick,
  isWinning = false,
  winningRow,
}: CardGridProps) {
  // Get room ID for storage
  const roomId = useGameStore((state) => state.room?.id || 'local');

  // Track manually marked cells (row, col) - with persistence
  const [markedCells, setMarkedCells] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitialized) {
      const loaded = getMarkedCells(roomId, cardIndex);
      setMarkedCells(loaded);
      setIsInitialized(true);
    }
  }, [isInitialized, roomId, cardIndex]);

  // Save to localStorage whenever markedCells changes (skip initial load)
  useEffect(() => {
    if (isInitialized) {
      saveMarkedCells(roomId, cardIndex, markedCells);
    }
  }, [markedCells, roomId, cardIndex, isInitialized]);

  // Create cell key
  const getCellKey = useCallback((row: number, col: number) => `${row}-${col}`, []);

  // Toggle cell mark
  const handleCellClick = useCallback((row: number, col: number, value: CellValue) => {
    if (value === null) return; // Can't mark blank cells

    const key = getCellKey(row, col);
    setMarkedCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });

    onCellClick?.(row, col);
  }, [getCellKey, onCellClick]);

  // Calculate statistics
  const { totalNumbers, calledCount } = useMemo(() => {
    let total = 0;
    let called = 0;

    card.forEach((row) => {
      row.forEach((cell) => {
        if (cell !== null) {
          total++;
          if (calledNumbers.has(cell)) {
            called++;
          }
        }
      });
    });

    return { totalNumbers: total, calledCount: called };
  }, [card, calledNumbers]);

  return (
    <div className="w-full">
      {/* Card header */}
      <CardHeader
        cardIndex={cardIndex}
        isWinning={isWinning}
        winningRow={winningRow}
        totalNumbers={totalNumbers}
        calledNumbers={calledCount}
      />

      {/* Card container with traditional paper style */}
      <div
        className="relative bg-paper rounded-lg shadow-loto-ticket border-3 border-loto-green-border overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FBF9F4 0%, #F5F2EA 100%)',
        }}
      >
        {/* Decorative paper texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* 3×9 Grid */}
        <div className="relative p-2 sm:p-3 md:p-4">
          <div
            className="grid gap-[2px] sm:gap-1"
            style={{
              gridTemplateColumns: 'repeat(9, 1fr)',
              gridTemplateRows: 'repeat(9, 1fr)',
            }}
            role="grid"
            aria-label={`Lô Tô card ${cardIndex + 1}`}
          >
            {card.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const cellKey = getCellKey(rowIndex, colIndex);
                const isCalled = cell !== null && calledNumbers.has(cell);
                const isMarked = markedCells.has(cellKey);
                const isCellWinning = isWinning && winningRow === rowIndex;

                return (
                  <NumberCell
                    key={cellKey}
                    value={cell}
                    isCalled={isCalled}
                    isMarked={isMarked}
                    isWinning={isCellWinning}
                    onClick={
                      cell !== null
                        ? () => handleCellClick(rowIndex, colIndex, cell)
                        : undefined
                    }
                    row={rowIndex}
                    col={colIndex}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Bottom decorative border */}
        <div className="h-2 bg-gradient-to-r from-loto-green via-loto-green-light to-loto-green" />
      </div>
    </div>
  );
});
