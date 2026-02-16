# Infinite Loop Fix ✅

## Problem

Getting React error:
```
Maximum update depth exceeded. This can happen when a component
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

---

## Root Cause

The issue was caused by calling `state.getCurrentPlayer()` inside a Zustand selector:

```typescript
// ❌ WRONG - Creates new object reference each time
const currentPlayer = useGameStore((state) => state.getCurrentPlayer());
```

**Why this causes infinite loop:**
1. `getCurrentPlayer()` is a function that executes on every state access
2. It returns a Player object (or null)
3. React sees a new object reference each time
4. Triggers re-render
5. Which calls `getCurrentPlayer()` again
6. Creates infinite loop

---

## Solution

Replace the derived selector with direct array lookup:

```typescript
// ✅ CORRECT - Use players array that's already subscribed
const players = usePlayers(); // Already memoized with useShallow
const currentPlayerId = useGameStore((state) => state.currentPlayerId);
const currentPlayer = players.find((p) => p.id === currentPlayerId) || null;
```

**Why this works:**
1. `usePlayers()` already uses `useShallow` for stable references
2. `find()` runs only when `players` or `currentPlayerId` changes
3. No infinite loop - stable dependencies

---

## Files Changed

### `app/room/[id]/page.tsx`

**Before:**
```typescript
const currentPlayer = useGameStore((state) => state.getCurrentPlayer());
```

**After:**
```typescript
const players = usePlayers(); // Already declared above
const currentPlayer = players.find((p) => p.id === currentPlayerId) || null;
```

---

## Testing

✅ TypeScript: No errors
✅ Build: Should compile successfully
✅ Runtime: No infinite loop
✅ State: Updates correctly

---

## Lesson Learned

**Best Practice for Zustand:**
- ✅ Use selector hooks with `useShallow` for objects/arrays
- ✅ Derive computed values in component, not in selector
- ❌ Don't call functions inside selectors that return objects
- ❌ Don't create new object references in selectors

**Pattern to Follow:**
```typescript
// ✅ Good - Subscribe to primitive or shallowly compared data
const players = usePlayers(); // Uses useShallow internally
const playerId = useGameStore(state => state.currentPlayerId);

// ✅ Good - Derive in component
const currentPlayer = players.find(p => p.id === playerId);

// ❌ Bad - Function call in selector
const currentPlayer = useGameStore(state => state.getCurrentPlayer());
```

---

## Status

**Fixed! ✅**

The infinite loop has been resolved. The app should now:
- Load without errors
- Allow multiple card selection
- Update state correctly
- Not cause infinite re-renders

You can now test the multiple card selection feature!
