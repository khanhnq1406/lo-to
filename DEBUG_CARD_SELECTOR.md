# Debug: Card Selector Not Showing

## Problem
The "Chọn Thẻ Chơi" (Card Selector) UI is not visible when joining a room.

## Root Causes

The CardSelector is conditionally rendered in `/app/room/[id]/page.tsx` at:
- Lines 350-361 (Desktop layout)
- Lines 418-434 (Mobile layout)

It only shows when **ALL** of these conditions are true:
```tsx
{gameState === 'waiting' && currentPlayerId && currentPlayer && (
  <CardSelector ... />
)}
```

### Checklist for Debugging:

1. **Check Game State**
   - Open browser DevTools Console
   - Check if `gameState === 'waiting'`
   - If game already started, it won't show

2. **Check Current Player ID**
   - Check if `currentPlayerId` is set
   - This should be set when you join the room

3. **Check Current Player Object**
   - Check if `currentPlayer` object exists in players array
   - This requires successful room join

## Quick Fix: Add Debug Logging

Add this temporarily to see what's happening:

```tsx
// In /app/room/[id]/page.tsx, before the CardSelector render

console.log('=== CARD SELECTOR DEBUG ===');
console.log('gameState:', gameState);
console.log('currentPlayerId:', currentPlayerId);
console.log('currentPlayer:', currentPlayer);
console.log('Should show CardSelector:',
  gameState === 'waiting' && currentPlayerId && currentPlayer
);
```

## Common Issues:

### Issue 1: Game Already Started
**Symptom:** CardSelector doesn't show
**Reason:** `gameState !== 'waiting'`
**Solution:** Create a new room or reset the current game

### Issue 2: Not Fully Joined
**Symptom:** CardSelector doesn't show
**Reason:** `currentPlayerId` or `currentPlayer` is null
**Solution:** Wait for connection to complete, or check server logs

### Issue 3: Component Hidden by CSS
**Symptom:** Component exists in DOM but not visible
**Reason:** CSS styling issue or z-index problem
**Solution:** Check browser DevTools Elements tab

## How to Test:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Navigate to a room**: http://localhost:3000/room/TEST
4. **Watch for auto-join logs**
5. **Check if CardSelector conditions are met**

## Expected Flow:

1. User visits `/room/TEST`
2. Page loads, waits for socket connection
3. Auto-joins room (lines 111-144)
4. Sets `hasJoined = true`
5. Room state updates via socket
6. `gameState` should be 'waiting'
7. `currentPlayerId` should be set
8. `currentPlayer` should exist in players array
9. CardSelector becomes visible

## Manual Override Test:

If you want to force-show the CardSelector for testing, temporarily remove the conditions:

```tsx
{/* Always show for testing */}
<CardSelector
  selectedCards={selectedCards}
  currentPlayerId={currentPlayerId || 'test-id'}
  players={players}
  gameStarted={false}  // Force to false
  onSelectCard={selectCard}
  onDeselectCard={deselectCard}
/>
```

**Remember to revert this after debugging!**
