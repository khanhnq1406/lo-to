/**
 * CardGenerator Component - Manual card generation interface
 *
 * Allows players to manually generate or regenerate their cards
 * Shown when player has no cards or wants to regenerate
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Ticket } from 'lucide-react';

interface CardGeneratorProps {
  /** Whether cards already exist (affects button text) */
  hasCards: boolean;

  /** Whether game has started (disable if true) */
  gameStarted: boolean;

  /** Callback to generate cards */
  onGenerate: (cardCount: number) => void;

  /** Current card count */
  currentCardCount?: number;
}

export function CardGenerator({
  hasCards,
  gameStarted,
  onGenerate,
  currentCardCount = 3,
}: CardGeneratorProps) {
  const [selectedCount, setSelectedCount] = useState(currentCardCount);

  const handleGenerate = () => {
    onGenerate(selectedCount);
  };

  // Don't allow generation if game has started
  if (gameStarted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            {hasCards ? (
              <RefreshCw className="w-6 h-6 text-white" />
            ) : (
              <Ticket className="w-6 h-6 text-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {hasCards ? 'Tạo lại thẻ' : 'Tạo thẻ chơi'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {hasCards
              ? 'Bạn có thể tạo lại thẻ với số lượng khác trước khi bắt đầu trò chơi.'
              : 'Chọn số lượng thẻ bạn muốn chơi (1-5 thẻ).'}
          </p>

          {/* Card count selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số lượng thẻ:
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={`
                    w-12 h-12 rounded-lg font-bold text-lg transition-all
                    ${
                      selectedCount === count
                        ? 'bg-blue-500 text-white shadow-lg scale-110'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                    }
                  `}
                  aria-label={`${count} thẻ`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {hasCards ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Tạo lại thẻ
              </>
            ) : (
              <>
                <Ticket className="w-5 h-5" />
                Tạo thẻ
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
