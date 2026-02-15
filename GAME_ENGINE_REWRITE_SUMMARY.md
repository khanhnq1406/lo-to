# Game Engine Rewrite Summary

## Overview

The game engine has been **completely rewritten** to follow **authentic Vietnamese Lô Tô rules** based on extensive research of traditional game formats.

---

## Critical Changes

### 1. Card Layout (MOST IMPORTANT)

#### BEFORE (WRONG):
```
5 rows × 4 columns = 20 cells
All 20 cells filled with numbers (0-99)
No column constraints

Example "mini board":
┌────┬────┬────┬────┐
│  0 │  1 │  2 │  3 │
│  4 │  5 │  6 │  7 │
│  8 │  9 │ 10 │ 11 │
│ 12 │ 13 │ 14 │ 15 │
│ 16 │ 17 │ 18 │ 19 │
└────┴────┴────┴────┘
```

#### AFTER (AUTHENTIC):
```
3 rows × 9 columns = 27 cells
15 numbers (1-90) + 12 blanks
Each row: exactly 5 numbers + 4 blanks
Column constraints enforced

Example authentic card:
┌────┬────┬────┬────┬────┬────┬────┬────┬────┐
│  3 │    │ 25 │    │ 47 │    │    │ 72 │    │
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │ 12 │    │ 33 │    │ 56 │ 68 │    │ 89 │
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│  7 │    │ 21 │    │ 44 │    │ 61 │    │ 90 │
└────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

---

### 2. Number Range

| Aspect | Before | After |
|--------|--------|-------|
| **Range** | 0-99 (100 numbers) | **1-90 (90 numbers)** ✓ |
| **Display** | 00, 01, 02, ..., 99 | 1, 2, 3, ..., 90 |
| **Leading zeros** | Yes (padded to 2 digits) | No (natural numbers) |

---

### 3. Column Constraints (NEW!)

Each column must contain numbers from a specific range:

| Column | Range | Example Numbers |
|--------|-------|-----------------|
| 0 | 1-9 | 3, 7 |
| 1 | 10-19 | 12 |
| 2 | 20-29 | 21, 25 |
| 3 | 30-39 | 33 |
| 4 | 40-49 | 44, 47 |
| 5 | 50-59 | 56 |
| 6 | 60-69 | 61, 68 |
| 7 | 70-79 | 72 |
| 8 | 80-90 | 89, 90 |

Numbers within each column are **sorted ascending** from top to bottom.

---

### 4. Win Conditions (SIMPLIFIED)

#### BEFORE (WRONG):
- ✓ 1 row win
- ✓ 2 rows win
- ✓ 4 corners win
- ✓ Full board win (all 20 numbers)

#### AFTER (AUTHENTIC):
- **✓ 1 row win ONLY** (complete any horizontal row)

**That's it!** In authentic Vietnamese Lô Tô, the first player to complete any horizontal row (all 5 numbers marked) wins the game and shouts "Kinh!" or "Lô tô!"

---

### 5. Multiple Cards (KEPT - CORRECT)

Players can hold multiple independent cards:
- **Before:** ✓ Supported (but wrong card format)
- **After:** ✓ Supported (with correct authentic format)

Each card is independent, and numbers CAN repeat across different cards.

---

## API Changes

### New Functions

```typescript
// New primary function for generating authentic cards
function generateCard(seed?: number): Card

// New helper for multiple cards
function generateMultipleCards(cardCount: number, seed?: number): Card[]

// New validation for authentic format
function validateCard(card: Card): boolean

// New helper to get numbers from card
function getCardNumbers(card: Card): number[]
```

### Legacy Functions (Kept for Backward Compatibility)

All old functions are maintained but marked as `@deprecated`:

```typescript
// Old functions still work but use new format internally
generateTicket(boardCount: 1 | 2 | 3, seed?: number): Ticket[]
generateMultipleTickets(ticketCount: number, boardsPerTicket: 1 | 2 | 3, seed?: number): Ticket[][]
validateTicket(ticket: Ticket[] | Ticket): boolean
getTicketNumbers(ticket: Ticket[] | Ticket): number[]
```

### Modified Functions

```typescript
// Updated to work with 1-90 range (not 0-99)
getRemainingNumbers(calledNumbers: Set<number>): number[]

// Updated to work with 3×9 cards (not 5×4)
checkRowWin(card: Card, calledNumbers: Set<number>): number[]

