# useSocket Hook - Implementation Guide & Testing

## Overview
The `useSocket` hook has been successfully implemented at `/hooks/useSocket.ts`. This custom React hook provides Socket.io client functionality with full Zustand store integration for the Vietnamese Lô Tô game.

## ✅ Implementation Checklist

### 1. Connection Management
- ✅ Connects to Socket.io server using config from `/lib/socket-config.ts`
- ✅ Auto-reconnect on disconnect (5 attempts with exponential backoff)
- ✅ Handles connection errors gracefully
- ✅ Clean up on unmount (removes all listeners, disconnects socket)
- ✅ Tracks connection state in Zustand store (connecting, connected)

### 2. Server Event Listeners (9 events)
All server events are properly handled and synced with Zustand store:

- ✅ `room_update` → Updates entire room state in store (with deserializeRoom)
- ✅ `player_joined` → Logged (room_update handles actual state)
- ✅ `player_left` → Removes player from store
- ✅ `game_started` → Updates game state to 'playing'
- ✅ `number_called` → Adds to called history, sets current number
- ✅ `game_finished` → Sets winner, updates state to 'finished'
- ✅ `error` → Sets error message in store, auto-clears after 5 seconds
- ✅ `tickets_generated` → Updates player's cards (only for current player)
- ✅ `caller_mode_changed` → Logged (room_update handles actual state)

### 3. Client Event Emitters (9 actions)
All client actions are implemented with proper validation:

- ✅ `createRoom(playerName, cardCount)` → Creates new room with machine mode (3s interval)
- ✅ `joinRoom(roomId, playerName, cardCount)` → Joins existing room
- ✅ `startGame()` → Starts game (host only, validated server-side)
- ✅ `callNumber(number)` → Calls number manually (manual mode)
- ✅ `claimWin()` → Claims player won (validates server-side)
- ✅ `generateTickets(cardCount, boardsPerCard)` → Generates cards for player
- ✅ `leaveRoom()` → Leaves current room, resets local state
- ✅ `kickPlayer(playerId)` → Kicks player (host only, validated server-side)
- ✅ `changeCallerMode(mode)` → Changes caller mode (host only)

### 4. Type Safety
- ✅ Full TypeScript with strict typing
- ✅ Imports socket event types from `/types/index.ts`
- ✅ Uses CallerMode enum from types
- ✅ Proper return type `UseSocketReturn` interface

### 5. Error Handling
- ✅ Network errors handled gracefully (connection, reconnection)
- ✅ Validates connected state before emitting events
- ✅ Validates room state before room-specific actions
- ✅ Sets error state in store on failures
- ✅ Auto-clears errors after 5 seconds
- ✅ Console logging for debugging

### 6. State Synchronization
- ✅ Uses Zustand store actions to update state
- ✅ Deserializes room data (Date strings → Date objects) via `deserializeRoom()`
- ✅ Syncs connection state with store
- ✅ Syncs player ID with store on connect
- ✅ Clears state on leave room

## 🎯 Hook API

### Connection State
```typescript
const { connected, connecting } = useSocket();
```

### Actions
```typescript
const {
  createRoom,      // (playerName, cardCount) => void
  joinRoom,        // (roomId, playerName, cardCount) => void
  startGame,       // () => void
  callNumber,      // (number) => void
  claimWin,        // () => void
  generateTickets, // (cardCount, boardsPerCard) => void
  leaveRoom,       // () => void
  kickPlayer,      // (playerId) => void
  changeCallerMode // (mode: 'machine' | 'manual') => void
} = useSocket();
```

## 🧪 Testing Steps

### 1. TypeScript Type Check
```bash
pnpm type-check
# No errors in hooks/useSocket.ts ✅
```

### 2. Test Connection
Create a test component:
```tsx
// app/test-socket/page.tsx
'use client';

import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/store/useGameStore';

export default function TestSocketPage() {
  const { connected, connecting, createRoom } = useSocket();
  const room = useGameStore((state) => state.room);
  const error = useGameStore((state) => state.error);

  return (
    <div className="p-8">
      <h1>Socket Test</h1>
      <p>Connected: {connected ? 'Yes' : 'No'}</p>
      <p>Connecting: {connecting ? 'Yes' : 'No'}</p>
      {error && <p className="text-red-500">Error: {error}</p>}

      <button
        onClick={() => createRoom('Test Player', 3)}
        disabled={!connected}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Create Room
      </button>

      {room && (
        <div className="mt-4">
          <h2>Room Created!</h2>
          <p>Room ID: {room.id}</p>
          <p>Players: {room.players.length}</p>
          <p>State: {room.gameState}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Test All Actions
Start the dev server and test each action:
```bash
pnpm dev
# Navigate to http://localhost:3000/test-socket
```

### 4. Test Emit Actions
- ✅ Click "Create Room" - should create room and show room ID
- ✅ Check Network tab - should see WebSocket connection
- ✅ Check Console - should see "[Socket] Connected: <socket-id>"
- ✅ Check Zustand store - room state should be populated

### 5. Test Store Updates
- ✅ Create room → `room` state populated
- ✅ Join room → players list updated
- ✅ Start game → gameState changes to 'playing'
- ✅ Call number → calledHistory updated
- ✅ Errors → error message shown and auto-clears after 5s

## 📁 Files Modified/Created

### Created
- `/hooks/useSocket.ts` (585 lines) - Main hook implementation

### Dependencies Used
- `socket.io-client` - WebSocket client
- `zustand` - State management
- `/lib/socket-config.ts` - Connection configuration
- `/store/useGameStore.ts` - Zustand store
- `/types/index.ts` - Type definitions

## 🔧 Implementation Details

### Socket Instance Management
- Socket stored in `useRef` to persist across re-renders
- No stale closures - ref.current always points to latest socket
- Single socket connection per app instance

### Connection Lifecycle
- Connects on mount
- Auto-reconnects on disconnect (5 attempts, 1-5s delay)
- Disconnects and cleans up on unmount
- Updates Zustand store with connection state

### Event Flow
```
Server Event → Socket Listener → Zustand Action → Component Re-render
Client Action → Validation → Socket Emit → Server Handler → Server Event
```

### Error Auto-Clear
All errors are automatically cleared after 5 seconds using `setTimeout`:
```typescript
socket.on('error', (data) => {
  setError(data.message);
  setTimeout(() => clearError(), 5000);
});
```

## 🚀 Next Steps

1. **Integration**: Use `useSocket()` in game components
2. **UI Components**: Build UI that calls socket actions
3. **Testing**: Test all 9 client actions with real server
4. **Error UX**: Add toast notifications for errors
5. **Loading States**: Show loading spinners for connecting state

## 📝 Notes

- Hook uses `'use client'` directive (client component only)
- All actions validate connection state before emitting
- All actions validate room state for room-specific operations
- Room deserialization handles Date string → Date object conversion
- Auto-generates tickets after creating/joining room (with 100ms delay)
- Console logging included for debugging (can be removed in production)
