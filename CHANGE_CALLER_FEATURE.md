# Change Caller Feature Implementation

## Overview
Implemented a feature that allows the host to designate any player in the room as the caller, instead of the caller role being automatically tied to the host.

## Changes Made

### 1. Type Definitions (`types/index.ts`)
- Added `ClientChangeCallerEvent` interface with `roomId` and `targetPlayerId`
- Added `ClientChangeCallerEventSchema` for validation
- Added `ServerCallerChangedEvent` interface with old and new caller information
- Added `ServerCallerChangedEventSchema` for validation
- Updated `ClientEvent` and `ServerEvent` unions to include the new event types

### 2. Room Manager (`server/room-manager.ts`)
- Added `changeCaller()` method that:
  - Validates host permission
  - Validates target player exists in room
  - Removes caller role from current caller
  - Assigns caller role to target player
  - Returns updated room

### 3. Socket Handler (`server/socket-handler.ts`)
- Imported new event schemas
- Added `change_caller` socket event handler that:
  - Validates request data
  - Gets old and new caller information
  - Calls `roomManager.changeCaller()`
  - Emits `caller_changed` event to all players
  - Emits `room_update` event
  - Logs the change

### 4. Socket Provider (`providers/SocketProvider.tsx`)
- Added `changeCaller` to `SocketContextValue` interface
- Added `caller_changed` event listener with console logging
- Implemented `changeCaller()` function that emits the socket event
- Added cleanup for the new event listener
- Exported `changeCaller` in the context value

### 5. Caller Panel (`components/game/CallerPanel.tsx`)
- Imported `changeCaller` from `useSocket()`
- Retrieved `room` from the game store
- Passed `players` array and `changeCaller` callback to `CallerControls`

### 6. Caller Controls (`components/game/CallerControls.tsx`)
- Added `Player` type import
- Added `players` prop to receive all players in room
- Added `onChangeCaller` prop for the callback
- Added caller selection dropdown UI that:
  - Only shows for host in waiting state with 2+ players
  - Displays all players with host indicator
  - Highlights current caller
  - Calls `onChangeCaller` when selection changes
- Added current caller detection logic

### 7. Room Page (`app/room/[id]/page.tsx`)
- Imported `changeCaller` from `useSocket()`
- Passed `players` and `changeCaller` to `CallerControls` component

## How It Works

### For the Host:
1. Create or join a room (becomes host and caller by default)
2. Wait for other players to join
3. In the "Caller Controls" section, a dropdown appears labeled "Người gọi số" (Caller)
4. Select any player from the dropdown
5. The selected player becomes the new caller immediately
6. The change is synchronized to all players in real-time

### For Players:
- Join a room
- The host can designate them as the caller
- If designated, they will see the "Người gọi số" badge
- In manual mode, they can click "Gọi số ngẫu nhiên" (Call random number)

## UI/UX Details

### Caller Selection Dropdown:
- **Location**: Top of Caller Controls panel
- **Visibility**: Only visible to host when:
  - Game state is "waiting" (not started yet)
  - There are 2 or more players in the room
- **Display**: Shows all player names with "(Chủ phòng)" indicator for host
- **Help text**: "Chọn người sẽ gọi số trong trò chơi" (Choose who will call numbers in the game)

### Restrictions:
- Can only change caller before game starts
- Only host can change the caller
- Caller change takes effect immediately
- All clients are notified via socket events

## Testing

### Manual Testing Steps:
1. Start the development server: `npm run dev`
2. Start the socket server: `cd server && npm start`
3. Open browser and create a room
4. Open another browser/tab and join the same room
5. As host, verify the dropdown shows both players
6. Select the other player as caller
7. Verify the badge updates on both clients
8. Verify only the designated caller can call numbers in manual mode

### Type Safety:
- All TypeScript compilation passes without errors
- Server compilation: ✅
- Client compilation: ✅

## Benefits

1. **Flexibility**: Host can delegate caller duties to another player
2. **Real-time sync**: All players see the change immediately
3. **Type-safe**: Full TypeScript support with validation
4. **User-friendly**: Simple dropdown UI with clear labels
5. **Secure**: Only host can change, with server-side validation

## Future Enhancements

Possible improvements:
- Allow changing caller during game (with confirmation)
- Add notifications/toasts when caller changes
- Remember caller preference across game restarts
- Add ability to make anyone a "co-caller"
