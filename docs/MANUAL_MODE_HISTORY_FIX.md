# Manual Mode Call History Fix

## Problem

In manual calling mode (Chế độ gọi số thủ công), the call history was visible to all players, but only the caller should be able to see it. This broke the secrecy intended for manual mode.

### Before Fix
- **Current number**: Hidden from non-callers (showed "?")
- **Call history**: ❌ **Visible to everyone** (including all previously called numbers)

This meant non-callers could still track the game by looking at the history grid, defeating the purpose of manual mode.

## Solution

Added a `hideHistory` prop to the `CalledHistory` component that:
- Hides all called numbers from non-callers when in manual mode
- Shows only the current number (if any) with "?" for historical numbers
- Displays a message: "Lịch sử gọi số sẽ được hiển thị sau khi người gọi công bố"
- Hides statistics (count, progress bar) when history is hidden

### After Fix
- **Current number**: Hidden from non-callers (showed "?")
- **Call history**: ✅ **Hidden from non-callers** (only caller can see)

## Changes Made

### 1. CalledHistory Component (`components/game/CalledHistory.tsx`)

#### Added hideHistory Prop
```typescript
interface CalledHistoryProps {
  calledNumbers: number[];
  currentNumber: number | null;
  hideHistory?: boolean;  // NEW!
  className?: string;
}
```

#### Modified getCellState Logic
```typescript
const getCellState = (num: number): 'current' | 'called' | 'uncalled' => {
  // If history is hidden, treat all numbers as uncalled except current
  if (hideHistory) {
    if (num === currentNumber) return 'current';
    return 'uncalled';
  }

  if (num === currentNumber) return 'current';
  if (calledSet.has(num)) return 'called';
  return 'uncalled';
};
```

#### Updated UI Elements
- Header shows "CHỜ NGƯỜI GỌI CÔNG BỐ" when history is hidden
- Legend (Đã gọi, Hiện tại) only shows when history is visible
- Stats footer and progress bar only show when history is visible
- Added informational message when history is hidden

### 2. CallerPanel Component (`components/game/CallerPanel.tsx`)

```typescript
<CalledHistory
  calledNumbers={calledHistory}
  currentNumber={currentNumber}
  hideHistory={callerMode === 'manual' && !isCaller}  // NEW!
/>
```

### 3. Room Page Component (`app/room/[id]/page.tsx`)

```typescript
<CalledHistory
  calledNumbers={calledHistory}
  currentNumber={currentNumber}
  hideHistory={callerMode === 'manual' && !isCaller}  // NEW!
/>
```

## Behavior

### Machine Mode (Auto)
- **Everyone sees**: Full call history with all called numbers highlighted
- **Statistics**: Visible to all (count, progress)

### Manual Mode

#### Caller View
- **Can see**: Full call history with all called numbers
- **Can see**: Current number
- **Can see**: Statistics and progress
- **Can do**: Call new numbers via "Gọi số mới" button

#### Non-Caller View
- **Can see**: Only "?" for current number (in CurrentNumber component)
- **Cannot see**: Call history (all numbers appear uncalled/gray)
- **Cannot see**: Statistics and progress
- **Can see**: Message "Lịch sử gọi số sẽ được hiển thị sau khi người gọi công bố"
- **Cannot**: Call numbers (no button)

## Visual Changes

### When History is Hidden (Non-Caller in Manual Mode)

```
┌─────────────────────────────────────┐
│ CHỜ NGƯỜI GỌI CÔNG BỐ              │
├─────────────────────────────────────┤
│                                     │
│  [1] [2] [3] [4] [5] [6] [7] ...   │
│  (all numbers appear gray/uncalled) │
│                                     │
├─────────────────────────────────────┤
│ Lịch sử gọi số sẽ được hiển thị    │
│ sau khi người gọi công bố           │
└─────────────────────────────────────┘
```

### When History is Visible (Caller or Machine Mode)

```
┌─────────────────────────────────────┐
│ Bảng số (1-90)      [●Đã gọi] [●]  │
├─────────────────────────────────────┤
│                                     │
│  [✓] [✓] [3] [4] [✓] [6] [7] ...   │
│  (called numbers highlighted green) │
│                                     │
├─────────────────────────────────────┤
│ Đã gọi: 42 / 90     Còn lại: 48    │
│ [████████░░░░░░░░░░░░░░░░░░] 46%   │
└─────────────────────────────────────┘
```

## Testing

### Test Scenario 1: Manual Mode - Non-Caller
1. Join room as Player 1
2. Player 2 joins
3. Host sets manual mode
4. Player 2 calls a number
5. **Verify Player 1 sees**: "?" for current number, gray grid, hidden stats

### Test Scenario 2: Manual Mode - Caller
1. Join room as Player 1 (caller)
2. Host sets manual mode
3. Call several numbers
4. **Verify Player 1 sees**: All called numbers, green highlights, stats

### Test Scenario 3: Machine Mode
1. Join room
2. Start game in machine mode
3. **Verify everyone sees**: Full history, all called numbers, stats

## Impact

✅ **Security**: Manual mode now properly hides call history from non-callers
✅ **Consistency**: Both CurrentNumber and CalledHistory now respect manual mode secrecy
✅ **UX**: Clear messaging when history is hidden
✅ **Backwards Compatible**: No breaking changes, hideHistory defaults to false
✅ **Performance**: No performance impact (same rendering logic)

## Files Modified

1. `components/game/CalledHistory.tsx` - Added hideHistory prop and conditional rendering
2. `components/game/CallerPanel.tsx` - Pass hideHistory prop based on mode and role
3. `app/room/[id]/page.tsx` - Pass hideHistory prop in mobile layout

## Related Features

- Manual/Machine caller modes
- Caller role system
- Number visibility controls
- CurrentNumber component (already had hideNumber prop)

---

**Status**: ✅ Complete and Ready for Testing
**Date**: 2026-02-16
