# Marked Numbers Persistence Feature

## Overview

Implemented localStorage persistence for manually marked numbers, allowing users to keep their marked numbers even after page refresh.

## Changes Made

### 1. New Storage Utility (`lib/marked-numbers-storage.ts`)

Created a comprehensive utility to manage marked numbers persistence with the following features:

- **Storage Structure**: Organizes marked numbers by room ID and card identifier
- **Data Expiry**: Automatically expires data after 24 hours
- **Two Storage Types**:
  - `markedCells` (Set<string>): For CardGrid component (stores "row-col" format)
  - `markedNumbers` (Set<number>): For PlayableCardImage component (stores number values)
- **Cleanup Functions**: Removes expired entries automatically

#### Key Functions:

- `getMarkedCells(roomId, cardIndex)`: Load marked cells for CardGrid
- `saveMarkedCells(roomId, cardIndex, markedCells)`: Save marked cells for CardGrid
- `getMarkedNumbers(roomId, cardId)`: Load marked numbers for PlayableCardImage
- `saveMarkedNumbers(roomId, cardId, markedNumbers)`: Save marked numbers for PlayableCardImage
- `clearMarkedNumbersForRoom(roomId)`: Clear all marked numbers for a specific room
- `cleanExpiredMarkedNumbers()`: Remove expired entries from storage

### 2. Updated Components

#### CardGrid Component (`components/game/CardGrid.tsx`)

- Added localStorage persistence for manually marked cells
- Loads marked cells from storage on component mount
- Saves marked cells to storage whenever they change
- Uses room ID to separate data by game room

#### PlayableCardImage Component (`components/game/PlayableCardImage.tsx`)

- Added localStorage persistence for manually marked numbers
- Loads marked numbers from storage on component mount
- Saves marked numbers to storage whenever they change
- Renamed local `getMarkedNumbers` to `getEffectiveMarkedNumbers` to avoid naming conflict

### 3. Room Page Integration (`app/room/[id]/page.tsx`)

- Added automatic cleanup of expired marked numbers
- Clears marked numbers when game is reset (via `handleResetGame`)
- Ensures storage stays clean and doesn't grow indefinitely

## Technical Details

### Storage Format

```typescript
{
  [roomId: string]: {
    "card-0": {                    // CardGrid format
      markedCells: ["0-1", "2-3"],
      timestamp: 1234567890
    },
    "playable-5": {                // PlayableCardImage format
      markedNumbers: [5, 12, 23],
      timestamp: 1234567890
    }
  }
}
```

### Initialization Pattern

To avoid React hooks rule violations, the components use a two-step initialization:

1. Initialize state with empty Set
2. Use `useEffect` with `isInitialized` flag to load from storage on mount
3. Only save to storage after initialization is complete

### Data Expiry

- Marked numbers expire after 24 hours
- Expired entries are cleaned up periodically when players join rooms
- Helps prevent localStorage from growing indefinitely

## Benefits

1. **User Experience**: Players don't lose their progress when refreshing the page
2. **Data Isolation**: Each room has separate marked numbers storage
3. **Automatic Cleanup**: Expired data is automatically removed
4. **Memory Efficient**: Uses Sets for fast lookups and minimal memory usage
5. **Type Safe**: Full TypeScript support with proper type definitions

## Usage

The feature works automatically - no user action required:

1. User marks numbers on their cards
2. Marks are automatically saved to localStorage
3. On page refresh, marks are automatically restored
4. When game is reset, marks are cleared
5. After 24 hours, old marks are automatically removed

## Testing

To test the feature:

1. Join a game room and select cards
2. Mark some numbers on your cards
3. Refresh the page
4. Verify that marked numbers are still marked
5. Reset the game and verify marks are cleared
