# Zustand Game Store

Global state management for the Vietnamese Lô Tô multiplayer game using Zustand.

## Overview

The game store manages:
- **Room State**: Current game room, players, game status, called numbers
- **Current Player**: Player ID, roles (host/caller), cards
- **UI Preferences**: Dark mode, sound effects (persisted to localStorage)
- **Connection State**: Loading, errors, connection status

## Quick Start

### Basic Usage

```tsx
import { useGameStore } from '@/store/useGameStore';

function MyComponent() {
  // Subscribe to specific state (optimal - only rerenders when this changes)
  const room = useGameStore(state => state.room);
  const darkMode = useGameStore(state => state.darkMode);

  // Use actions
  const setRoom = useGameStore(state => state.setRoom);
  const toggleDarkMode = useGameStore(state => state.toggleDarkMode);

  // Use derived selectors
  const isHost = useGameStore(state => state.isHost());

  return (
    <div>
      <p>Room: {room?.id}</p>
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

### Using Optimized Selector Hooks

```tsx
import {
  useRoom,
  useIsHost,
  usePlayerCards,
  useDarkMode
} from '@/store/useGameStore';

function MyComponent() {
  // These hooks are optimized for performance
  const room = useRoom();
  const isHost = useIsHost();
  const cards = usePlayerCards();
  const darkMode = useDarkMode();

  return <div>...</div>;
}
```

### Using Action Hooks

```tsx
import { useGameActions } from '@/store/useGameStore';

function MyComponent() {
  // Get all actions without causing rerenders
  const { setRoom, toggleDarkMode, addCalledNumber } = useGameActions();

  return (
    <button onClick={() => addCalledNumber(42)}>
      Call Number 42
    </button>
  );
}
```

## State Structure

```typescript
interface GameStore {
  // Room State
  room: Room | null;                  // Current room (null if not in room)
  currentPlayerId: string | null;     // Current player's socket ID

  // UI State
  darkMode: boolean;                  // Dark mode enabled (persisted)
  soundEnabled: boolean;              // Sound effects enabled (persisted)
  connecting: boolean;                // Is connecting to server
  error: string | null;               // Current error message

  // Actions (see below)
  // Derived Selectors (see below)
}
```

## Actions

### Room Actions

```typescript
// Set entire room state (from server updates)
setRoom(room: Room | null): void

// Add a player to the room
addPlayer(player: Player): void

// Remove a player from the room
removePlayer(playerId: string): void

// Update game state ('waiting' | 'playing' | 'finished')
setGameState(state: GameState): void

// Add a number to called history
addCalledNumber(number: number): void

// Set current number being called
setCurrentNumber(number: number | null): void

// Set winner and change game state to 'finished'
setWinner(winner: WinResult): void

// Update specific player properties
updatePlayer(playerId: string, updates: Partial<Player>): void
```

### Player Actions

```typescript
// Set current player ID
setCurrentPlayerId(playerId: string | null): void

// Set current player's cards
setPlayerCards(cards: Card[]): void
```

### UI Actions

```typescript
// Toggle dark mode
toggleDarkMode(): void

// Set dark mode explicitly
setDarkMode(enabled: boolean): void

// Toggle sound
toggleSound(): void

// Set sound enabled explicitly
setSoundEnabled(enabled: boolean): void

// Set connecting state
setConnecting(connecting: boolean): void

// Set error message
setError(message: string): void

// Clear error message
clearError(): void
```

### Reset

```typescript
// Reset to initial state (preserves darkMode and soundEnabled)
reset(): void
```

## Derived Selectors

Computed values that don't cause unnecessary rerenders:

```typescript
// Get current player object
getCurrentPlayer(): Player | null

// Get specific player by ID
getPlayer(playerId: string): Player | null

// Check if current player is host
isHost(): boolean

// Check if current player is caller
isCaller(): boolean

// Get current player's cards
getPlayerCards(): Card[]

// Get remaining uncalled numbers (1-90)
getRemainingNumbers(): number[]

// Get count of remaining numbers
getRemainingCount(): number
```

## Optimized Selector Hooks

Pre-built hooks for common use cases:

```typescript
// Room & Players
useRoom()                    // Get room state
useRoomId()                  // Get room ID
usePlayers()                 // Get players list
useGameState()               // Get game state
useCallerMode()              // Get caller mode
useMachineInterval()         // Get machine interval

// Current Player
useCurrentPlayerId()         // Get current player ID
useCurrentPlayer()           // Get current player object
useIsHost()                  // Check if current player is host
useIsCaller()                // Check if current player is caller
usePlayerCards()             // Get current player's cards

// Game Progress
useCalledHistory()           // Get called numbers array
useCurrentNumber()           // Get current number
useRemainingNumbers()        // Get remaining uncalled numbers
useRemainingCount()          // Get count of remaining numbers
useWinner()                  // Get winner info

// UI State
useDarkMode()                // Get dark mode
useSoundEnabled()            // Get sound enabled
useConnecting()              // Get connecting state
useError()                   // Get error message
```

## Examples

### Socket.io Integration

```tsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '@/store/useGameStore';
import { deserializeRoom } from '@/types';

