# Marking Mode - Host Control Feature

## Overview

The manual/auto marking mode is now controlled by the **room host** instead of being a per-player preference. When the host changes the mode, it applies to all players in the room.

---

## Changes Made

### 1. Room State ✅
- Added `manualMarkingMode: boolean` field to `Room` interface
- Default value: `true` (manual-mark mode)
- Set by host when creating room
- Persisted in room state

### 2. Socket Events ✅
**Client → Server:**
- `change_marking_mode`: Host changes marking mode
  ```typescript
  {
    roomId: string;
    manualMarkingMode: boolean;
  }
  ```

**Server → Client:**
- `marking_mode_changed`: Notify all players of mode change
  ```typescript
  {
    manualMarkingMode: boolean;
  }
  ```

### 3. Server Implementation ✅
**Files Modified:**
- `types/index.ts`: Added Room.manualMarkingMode, socket event types
- `server/room-manager.ts`: Initialize room with manualMarkingMode
- `server/socket-handler.ts`: Handle change_marking_mode event

**Permissions:**
- Only room host can change marking mode
- Server validates host permission before applying change

### 4. Client Implementation ✅
**Files Modified:**
- `hooks/useSocket.ts`: Added changeMarkingMode() function
- `components/game/SelectedCardsDisplay.tsx`:
  - Read mode from `room.manualMarkingMode` (not local store)
  - Only show toggle button to host
  - Show mode indicator to non-host players
- `store/useGameStore.ts`: Removed manualMarkingMode from persisted state

---

## User Experience

### For Room Host 🎮
**Before game:**
- See toggle button in "Vé của bạn" section
- Click to switch between:
  - ⚡ **Tự động đánh dấu** (Auto-mark - Green)
  - 🖱️ **Đánh dấu thủ công** (Manual-mark - Blue)
- Changes apply immediately to all players

**During game:**
- Can change mode anytime
- All players' cards update to new mode

### For Other Players 👥
**Before game:**
- See mode indicator (not clickable)
- Shows current mode set by host:
  - ⚡ **Tự động đánh dấu** (Light green badge)
  - 🖱️ **Đánh dấu thủ công** (Light blue badge)

**During game:**
- Cards automatically use the host's selected mode
- If host changes mode, all players update immediately

---

## Technical Details

### Data Flow
```
1. Host clicks toggle button
   ↓
2. SelectedCardsDisplay calls changeMarkingMode()
   ↓
3. useSocket emits 'change_marking_mode' to server
   ↓
4. Server validates host permission
   ↓
5. Server updates room.manualMarkingMode
   ↓
6. Server broadcasts 'marking_mode_changed' to all clients
   ↓
7. All clients receive 'room_update' with new mode
   ↓
8. All players' cards update to new mode
```

### State Management
**Before:**
```typescript
// Each player had their own preference (localStorage)
localStorage: {
  manualMarkingMode: true/false  // Per player
}
```

**After:**
```typescript
// Single source of truth in room state
room: {
  manualMarkingMode: boolean  // Set by host, shared by all
}
```

---

## Migration Notes

### Backward Compatibility
- Old `manualMarkingMode` in store kept for compatibility
- Component prop `manualMarkingMode` still works
- Falls back to `room.manualMarkingMode` if prop not provided

### Breaking Changes
- ❌ Players can no longer set their own marking preference
- ✅ All players use the same mode set by host
- ✅ Mode persists in room (not localStorage)

---

## Testing

### Test Host Control
1. Create room as host
2. Select cards
3. **Toggle marking mode** (see button change color)
4. Verify mode indicator updates

### Test Player View
1. Join room as non-host player
2. Select cards
3. **See mode indicator** (not button)
4. Ask host to change mode
5. Verify your indicator updates immediately

### Test During Game
1. Start game in auto mode
2. Numbers auto-mark on all players' cards
3. **Host switches to manual mode**
4. New numbers require clicking (all players)
5. **Host switches back to auto**
6. Numbers auto-mark again (all players)

---

## UI Comparison

### Host View (Clickable Button)
```
┌────────────────────────────────────────┐
│ Thẻ của bạn: 3    [⚡ Tự động đánh dấu] │ ← Clickable
│                   (Green, hoverable)    │
└────────────────────────────────────────┘
```

### Player View (Read-Only Indicator)
```
┌────────────────────────────────────────┐
│ Thẻ của bạn: 3    [⚡ Tự động đánh dấu] │ ← Read-only
│                   (Light green badge)   │
└────────────────────────────────────────┘
```

---

## Benefits

### 🎯 Consistent Experience
- ✅ All players use same mode
- ✅ No confusion about different marking styles
- ✅ Host controls game pace

### 🔧 Simplified State
- ✅ Single source of truth (room state)
- ✅ No per-player preferences to sync
- ✅ Mode persists in room, not localStorage

### 👥 Better for Multiplayer
- ✅ Host can set mode based on player skill
- ✅ New players see mode set by experienced host
- ✅ Fair for all players (same rules)

---

## Files Changed

### Types
- `types/index.ts`:
  - Added `Room.manualMarkingMode`
  - Added `ClientChangeMarkingModeEvent`
  - Added `ServerMarkingModeChangedEvent`
  - Updated `RoomSchema` and `ServerRoomUpdateEventSchema`

### Server
- `server/room-manager.ts`:
  - Initialize rooms with `manualMarkingMode: false`
- `server/socket-handler.ts`:
  - Added `change_marking_mode` handler
  - Validate host permission
  - Broadcast mode changes

### Client
- `hooks/useSocket.ts`:
  - Added `changeMarkingMode()` function
  - Listen for `marking_mode_changed` event
- `components/game/SelectedCardsDisplay.tsx`:
  - Read mode from `room.manualMarkingMode`
  - Show toggle only for host
  - Show indicator for non-host players
- `store/useGameStore.ts`:
  - Deprecated local `manualMarkingMode`
  - Removed from persisted state

---

## Ready to Use! 🚀

**Server URL**: http://localhost:3000

**Try it now:**
1. Open browser (host)
2. Create room
3. Select cards
4. See toggle button: [⚡ Tự động đánh dấu]
5. Click to switch modes
6. Open another browser (player)
7. Join the room
8. See mode indicator (not button)
9. Host changes mode → Player's indicator updates!

**Status:**
- ✅ Types updated
- ✅ Server handling mode changes
- ✅ Client socket events working
- ✅ UI showing correct controls
- ✅ Host permissions enforced
- ✅ Real-time updates to all players

Enjoy host-controlled marking modes! 🎴✨
