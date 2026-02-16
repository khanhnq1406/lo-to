/**
 * Integration Example - How to add CardSelector to your game room
 *
 * This example shows how to integrate the CardSelector component
 * into a game room page.
 */

'use client';

import { CardSelector } from '@/components/game';
import { useCardSelection } from '@/hooks/useCardSelection';
import {
  useSelectedCards,
  useCurrentPlayerId,
  usePlayers,
  useGameState,
  useCurrentPlayer,
} from '@/store/useGameStore';

export function GameRoomWithCardSelector() {
  // Card selection hook
  const { selectCard, deselectCard } = useCardSelection();

  // Get required state from store
  const selectedCards = useSelectedCards();
  const currentPlayerId = useCurrentPlayerId();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const gameState = useGameState();

  // Check if we have required data
  const canShowSelector = currentPlayerId && currentPlayer && gameState === 'waiting';

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Game Room</h1>
        <p className="text-gray-600 mt-2">
          {gameState === 'waiting'
            ? 'Waiting for players to join and select cards...'
            : 'Game in progress!'
          }
        </p>
      </div>

      {/* Card Selector - Only show during waiting state */}
      {canShowSelector && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <CardSelector
            selectedCards={selectedCards}
            currentPlayerId={currentPlayerId}
            players={players}
            gameStarted={gameState !== 'waiting'}
            onSelectCard={selectCard}
            onDeselectCard={deselectCard}
          />
        </div>
      )}

      {/* Rest of your game UI */}
      {/* Player list, game board, etc. */}
    </div>
  );
}

/**
 * ALTERNATIVE: Add to existing game room component
 *
 * If you already have a game room component, just add this section
 * before your existing game UI:
 */

/*
// In your existing game room component:

import { CardSelector } from '@/components/game';
import { useCardSelection } from '@/hooks/useCardSelection';

function ExistingGameRoom() {
  const { selectCard, deselectCard } = useCardSelection();
  const selectedCards = useSelectedCards();
  const currentPlayerId = useCurrentPlayerId();
  const currentPlayer = useCurrentPlayer();
  const players = usePlayers();
  const gameState = useGameState();

  return (
    <div>
      {/* Add CardSelector here, before your existing game UI *\/}
      {gameState === 'waiting' && currentPlayerId && currentPlayer && (
        <div className="mb-8">
          <CardSelector
            selectedCards={selectedCards}
            currentPlayerId={currentPlayerId}
            players={players}
            gameStarted={gameState !== 'waiting'}
            onSelectCard={selectCard}
            onDeselectCard={deselectCard}
          />
        </div>
      )}

      {/* Your existing game UI here *\/}
      <YourExistingGameUI />
    </div>
  );
}
*/
