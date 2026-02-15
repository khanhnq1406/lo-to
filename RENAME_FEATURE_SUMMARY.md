# Player Rename Feature Implementation

## Overview
Implemented a complete feature that allows users to rename themselves in the game room.

## Changes Made

### 1. Type Definitions (`types/index.ts`)
- Added `ClientRenamePlayerEvent` interface and schema for client-to-server rename requests
- Added `ServerPlayerRenamedEvent` interface and schema for server-to-client rename notifications
- Updated `ClientEvent` and `ServerEvent` union types to include the new events

### 2. Server-Side Logic

#### Room Manager (`server/room-manager.ts`)
- Added `renamePlayer()` method that:
  - Validates the player exists in the room
  - Checks for duplicate names (case-insensitive)
  - Updates the player's name
  - Updates the session storage with the new name
  - Returns both the updated room and the old name for event notification

#### Socket Handler (`server/socket-handler.ts`)
- Added `rename_player` socket event handler that:
  - Validates the incoming data using Zod schema
  - Calls the room manager's `renamePlayer()` method
  - Emits `player_renamed` event to all players in the room
  - Sends updated room state to all players
  - Handles errors and sends appropriate error messages

### 3. Client-Side Logic

#### Socket Provider (`providers/SocketProvider.tsx`)
- Added `renamePlayer()` function to the context
- Added `player_renamed` event listener for logging
- Added cleanup for the event listener
- Updated the context value interface

### 4. UI Components

#### Edit Name Modal (`components/game/EditNameModal.tsx`)
- Created a new modal component with:
  - Input field for the new name (1-50 character validation)
  - Real-time character counter
  - Display of current name for reference
  - Confirm and Cancel buttons
  - Keyboard support (Enter to confirm, Escape to close)
  - Traditional Vietnamese styling consistent with the app
  - Framer Motion animations
  - Full accessibility (ARIA labels, focus management)

#### Player Card (`components/game/PlayerCard.tsx`)
- Added Edit icon from lucide-react
- Added `onEditName` callback prop
- Added small edit button next to player name (only visible for current user)
- Button has hover states and accessibility labels

#### Player List (`components/game/PlayerList.tsx`)
- Imported the `EditNameModal` component
- Added modal state management
- Added `handleEditName` callback to open the modal
- Added `handleConfirmNameChange` callback to call `renamePlayer()`
- Passed `onEditName` prop to `PlayerCard` for the current user
- Rendered the `EditNameModal` at the end of the component

## Features

### Validation
- **Name length**: 1-50 characters
- **Duplicate check**: Case-insensitive duplicate name detection
- **Real-time feedback**: Shows character count and validation errors
- **Unchanged detection**: Detects if the name hasn't changed and closes modal without making a request

### User Experience
- **Visual feedback**: Edit button appears on hover next to player's own name
- **Intuitive modal**: Clean, accessible modal with clear instructions
- **Keyboard navigation**: Full keyboard support (Enter, Escape)
- **Error handling**: Clear error messages for validation failures or server errors
- **Session persistence**: Name changes are persisted across page refreshes

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Focus management in modal
- Screen reader announcements for name changes

## How to Use

1. **Open the room**: Join or create a game room
2. **Find your player card**: Locate your player card in the player list (marked with "Bạn" badge)
3. **Click the edit icon**: Click the small pencil icon next to your name
4. **Enter new name**: Type your desired new name in the modal
5. **Confirm**: Click "Xác nhận" or press Enter to save
6. **Cancel**: Click "Hủy" or press Escape to cancel

## Technical Notes

- The rename feature works in all game states (waiting, playing, finished)
- Name changes are immediately broadcasted to all players in the room
- Session storage is updated to maintain the new name on reconnection
- The feature uses the existing socket.io infrastructure
- All changes follow the existing code patterns and styling conventions

## Testing Recommendations

1. Test renaming with various name lengths (empty, 1 char, 50 chars, >50 chars)
2. Test duplicate name detection (same player with same name, different players with same name)
3. Test during different game states (waiting, playing, finished)
4. Test with multiple players in the room
5. Test session persistence (rename, refresh page, verify name persists)
6. Test keyboard navigation (Tab, Enter, Escape)
7. Test accessibility with screen readers

## Files Modified

### New Files
- `components/game/EditNameModal.tsx`

### Modified Files
- `types/index.ts`
- `server/room-manager.ts`
- `server/socket-handler.ts`
- `providers/SocketProvider.tsx`
- `components/game/PlayerCard.tsx`
- `components/game/PlayerList.tsx`
