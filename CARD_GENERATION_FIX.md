# Card Generation Fix - Summary

## Problem

Players were always seeing "Bạn chưa có phiếu dò nào. Hãy tạo phiếu dò mới để tham gia chơi!" (You don't have any cards) message after joining a room.

## Root Cause

Race condition in card generation:

1. When `joinRoom()` was called, it emitted the `join_room` event
2. Then it set a 100ms timeout to call `generateTickets()`
3. But `generateTickets()` required `roomId` from the store
4. The `roomId` only gets set when the `room_update` event arrives from server
5. **The race**: Sometimes the server's `room_update` hadn't arrived yet within 100ms, so `roomId` was still `null`, and `generateTickets()` silently failed

## Solution Implemented

### Option 1: Automatic Generation on room_update

**Modified files:**

- `hooks/useSocket.ts`

**Changes:**

1. Added `needsTicketsRef` and `pendingCardCountRef` to track when tickets need to be auto-generated
2. Modified `createRoom()` and `joinRoom()` to set these flags instead of using setTimeout
3. Enhanced `room_update` event handler to automatically generate tickets when:
   - `needsTicketsRef.current` is true
   - Player has no tickets (`tickets.length === 0`)
   - Room is in 'waiting' state (not started yet)
   - Room data is available

**Advantages:**

- Eliminates race condition completely
- Works reliably regardless of network latency
- Happens immediately after room state is available

### Option 3: Manual Card Generation Button

**New files:**

- `components/game/CardGenerator.tsx`

**Modified files:**

- `components/game/index.ts` (export)
- `app/room/[id]/page.tsx` (integration)

**Features:**

- Blue card with icon indicating whether cards exist or not
- Card count selector (1-5 cards)
- "Tạo phiếu dò" (Create Cards) or "Tạo lại phiếu dò" (Regenerate Cards) button
- Only shown when game hasn't started
- Saves card count to localStorage
- Integrated in both desktop and mobile layouts

**Advantages:**

- Provides fallback if auto-generation somehow fails
- Allows users to change card count before game starts
- Better UX with clear visual feedback

## How It Works Now

### First Time Join

1. User joins room with card count (default 3)
2. `needsTicketsRef` is set to `true`
3. `pendingCardCountRef` stores the card count
4. When `room_update` arrives:
   - Check if player needs tickets
   - Check if player has no tickets
   - Automatically emit `generate_tickets` event
   - Reset the flag

### Manual Generation

1. CardGenerator component shows up when:
   - Player has no cards, OR
   - Game is in 'waiting' state (allows regeneration)
2. User can select card count (1-5)
3. Click "Tạo phiếu dò" or "Tạo lại phiếu dò"
4. Tickets are generated via `generateTickets()` function

## Testing Checklist

- [ ] Join a new room - cards should auto-generate
- [ ] Refresh page while in room - cards should persist
- [ ] Click "Tạo lại phiếu dò" before game starts - should regenerate
- [ ] Start game - CardGenerator should disappear
- [ ] Try with different card counts (1-5)
- [ ] Test on mobile layout
- [ ] Test with slow network connection

## Files Modified

1. `hooks/useSocket.ts` - Auto-generation logic
2. `components/game/CardGenerator.tsx` - New component
3. `components/game/index.ts` - Export
4. `app/room/[id]/page.tsx` - Integration

## Future Improvements

- Add loading state to CardGenerator while generating
- Add success/error toast notifications
- Consider persisting card count in user preferences
- Add animation when cards appear
