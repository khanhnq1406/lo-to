# Session Reconnection System

This document explains how the session reconnection system works to handle page refreshes and temporary disconnections.

## Overview

When a user refreshes the page or experiences a temporary disconnect, their WebSocket connection is lost and Socket.io assigns a new socket ID. The session reconnection system allows players to automatically rejoin their game room with their previous state intact.

## How It Works

### 1. Session Creation

When a player creates or joins a room:
- A unique `sessionId` is generated on the client
- The session data is sent to the server along with the create/join request
- The server stores the mapping: `sessionId → {roomId, playerId, playerName}`
- The client stores session data in localStorage: `{sessionId, playerId, playerName, roomId, timestamp}`

### 2. Page Refresh / Reconnection

When the page is refreshed:
1. The socket connection is re-established with a new socket ID
2. On `connect` event, the client checks localStorage for an existing session
3. If found, the client emits a `reconnect_session` event with the session data
4. The server looks up the session and updates the player's socket ID in the room
5. The server joins the new socket to the room and sends a room update
6. The client receives `session_reconnected` event and updates the UI

### 3. Session Expiry

Sessions expire after 24 hours to prevent stale data:
- Each session includes a timestamp
- On load, expired sessions are automatically cleared
- Failed reconnection attempts also clear invalid sessions

## Implementation Details

### Client-Side (`lib/session-storage.ts`)

```typescript
interface PlayerSession {
  sessionId: string;
  playerId: string;
  playerName: string;
  roomId: string;
  timestamp: number;
}

// Save session after joining/creating room
saveSession(session);

// Load session on reconnect
const session = getSession();

// Clear session when leaving room
clearSession();
```

### Server-Side (`server/room-manager.ts`)

```typescript
class RoomManager {
  private sessions = new Map<string, { roomId, playerId, playerName }>();

  // Save session when player joins
  saveSession(sessionId, roomId, playerId, playerName);

  // Reconnect player with new socket ID
  reconnectSession(sessionId, newSocketId);

  // Clear session
  clearSession(sessionId);
}
```

### Socket Events

**Client → Server:**
- `reconnect_session`: Request to reconnect with session data

**Server → Client:**
- `session_reconnected`: Reconnection successful
- `session_reconnect_failed`: Reconnection failed (invalid/expired session)

## User Experience

### Before (Without Session Reconnection)
1. User is playing a game
2. User refreshes the page
3. User sees "Create Room" or "Join Room" screen
4. User must manually re-enter room code and name
5. User appears as a new player in the room

### After (With Session Reconnection)
1. User is playing a game
2. User refreshes the page
3. User automatically reconnects to their room
4. Game state is preserved (cards, called numbers, etc.)
5. Seamless experience - other players see them as continuously connected

## Edge Cases Handled

1. **Session Expired**: Clear session and show join/create screen
2. **Room Deleted**: Session lookup fails, clear session
3. **Player Kicked**: Session cleared when leaving room
4. **Multiple Tabs**: Each tab gets its own socket, but shares the same session
5. **Network Issues**: Socket.io automatic reconnection + session recovery

## Testing

To test the session reconnection:
1. Create or join a room
2. Refresh the page (Cmd+R or F5)
3. Verify you're automatically reconnected to the same room
4. Verify your cards and game state are intact

## Future Improvements

- Add session recovery for mid-game disconnections
- Implement session transfer between devices
- Add visual indicator during reconnection process
- Support reconnection after browser restart (with warning)