function useSocket() {
  const { setRoom, setError, setConnecting } = useGameActions();

  useEffect(() => {
    const socket = io('http://localhost:3001');

    setConnecting(true);

    socket.on('connect', () => {
      setConnecting(false);
    });

    socket.on('room_update', (data) => {
      const room = deserializeRoom(data.room);
      setRoom(room);
    });

    socket.on('error', (data) => {
      setError(data.message);
    });

    socket.on('disconnect', () => {
      setConnecting(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
```

### Room Component

```tsx
import { useRoom, useIsHost, usePlayers } from '@/store/useGameStore';

function RoomPage() {
  const room = useRoom();
  const isHost = useIsHost();
  const players = usePlayers();

  if (!room) {
    return <div>Not in a room</div>;
  }

  return (
    <div>
      <h1>Room: {room.id}</h1>
      <p>Game State: {room.gameState}</p>
      <p>Players: {players.length}</p>
      {isHost && (
        <button>Start Game (Host Only)</button>
      )}
    </div>
  );
}
```

### Number Board

```tsx
import { useCalledHistory, useCurrentNumber } from '@/store/useGameStore';

function NumberBoard() {
  const calledHistory = useCalledHistory();
  const currentNumber = useCurrentNumber();

  return (
    <div>
      <div className="text-4xl">
        Current: {currentNumber || '-'}
      </div>
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => (
          <div
            key={num}
            className={calledHistory.includes(num) ? 'bg-green-500' : 'bg-gray-300'}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Player Cards

```tsx
import { usePlayerCards } from '@/store/useGameStore';

function MyCards() {
  const cards = usePlayerCards();

  if (cards.length === 0) {
    return <div>No cards yet</div>;
  }

  return (
    <div>
      {cards.map((card, cardIndex) => (
        <div key={cardIndex}>
          <h3>Card {cardIndex + 1}</h3>
          <div className="grid grid-cols-9 gap-1">
            {card.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`}>
                  {cell || ''}
                </div>
              ))
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Dark Mode Toggle

```tsx
import { useDarkMode, useGameActions } from '@/store/useGameStore';

function ThemeToggle() {
  const darkMode = useDarkMode();
  const { toggleDarkMode } = useGameActions();

  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

### Error Display

```tsx
import { useError, useGameActions } from '@/store/useGameStore';

function ErrorMessage() {
  const error = useError();
  const { clearError } = useGameActions();

  if (!error) return null;

  return (
    <div className="bg-red-500 text-white p-4">
      <p>{error}</p>
      <button onClick={clearError}>Dismiss</button>
    </div>
  );
}
```

## Performance Tips

### 1. Subscribe to Specific State

```tsx
// ❌ BAD - Rerenders on any state change
const store = useGameStore();

// ✅ GOOD - Only rerenders when room changes
const room = useGameStore(state => state.room);
```

### 2. Use Optimized Hooks

```tsx
// ❌ OKAY - Works but more verbose
const isHost = useGameStore(state => state.isHost());

// ✅ BETTER - Use pre-built hook
const isHost = useIsHost();
```

### 3. Use Action Hooks for Actions Only

```tsx
// ❌ BAD - Causes rerender on every state change
const setRoom = useGameStore(state => state.setRoom);

// ✅ GOOD - No rerenders
const { setRoom } = useGameActions();
```

### 4. Combine Related Selectors

```tsx
// ❌ BAD - Multiple subscriptions
const room = useRoom();
const players = usePlayers();
const gameState = useGameState();

// ✅ BETTER - Single subscription
const { room, players, gameState } = useGameStore(state => ({
  room: state.room,
  players: state.room?.players || [],
  gameState: state.room?.gameState || 'waiting'
}));
```

## localStorage Persistence

User preferences are automatically persisted:
- `darkMode` - Dark mode preference
- `soundEnabled` - Sound effects preference

Game state (room, players, etc.) is NOT persisted and resets on page reload.

To access persisted state:
```typescript
// localStorage key: 'loto-game-preferences'
const preferences = localStorage.getItem('loto-game-preferences');
```

## TypeScript

The store is fully typed. Import types from the store:

```tsx
import type { GameStore } from '@/store/useGameStore';
```

Or use types from the main types file:

```tsx
import type { Room, Player, Card, WinResult } from '@/types';
```

## Testing

Run the test file to verify store functionality:

```bash
npx tsx store/__test-store__.ts
```

All features are tested including:
- Initial state
- Room management
- Player management (add, remove, update)
- Game state updates
- Number calling
- Derived selectors
- UI actions
- Winner handling
- Reset functionality
- Remaining numbers calculation

## Architecture

```
useGameStore (Zustand)
├── State
│   ├── room (Room state from server)
│   ├── currentPlayerId (Current player's socket ID)
│   ├── darkMode (Persisted)
│   ├── soundEnabled (Persisted)
│   ├── connecting (Connection status)
│   └── error (Error message)
├── Actions (Mutate state)
│   ├── Room actions (setRoom, addPlayer, etc.)
│   ├── Player actions (setCurrentPlayerId, etc.)
│   ├── UI actions (toggleDarkMode, etc.)
│   └── reset (Reset to initial)
└── Selectors (Derived/computed values)
    ├── getCurrentPlayer()
    ├── isHost()
    ├── isCaller()
    └── getRemainingNumbers()
```

## Next Steps (Task 6)

The Socket.io hook will integrate with this store:

```tsx
// hooks/useSocket.ts (Task 6)
import { useGameStore } from '@/store/useGameStore';

export function useSocket() {
  const { setRoom, setError, setCurrentPlayerId } = useGameActions();

  // Socket.io event handlers will update the store
  socket.on('room_update', (data) => {
    setRoom(deserializeRoom(data.room));
  });

  // ... more socket event handlers
}
```

## API Reference

See the main store file for full TypeScript documentation:
- `/store/useGameStore.ts` - Main store implementation with JSDoc comments
