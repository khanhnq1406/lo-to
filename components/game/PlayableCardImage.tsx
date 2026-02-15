/**
 * PlayableCardImage Component
 * Displays card image with interactive number overlay for gameplay
 * Players can see the card image AND interact with numbers
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getCardConfig, getCardColorClasses } from '@/lib/card-configs';
import { Check } from 'lucide-react';
import type { Card } from '@/types';

interface PlayableCardImageProps {
  /** Card ID (1-16) */
  cardId: number;

  /** Card data (9x9 grid with numbers) */
  cardData: Card;

  /** Set of called numbers */
  calledNumbers: Set<number>;

  /** Card index in player's collection */
  cardIndex: number;

  /** Manual marking mode (false = auto, true = manual) */
  manualMarkingMode?: boolean;

  /** Optional: is this the winning card */
  isWinning?: boolean;

  /** Optional: winning row index */
  winningRow?: number;
}

export function PlayableCardImage({
  cardId,
  cardData,
  calledNumbers,
  cardIndex,
  manualMarkingMode = false,
  isWinning,
  winningRow,
}: PlayableCardImageProps) {
  const config = getCardConfig(cardId);
  const colorClasses = getCardColorClasses(cardId);

  // Track manually marked numbers (only used in manual mode)
  const [manuallyMarked, setManuallyMarked] = useState<Set<number>>(new Set());

  if (!config) {
    return null;
  }

  // Get effective marked numbers based on mode
  const getMarkedNumbers = (): Set<number> => {
    if (manualMarkingMode) {
      return manuallyMarked; // Only manually marked
    } else {
      return calledNumbers; // Auto-marked from called numbers
    }
  };

  const markedNumbers = getMarkedNumbers();

  // Toggle manual mark for a number
  const toggleManualMark = (number: number) => {
    if (!manualMarkingMode) return; // Only in manual mode

    setManuallyMarked((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(number)) {
        newSet.delete(number);
      } else {
        newSet.add(number);
      }
      return newSet;
    });
  };

  // Check if row is complete
  const isRowComplete = (rowIndex: number): boolean => {
    const row = cardData[rowIndex];
    const rowNumbers = row.filter((cell): cell is number => cell !== null);
    return rowNumbers.length > 0 && rowNumbers.every((num) => markedNumbers.has(num));
  };

  return (
    <div className="relative">
      {/* Card Container */}
      <div
        className={`
          relative rounded-xl overflow-hidden
          border-4 ${colorClasses.border}
          ${isWinning ? 'ring-4 ring-loto-gold animate-pulse' : ''}
          shadow-lg
        `}
      >
        {/* Background Image */}
        <div className="relative aspect-[3/4]">
          <img
            src={`/sample/${config.imageFile}`}
            alt={config.name}
            className="w-full h-full object-cover"
          />

          {/* Semi-transparent overlay for better number visibility */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Card Number Badge (top-left) */}
          <div
            className={`
              absolute top-3 left-3 px-3 py-1.5 rounded-lg
              bg-white/95 backdrop-blur-sm
              font-bold text-base
              ${colorClasses.text}
              border-2 ${colorClasses.border}
              shadow-lg
            `}
          >
            Thẻ #{cardId}
          </div>

          {/* Winning Badge */}
          {isWinning && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-loto-gold border-2 border-loto-gold-dark shadow-lg"
            >
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                <span className="text-sm font-bold text-white">THẮNG</span>
              </div>
            </motion.div>
          )}

          {/* Interactive Number Grid Overlay */}
          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-xl">
              {/* Number Grid */}
              <div className="space-y-1">
                {cardData.map((row, rowIndex) => {
                  const rowComplete = isRowComplete(rowIndex);
                  const isWinningRowHighlight = isWinning && winningRow === rowIndex;

                  return (
                    <div
                      key={rowIndex}
                      className={`
                        flex gap-1 p-1 rounded
                        ${rowComplete ? 'bg-green-100' : ''}
                        ${isWinningRowHighlight ? 'bg-loto-gold/50 ring-2 ring-loto-gold' : ''}
                      `}
                    >
                      {row.map((cell, colIndex) => {
                        const isMarked = cell !== null && markedNumbers.has(cell);
                        const isCalledButNotMarked = false; // Hide yellow hints in all modes

                        return (
                          <button
                            key={colIndex}
                            onClick={() => cell !== null && toggleManualMark(cell)}
                            disabled={cell === null || !manualMarkingMode}
                            className={`
                              flex items-center justify-center
                              aspect-square flex-1 rounded text-xs font-bold
                              transition-all
                              ${cell === null ? 'bg-gray-100' : ''}
                              ${
                                cell !== null && isMarked
                                  ? 'bg-loto-gold text-white shadow-md scale-105'
                                  : ''
                              }
                              ${
                                cell !== null && !isMarked && isCalledButNotMarked
                                  ? 'bg-yellow-200 text-gray-800 border-2 border-yellow-400 animate-pulse'
                                  : ''
                              }
                              ${
                                cell !== null && !isMarked && !isCalledButNotMarked
                                  ? 'bg-white text-gray-800 border border-gray-300'
                                  : ''
                              }
                              ${
                                cell !== null && manualMarkingMode
                                  ? 'cursor-pointer hover:bg-yellow-100 hover:scale-110'
                                  : ''
                              }
                            `}
                          >
                            {cell !== null ? cell : ''}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Mini Stats */}
              <div className="mt-2 pt-2 border-t border-gray-300 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {cardData.flat().filter((c): c is number => c !== null && markedNumbers.has(c)).length} / 45 đã đánh dấu
                </span>
                {isRowComplete(0) || isRowComplete(1) || isRowComplete(2) || isRowComplete(3) || isRowComplete(4) || isRowComplete(5) || isRowComplete(6) || isRowComplete(7) || isRowComplete(8) ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Có dòng!
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Position Label */}
      <div className="mt-2 text-center">
        <span className="text-sm font-semibold text-gray-600">
          Thẻ {cardIndex + 1} - {config.color}
        </span>
      </div>
    </div>
  );
}
