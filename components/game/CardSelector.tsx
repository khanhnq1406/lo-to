/**
 * CardSelector Component - 16 predefined cards with 8 colors
 * Allows users to select one card from the available pool
 * Shows which cards are already selected by other players
 */

'use client';

import { motion } from 'framer-motion';
import { Check, Lock, User } from 'lucide-react';
import { CARD_CONFIGS, getCardColorClasses } from '@/lib/card-configs';

interface CardSelectorProps {
  /** Currently selected cards: Map of cardId to playerId */
  selectedCards: Record<number, string>;

  /** Current player's ID */
  currentPlayerId: string;

  /** All players in the room (for displaying names) */
  players: Array<{ id: string; name: string }>;

  /** Whether game has started (disable if true) */
  gameStarted: boolean;

  /** Callback when a card is selected */
  onSelectCard: (cardId: number) => void;

  /** Callback when a card is deselected */
  onDeselectCard: (cardId: number) => void;
}

export function CardSelector({
  selectedCards,
  currentPlayerId,
  players,
  gameStarted,
  onSelectCard,
  onDeselectCard,
}: CardSelectorProps) {
  // Find all cards selected by current player
  const mySelectedCardIds = Object.entries(selectedCards)
    .filter(([_, playerId]) => playerId === currentPlayerId)
    .map(([cardId]) => parseInt(cardId, 10));

  const MAX_CARDS_PER_PLAYER = 5;

  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown';
  };

  const isCardSelected = (cardId: number): boolean => {
    return cardId.toString() in selectedCards;
  };

  const isCardSelectedByMe = (cardId: number): boolean => {
    return selectedCards[cardId] === currentPlayerId;
  };

  const getCardOwner = (cardId: number): string | null => {
    const ownerId = selectedCards[cardId];
    return ownerId ? getPlayerName(ownerId) : null;
  };

  const handleCardClick = (cardId: number) => {
    if (gameStarted) return;

    // If clicking on own card, deselect it
    if (isCardSelectedByMe(cardId)) {
      onDeselectCard(cardId);
      return;
    }

    // If card is selected by someone else, ignore
    if (isCardSelected(cardId)) {
      return;
    }

    // Check if player already has max cards
    if (mySelectedCardIds.length >= MAX_CARDS_PER_PLAYER) {
      alert(`Bạn chỉ có thể chọn tối đa ${MAX_CARDS_PER_PLAYER} thẻ!`);
      return;
    }

    // Select this card
    onSelectCard(cardId);
  };

  // Don't show if game has started
  if (gameStarted) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Chọn Thẻ Chơi
        </h2>
        <p className="text-gray-600">
          Chọn từ 1-5 thẻ trong 16 thẻ để chơi. Mỗi thẻ chỉ có thể được chọn bởi 1 người chơi.
        </p>
        {mySelectedCardIds.length > 0 && (
          <div className="mt-2 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✓ Bạn đã chọn {mySelectedCardIds.length} thẻ: {mySelectedCardIds.sort((a, b) => a - b).join(', ')}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {mySelectedCardIds.length < MAX_CARDS_PER_PLAYER
                ? `Bạn có thể chọn thêm ${MAX_CARDS_PER_PLAYER - mySelectedCardIds.length} thẻ nữa.`
                : 'Bạn đã chọn đủ số lượng thẻ tối đa.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {CARD_CONFIGS.map((card) => {
          const isSelected = isCardSelected(card.id);
          const isMyCard = isCardSelectedByMe(card.id);
          const owner = getCardOwner(card.id);
          const colorClasses = getCardColorClasses(card.id);
          const isDisabled = isSelected && !isMyCard;

          return (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={`
                relative aspect-[3/4] rounded-xl overflow-hidden
                border-4 transition-all
                ${isMyCard
                  ? `${colorClasses.border} ${colorClasses.ring} ring-4 ring-offset-2`
                  : isDisabled
                  ? 'border-gray-300 opacity-50 cursor-not-allowed'
                  : `${colorClasses.border} ${colorClasses.hover} cursor-pointer hover:shadow-lg`
                }
              `}
            >
              {/* Card Image */}
              <div className="absolute inset-0">
                <img
                  src={`/sample/${card.imageFile}`}
                  alt={card.name}
                  className={`w-full h-full object-cover ${
                    isDisabled ? 'grayscale' : ''
                  }`}
                />

                {/* Overlay for disabled cards */}
                {isDisabled && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs font-semibold px-2">{owner}</p>
                    </div>
                  </div>
                )}

                {/* Check mark for own card */}
                {isMyCard && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Card Number Badge */}
              <div
                className={`
                  absolute bottom-2 left-2 px-2 py-1 rounded-md
                  font-bold text-sm
                  ${isMyCard
                    ? 'bg-green-500 text-white'
                    : isDisabled
                    ? 'bg-gray-500 text-white'
                    : `${colorClasses.bg} ${colorClasses.text}`
                  }
                `}
              >
                #{card.id}
              </div>

              {/* Owner Badge */}
              {isSelected && (
                <div
                  className={`
                    absolute top-2 left-2 px-2 py-1 rounded-md
                    text-xs font-semibold flex items-center gap-1
                    ${isMyCard
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-white'
                    }
                  `}
                >
                  <User className="w-3 h-3" />
                  {isMyCard ? 'Bạn' : owner}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-800 mb-2">Chú thích:</h3>
        <div className="flex flex-wrap gap-4 text-sm mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Thẻ của bạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Đã được chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-4 border-blue-500 rounded"></div>
            <span>Còn trống</span>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          💡 Nhấn vào thẻ của bạn để bỏ chọn. Bạn có thể chọn tối đa {MAX_CARDS_PER_PLAYER} thẻ.
        </p>
      </div>
    </div>
  );
}
