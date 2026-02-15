/**
 * PlayableCardImage Component
 * Displays card image with interactive number overlay for gameplay
 * Players can see the card image AND interact with numbers
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getCardConfig, getCardColorClasses, getBlankCellColor, getBlankCellBorderColor } from '@/lib/card-configs';
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

          {/* Interactive Number Grid Overlay - Matches Traditional Loto Card Styling */}
          <div className="absolute inset-0 p-4 flex flex-col justify-center">
            {/* Decorative Border Container (like traditional card) */}
            <div
              className={`relative rounded-lg overflow-hidden shadow-2xl border-4 ${colorClasses.border}`}
              style={{
                padding: '8px',
              }}
            >
              {/* Inner white container */}
              <div className="bg-white rounded p-2">
                {/* Number Grid - 9x9 Traditional Layout */}
                <div className="grid grid-cols-9 gap-[2px]">
                  {cardData.map((row, rowIndex) => {
                    const rowComplete = isRowComplete(rowIndex);
                    const isWinningRowHighlight = isWinning && winningRow === rowIndex;

                    return row.map((cell, colIndex) => {
                      const isMarked = cell !== null && markedNumbers.has(cell);
                      const isCalled = cell !== null && calledNumbers.has(cell);

                      return (
                        <motion.button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => cell !== null && toggleManualMark(cell)}
                          disabled={cell === null || !manualMarkingMode}
                          whileHover={cell !== null && manualMarkingMode ? { scale: 1.1 } : {}}
                          whileTap={cell !== null && manualMarkingMode ? { scale: 0.95 } : {}}
                          className={`
                            relative flex items-center justify-center
                            aspect-square rounded-sm
                            font-black text-[10px] sm:text-xs md:text-sm
                            transition-all duration-200
                            border-2
                            ${
                              cell !== null && isMarked
                                ? 'bg-[#ffd700] text-black shadow-lg scale-105 border-[#ffaa00]'
                                : cell !== null && isCalled && !manualMarkingMode
                                  ? 'bg-[#ffd700] text-black shadow-lg animate-pulse border-[#ffaa00]'
                                  : cell !== null
                                    ? 'bg-white text-black border-gray-300'
                                    : ''
                            }
                            ${
                              cell !== null && manualMarkingMode
                                ? 'cursor-pointer hover:border-yellow-400'
                                : ''
                            }
                            ${
                              isWinningRowHighlight && cell !== null
                                ? 'ring-2 ring-offset-1 ring-yellow-400 animate-pulse'
                                : ''
                            }
                          `}
                          style={{
                            // Set background color for blank cells using the card's actual color
                            backgroundColor: cell === null ? getBlankCellColor(cardId) : undefined,
                            borderColor: cell === null ? getBlankCellBorderColor(cardId) : undefined,
                            boxShadow: cell !== null && (isMarked || (isCalled && !manualMarkingMode))
                              ? '0 2px 8px rgba(255, 215, 0, 0.5)'
                              : undefined,
                          }}
                        >
                          {/* Number Text */}
                          {cell !== null && (
                            <span className="relative z-10 select-none">
                              {cell}
                            </span>
                          )}

                          {/* Checkmark for marked cells */}
                          {cell !== null && isMarked && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check
                                className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg"
                                strokeWidth={4}
                              />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    });
                  })}
                </div>

                {/* Mini Stats */}
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] sm:text-xs px-1">
                  <span className="text-gray-700 font-semibold">
                    {cardData.flat().filter((c): c is number => c !== null && markedNumbers.has(c)).length} / 45
                  </span>
                  {(isRowComplete(0) || isRowComplete(1) || isRowComplete(2) ||
                    isRowComplete(3) || isRowComplete(4) || isRowComplete(5) ||
                    isRowComplete(6) || isRowComplete(7) || isRowComplete(8)) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-600 font-bold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Có dòng!
                    </motion.span>
                  )}
                </div>
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
