# Card Selector Feature - Usage Guide

## Overview

The Card Selector feature allows users to select from 16 predefined cards with 8 distinct colors. Each card can only be selected by one player, ensuring no duplicates. Cards are displayed with sample images from the `/sample` folder (01.jpg - 16.jpg).

## Features

- **16 Predefined Cards**: Cards numbered 1-16 with sample images
- **8 Color Categories**: Each color assigned to exactly 2 cards
  - Red: Cards 1, 2
  - Blue: Cards 3, 4
  - Green: Cards 5, 6
  - Yellow: Cards 7, 8
  - Purple: Cards 9, 10
  - Orange: Cards 11, 12
  - Pink: Cards 13, 14
  - Cyan: Cards 15, 16

- **Exclusive Selection**: Each card can only be selected by one player
- **Real-time Updates**: All players see card selections in real-time
- **Visual Feedback**:
  - Available cards show with colored borders
  - Selected cards show owner's name with lock icon
  - Your selected card highlighted with green border and checkmark
- **Pre-game Only**: Cards can only be selected before game starts

## File Structure

```
lib/
  └── card-configs.ts          # Card configurations and color mappings

components/game/
  └── CardSelector.tsx          # Main card selector UI component

hooks/
  └── useCardSelection.ts       # Client-side socket hook

types/
  └── index.ts                  # Type definitions (updated)

store/
  └── useGameStore.ts           # State management (updated)

server/
  ├── room-manager.ts           # Room state (updated)
  └── socket-handler.ts         # Socket handlers (updated)

sample/
  ├── 01.jpg - 16.jpg          # Card images
```

## Usage Example

### In a Game Room Component

```tsx
'use client';

import { CardSelector } from '@/components/game';
import { useCardSelection } from '@/hooks/useCardSelection';
import {
  useGameStore,
  usePlayers,
  useSelectedCards,
  useCurrentPlayerId,
  useGameState,
} from '@/store/useGameStore';

export function GameRoomPage() {
  const { selectCard, deselectCard } = useCardSelection();
  const selectedCards = useSelectedCards();
  const currentPlayerId = useCurrentPlayerId();
  const players = usePlayers();
  const gameState = useGameState();
  const currentPlayer = useGameStore((state) => state.getCurrentPlayer());

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Game Room</h1>

      {/* Card Selection - Only show before game starts */}
      {gameState === 'waiting' && currentPlayerId && currentPlayer && (
        <div className="mb-8">
          <CardSelector
            selectedCards={selectedCards}
            currentPlayerId={currentPlayerId}
            currentPlayerName={currentPlayer.name}
            players={players}
            gameStarted={gameState !== 'waiting'}
            onSelectCard={selectCard}
            onDeselectCard={deselectCard}
          />
        </div>
      )}

      {/* Rest of game UI */}
      {/* ... */}
    </div>
  );
}
```

## Socket Events

### Client to Server

#### `select_card`
```typescript
{
  roomId: string;
  cardId: number; // 1-16
}
```

#### `deselect_card`
```typescript
{
  roomId: string;
}
```

### Server to Client

#### `card_selected`
```typescript
{
  cardId: number;
  playerId: string;
  playerName: string;
}
```

#### `card_deselected`
```typescript
{
  cardId: number;
  playerId: string;
}
```

## Room State Structure

The `Room` type now includes:

```typescript
interface Room {
  // ... existing fields

  /** Card selections: Map of cardId (1-16) to playerId */
  selectedCards: Record<number, string>;
}
```

## Store Selectors

New selectors added to `useGameStore`:

```typescript
// Get all selected cards
const selectedCards = useSelectedCards();

// Get current player's selected card ID
const myCardId = useMySelectedCardId();

// From store directly
const store = useGameStore();
const selectedCards = store.getSelectedCards();
const myCardId = store.getMySelectedCardId();
```

## Validation Rules

1. **Card ID Range**: Must be 1-16
2. **Game State**: Can only select/deselect during 'waiting' state
3. **Uniqueness**: Each card can only be selected by one player
4. **Single Selection**: Each player can only select one card at a time
5. **Auto-deselect**: Selecting a new card automatically deselects previous card

## Error Handling

The system handles various error cases:

- **Room not found**: User tried to select card in non-existent room
- **Game already started**: Cannot change card selection after game starts
- **Card already taken**: Another player already selected that card
- **Player not in room**: User must join room before selecting cards

All errors are emitted via the `error` socket event.

## Testing

To test the card selection feature:

1. Start the server: `pnpm dev`
2. Open multiple browser windows/tabs
3. Create a room in one window
4. Join the room from other windows
5. Try selecting different cards from each window
6. Verify:
   - Cards show as taken immediately for all users
   - Only one user can select each card
   - Deselecting works correctly
   - Cards lock when game starts

## Visual Design

The CardSelector uses:

- **Grid Layout**: Responsive grid (2 cols on mobile, 8 on desktop)
- **Card Aspect Ratio**: 3:4 (portrait)
- **Color Borders**: 4px borders with color-coded styling
- **Animations**: Framer Motion for smooth interactions
- **Icons**:
  - Check (✓) for selected cards
  - Lock (🔒) for taken cards
  - User icon for owner indication

## Future Enhancements

Potential improvements:

1. **Card Preview**: Hover to see larger preview
2. **Card Stats**: Track how often each card is selected
3. **Favorite Cards**: Allow users to mark favorite cards
4. **Card Filtering**: Filter by color
5. **Random Selection**: "Pick for me" button
6. **Card History**: Show which cards user selected in past games

## Notes

- Card images should be placed in `/public/sample/` folder
- Images named 01.jpg through 16.jpg
- Recommended image size: 300x400px or similar 3:4 ratio
- Format: JPG, PNG, or WebP
- Keep file sizes reasonable for fast loading