// Simplified - no leading zeros for 1-90 range
formatNumber(num: number): string
```

### Deprecated Functions (Still Work)

These win types are not part of authentic Vietnamese Lô Tô, but kept for backward compatibility:

```typescript
// @deprecated - Not part of authentic rules
checkTwoRows(card: Card, calledNumbers: Set<number>): boolean

// @deprecated - Not part of authentic rules
checkFourCorners(card: Card, calledNumbers: Set<number>): boolean

// @deprecated - Not part of authentic rules
checkFullBoard(card: Card, calledNumbers: Set<number>): boolean
```

---

## Type Changes

### Before:
```typescript
type CellValue = number | null; // 0-99 or null
type MiniBoard = CellValue[][]; // 5 rows × 4 columns
type Ticket = MiniBoard[]; // 1-3 mini boards
```

### After:
```typescript
type CellValue = number | null; // 1-90 or null
type Card = CellValue[][]; // 3 rows × 9 columns
type Ticket = Card; // Alias for backward compatibility
type MiniBoard = Card; // @deprecated - use Card instead
```

---

## Validation Rules

### Before:
```typescript
// Old validation:
✓ 5 rows × 4 columns = 20 cells
✓ Exactly 20 numbers per board
✓ Numbers in range 0-99
✓ All numbers unique within ticket
```

### After:
```typescript
// New validation:
✓ 3 rows × 9 columns = 27 cells
✓ Exactly 15 numbers per card
✓ Exactly 12 blanks per card
✓ Each row has exactly 5 numbers + 4 blanks
✓ Numbers in range 1-90
✓ All numbers unique within card
✓ Column constraints enforced (col 0 = 1-9, etc.)
✓ Numbers sorted ascending within each column
```

---

## Testing

### Test Coverage

All authentic rules are thoroughly tested:

```bash
npx tsx test-authentic-game.ts
```

Tests verify:
1. ✓ 3×9 card structure
2. ✓ 15 numbers + 12 blanks
3. ✓ 5 numbers per row
4. ✓ Number range 1-90
5. ✓ Column range constraints
6. ✓ Numbers sorted within columns
7. ✓ Card validation
8. ✓ Row win detection
9. ✓ Remaining numbers calculation
10. ✓ Number formatting
11. ✓ Multiple card generation
12. ✓ Player win detection
13. ✓ Deterministic generation with seed
14. ✓ Visual card display
15. ✓ Edge case handling

**All 15 tests pass!** ✓

---

## Visual Examples

See `/AUTHENTIC_CARD_EXAMPLES.md` for detailed visual examples of authentic Vietnamese Lô Tô cards.

---

## Migration Guide

### For New Code:

Use the new API:

```typescript
import { generateCard, validateCard, checkRowWin } from './lib/game';

// Generate a single card
const card = generateCard();

// Generate multiple cards for a player
const playerCards = generateMultipleCards(3); // 3 independent cards

// Check for wins (only row wins in authentic rules)
const winningRows = checkRowWin(card, calledNumbers);
if (winningRows.length > 0) {
  console.log('Winner! Completed row:', winningRows[0]);
}
```

### For Existing Code:

Legacy functions still work:

```typescript
import { generateTicket, checkPlayerWin } from './lib/game';

// Old API still works (uses new format internally)
const tickets = generateMultipleTickets(2, 2); // 2 tickets, 2 boards each

// Old win detection still works
const win = checkPlayerWin(tickets, calledNumbers);
```

---

## Key Takeaways

1. **Card layout changed:** 5×4 → 3×9
2. **Number range changed:** 0-99 → 1-90
3. **Column constraints added:** Each column has specific number range
4. **Win conditions simplified:** Only 1 row win (no 2 rows, 4 corners, full board)
5. **Blanks added:** 12 blank cells per card (not all cells filled)
6. **Row structure enforced:** Exactly 5 numbers + 4 blanks per row
7. **Backward compatibility maintained:** Old functions still work

---

## Cultural Context

Authentic Vietnamese Lô Tô is traditionally played during:
- **Tết (Lunar New Year)** celebrations
- Family gatherings
- Community events

Callers often use **rhyming phrases** to announce numbers:
- **11** - "Hai cây giậu" (Two sticks)
- **22** - "Hai con ngỗng" (Two geese)
- **69** - "Mười chín nụ hôn" (Nineteen kisses)
- **88** - "Hai bà già" (Two old ladies)

---

## References

See `/AUTHENTIC_VIETNAMESE_LOTO_RULES.md` for complete research and sources.
