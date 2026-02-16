# Z-Index and Click Issue Fix

## Problem

User reported that they couldn't click on anything in the "Tạo phiếu dò chơi" (Card Generator) and "Chia sẻ phòng" (Share Room) sections. This was a layering/z-index issue.

## Root Cause

Multiple components had z-index and positioning issues:

1. **RoomInfo component** had a decorative overlay with `absolute` positioning but parent wasn't `relative`
2. **Left panel** (CallerPanel) was potentially overlapping the right panel content
3. **Interactive elements** (buttons, inputs) weren't properly elevated above background decorations

## Solution Applied

### 1. Fixed RoomInfo Component

**File: `components/game/RoomInfo.tsx`**

Changes:

- Added `relative` to parent container to establish positioning context
- Added `relative z-10` to all interactive sections:
  - Room ID section
  - Info grid (player count, game state, created time)
  - Share button container
- This ensures all interactive elements are above the decorative overlay (which has `pointer-events-none`)

### 2. Fixed CardGenerator Component

**File: `components/game/CardGenerator.tsx`**

Changes:

- Added `relative z-10` to the main container
- Ensures the entire card generator (buttons, inputs) is above other elements

### 3. Fixed Layout Panel Stacking

**File: `app/room/[id]/page.tsx`**

Changes:

- Added `relative z-0` to left panel (CallerPanel)
- Added `relative z-10` to right panel (Player Info)
- This ensures the right panel with interactive elements is always above the left panel

## Z-Index Hierarchy

```
z-50  - Error toast (fixed top)
z-40  - Leave room button (fixed top-right)
z-40  - Mobile bottom sheet
z-30  - Mobile sticky top
z-10  - Right panel (interactive elements)
z-10  - RoomInfo interactive sections
z-10  - CardGenerator
z-0   - Left panel (CallerPanel)
auto  - Background decorations (with pointer-events-none)
```

## Testing Checklist

- [x] Click on card count buttons (1-5) in CardGenerator
- [x] Click "Tạo phiếu dò" button
- [x] Click "Chia sẻ phòng" button in RoomInfo
- [x] Click on player count/game state/time info
- [x] Copy room ID
- [x] Test on both desktop and mobile layouts
- [x] Ensure no visual regressions

## Technical Details

### Why This Works

1. **Stacking Context**: By adding `relative` to parent containers, we establish proper stacking contexts
2. **Z-Index Elevation**: Interactive elements get `z-10`, background gets `z-0` or `auto`
3. **Pointer Events**: Decorative overlays use `pointer-events-none` so they don't block clicks
4. **Grid Layout**: Using `relative` on grid items prevents them from overlapping incorrectly

### Best Practices Applied

- Always use `relative` on parent when using `absolute` children
- Elevate interactive elements above decorative ones
- Use semantic z-index values (multiples of 10) for clarity
- Document the z-index hierarchy for future reference

## Files Modified

1. `components/game/RoomInfo.tsx` - Fixed decorative overlay positioning
2. `components/game/CardGenerator.tsx` - Elevated component z-index
3. `app/room/[id]/page.tsx` - Fixed panel stacking order

## Additional Notes

- The decorative overlay in RoomInfo already had `pointer-events-none`, which is correct
- The fix doesn't change any visual appearance, only the click behavior
- All animations and transitions remain intact
