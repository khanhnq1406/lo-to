/**
 * SelectedCardsDisplay Component - Display player's selected cards with images
 * Shows the actual card images that the player selected from CardSelector
 * Players will play with these visual cards
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MousePointerClick, Zap } from 'lucide-react';
import { PlayableCardImage } from './PlayableCardImage';
import { useGameStore } from '@/store/useGameStore';
import type { Card } from '@/types';

interface SelectedCardsDisplayProps {
  /** Map of selected cards: cardId -> playerId */
  selectedCards: Record<number, string>;

  /** Current player's ID */
  currentPlayerId: string;

  /** Called numbers */
  calledNumbers: Set<number>;

  /** Player's card data */
  cards: Card[];

  /** Manual marking mode */
  manualMarkingMode?: boolean;
}

export function SelectedCardsDisplay({
  selectedCards,
  currentPlayerId,
  calledNumbers,
  cards,
  manualMarkingMode: manualMarkingModeProp,
}: SelectedCardsDisplayProps) {
  // Get marking mode from store
  const storeManualMode = useGameStore((state) => state.manualMarkingMode);
  const toggleManualMode = useGameStore((state) => state.toggleManualMarkingMode);
  const manualMarkingMode = manualMarkingModeProp ?? storeManualMode;

  // Get current player's selected card IDs
  const mySelectedCardIds = Object.entries(selectedCards)
    .filter(([_, playerId]) => playerId === currentPlayerId)
    .map(([cardId]) => parseInt(cardId, 10))
    .sort((a, b) => a - b);

  // Empty state
  if (mySelectedCardIds.length === 0) {
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
            Chưa chọn thẻ
          </h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            Hãy chọn thẻ từ lưới bên trên để bắt đầu chơi!
          </p>
        </motion.div>
      </div>
    );
  }

  // Container animation
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
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="w-full">
      {/* Header with count and mode toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between px-2 gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-loto-gold" />
          <span className="text-base font-semibold text-gray-700">
            Thẻ của bạn: <span className="text-loto-green">{mySelectedCardIds.length}</span>
          </span>
        </div>

        {/* Manual Marking Mode Toggle */}
        <button
          onClick={toggleManualMode}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
            transition-all shadow-md hover:shadow-lg active:scale-95
            ${
              manualMarkingMode
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }
          `}
        >
          {manualMarkingMode ? (
            <>
              <MousePointerClick className="w-4 h-4" />
              <span>Đánh dấu thủ công</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Tự động đánh dấu</span>
            </>
          )}
        </button>
      </div>

      {/* Mode explanation */}
      <div className="mb-4 px-2 py-2 bg-blue-50 border-l-4 border-blue-500 rounded">
        <p className="text-xs text-gray-700">
          {manualMarkingMode ? (
            <>
              <strong className="text-blue-700">🖱️ Chế độ thủ công:</strong> Nhấn vào số trên thẻ để đánh dấu.
              Số được gọi sẽ nhấp nháy màu vàng để nhắc nhở bạn.
            </>
          ) : (
            <>
              <strong className="text-green-700">⚡ Chế độ tự động:</strong> Số được gọi sẽ tự động được đánh dấu vàng trên thẻ của bạn.
            </>
          )}
        </p>
      </div>

      {/* Cards Grid with Playable Numbers */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {mySelectedCardIds.map((cardId, index) => {
            const cardData = cards[index];
            if (!cardData) return null;

            return (
              <motion.div
                key={cardId}
                variants={cardVariants}
                layout
              >
                <PlayableCardImage
                  cardId={cardId}
                  cardData={cardData}
                  calledNumbers={calledNumbers}
                  cardIndex={index}
                  manualMarkingMode={manualMarkingMode}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Helpful tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
              Cách chơi:
            </p>
            <p>
              Khi trò chơi bắt đầu, các số sẽ được gọi. Đánh dấu các số trên thẻ của bạn.
              Người đầu tiên hoàn thành một dòng ngang sẽ thắng!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
