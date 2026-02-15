# Vietnamese Lô Tô Game - Server

Custom Next.js + Socket.io server for real-time multiplayer Vietnamese Lô Tô game.

## Architecture

The server integrates Next.js and Socket.io on the same port, handling both HTTP requests and WebSocket connections.

### File Structure

```
server/
├── server.ts           # Main server entry point (Next.js + Socket.io)
├── index.js            # JavaScript loader for TypeScript server
├── socket-handler.ts   # Socket.io event handlers
├── room-manager.ts     # Room state management
├── game-manager.ts     # Game logic orchestration
├── test-client.js      # Basic connectivity test
└── test-game-flow.js   # Full game flow integration test
```

## Features

### Room Management
- Create rooms with unique 6-character IDs
- Join existing rooms
- Leave rooms
- Auto-cleanup empty rooms
- Host migration on host disconnect
- Kick players (host only)

### Game Modes
- **Machine Mode**: Auto-calls numbers at configurable interval (1-60 seconds)
- **Manual Mode**: Caller manually selects each number

### Game Flow
1. Players join room
2. Players generate cards (3×9 authentic Vietnamese Lô Tô cards)
3. Host starts game
4. Numbers are called (1-90)
5. Players claim win when they complete a row
6. Server validates win claim
7. Winner declared, game ends

### Authentic Vietnamese Lô Tô Rules
- Cards: 3 rows × 9 columns = 27 cells
- Each card: 15 numbers (1-90) + 12 blanks
- Each row: exactly 5 numbers + 4 blanks
- Column constraints: col 0 = 1-9, col 1 = 10-19, ..., col 8 = 80-90
- Win condition: Complete any horizontal row (5 numbers)

## Socket Events

### Client → Server

| Event | Description | Data |
|-------|-------------|------|
| `create_room` | Create new room | `{ playerName, callerMode, machineInterval? }` |
| `join_room` | Join existing room | `{ roomId, playerName }` |
| `start_game` | Start game (host only) | `{ roomId }` |
| `call_number` | Call number manually | `{ roomId, number }` |
| `claim_win` | Claim win | `{ roomId, ticketIndex, boardIndex, type }` |
| `generate_tickets` | Generate cards | `{ roomId, cardCount }` |
| `leave_room` | Leave room | `{ roomId }` |
| `kick_player` | Kick player (host only) | `{ roomId, playerId }` |
| `change_caller_mode` | Change caller mode | `{ roomId, callerMode, machineInterval? }` |

### Server → Client

| Event | Description | Data |
|-------|-------------|------|
| `room_update` | Room state changed | `{ room }` |
| `player_joined` | Player joined room | `{ playerId, playerName, isHost }` |
| `player_left` | Player left room | `{ playerId, playerName }` |
| `game_started` | Game started | `{ roomId }` |
| `number_called` | Number called | `{ number, calledHistory, remainingCount }` |
| `game_finished` | Game finished | `{ winner }` |
| `error` | Error occurred | `{ message, code? }` |
| `tickets_generated` | Cards generated | `{ playerId, tickets }` |
| `caller_mode_changed` | Caller mode changed | `{ callerMode, machineInterval? }` |

## Development

### Start Server

```bash
# Development (with hot reload)
pnpm dev

# Production
pnpm build
pnpm start
```

### Run Tests

```bash
# Basic connectivity test
node server/test-client.js

# Full game flow test
node server/test-game-flow.js
```

### Configuration

Environment variables:

- `NODE_ENV`: `development` or `production` (default: `development`)
- `PORT`: Server port (default: `3000`)
- `HOSTNAME`: Server hostname (default: `localhost`)

## Type Safety

All socket events are validated using Zod schemas from `/types/index.ts`. Invalid events are rejected with error messages.

## State Management

### Room State
Rooms are stored in-memory using a `Map<roomId, Room>`. Each room contains:
- Players array
- Game state (waiting/playing/finished)
- Called numbers history
- Winner information
- Caller mode and interval
- Creation timestamp

### Player State
Each player has:
- Unique ID (socket ID)
- Display name
- Cards array (can have multiple cards)
- Host/caller status
- Connection status

### Game State
Game manager handles:
- Starting/stopping games
- Number calling (machine/manual)
- Win validation
- Game reset

## Security

- All events validated with Zod schemas
- Host-only actions enforced (start game, kick player, change caller mode)
- Caller-only actions enforced (call number in manual mode)
- Win claims validated server-side
- Room ID uniqueness guaranteed
- Player name uniqueness per room

## Error Handling

Errors are sent to clients with descriptive messages and error codes:

| Code | Description |
|------|-------------|
| `CREATE_ROOM_ERROR` | Failed to create room |
| `JOIN_ROOM_ERROR` | Failed to join room |
| `START_GAME_ERROR` | Failed to start game |
| `CALL_NUMBER_ERROR` | Failed to call number |
| `CLAIM_WIN_ERROR` | Invalid win claim |
| `GENERATE_TICKETS_ERROR` | Failed to generate cards |
| `KICK_PLAYER_ERROR` | Failed to kick player |
| `LEAVE_ROOM_ERROR` | Failed to leave room |
| `CHANGE_CALLER_MODE_ERROR` | Failed to change caller mode |
| `KICKED` | Player was kicked from room |

## Performance

- Efficient in-memory state management
- Periodic cleanup of empty rooms (every 5 minutes)
- Socket.io room isolation (events only to room members)
- Optimized machine calling with interval-based polling

## Graceful Shutdown

Server handles SIGTERM and SIGINT signals:
- Stops all active calling intervals
- Closes HTTP server
- Disconnects all clients
- Cleans up resources

## Testing

Integration tests verify:
1. Server startup
2. Socket.io connectivity
3. Room creation
4. Player joining
5. Card generation
6. Game start
7. Number calling (manual mode)
8. Win claim validation
9. Game completion

All tests pass successfully.
