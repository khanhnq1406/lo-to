# Vietnamese Lô Tô Game Engine

## Overview

This is an **authentic Vietnamese Lô Tô game engine** following traditional game rules based on extensive research of Vietnamese cultural sources.

## Quick Start

### Generate a Card

```typescript
import { generateCard } from './lib/game';

// Generate a single authentic Vietnamese Lô Tô card
const card = generateCard();

// Card structure:
// - 3 rows × 9 columns = 27 cells
// - 15 numbers (1-90) + 12 blanks
// - Each row: 5 numbers + 4 blanks
// - Column constraints enforced
```

### Check for Wins

```typescript
import { checkRowWin } from './lib/game';

const calledNumbers = new Set([1, 12, 25, 47, 72]); // Numbers called so far
const winningRows = checkRowWin(card, calledNumbers);

if (winningRows.length > 0) {
  console.log(`Player wins! Completed row ${winningRows[0]}`);
  // Player shouts "Kinh!" or "Lô tô!"
}
```

### Multiple Cards Per Player

```typescript
import { generateMultipleCards, checkPlayerWin } from './lib/game';

// Player selects 3 independent cards
const playerCards = generateMultipleCards(3);

// Check if player won on any card
const win = checkPlayerWin(playerCards, calledNumbers);

if (win) {
  console.log(`Win on card ${win.ticketIndex}, row ${win.rowIndices![0]}`);
}
```

## Authentic Rules

### Card Layout

```
┌────┬────┬────┬────┬────┬────┬────┬────┬────┐
│  3 │    │ 25 │    │ 47 │    │    │ 72 │    │  Row 0: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │ 12 │    │ 33 │    │ 56 │ 68 │    │ 89 │  Row 1: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│  7 │    │ 21 │    │ 44 │    │ 61 │    │ 90 │  Row 2: 5 numbers
└────┴────┴────┴────┴────┴────┴────┴────┴────┘
     15 numbers total, 12 blanks, 27 cells
```

### Key Features

1. **3 rows × 9 columns** = 27 cells per card
2. **15 numbers** (from 1-90) + **12 blank cells**
3. **Each row: exactly 5 numbers + 4 blanks**
4. **Column constraints:**
   - Column 0: 1-9
   - Column 1: 10-19
   - Column 2: 20-29
   - Column 3: 30-39
   - Column 4: 40-49
   - Column 5: 50-59
   - Column 6: 60-69
   - Column 7: 70-79
   - Column 8: 80-90
5. **Numbers sorted ascending** within each column
6. **Win condition: Complete any 1 horizontal row** (all 5 numbers)

## API Reference

### Card Generation

#### `generateCard(seed?: number): Card`

Generates a single authentic Vietnamese Lô Tô card.

```typescript
const card = generateCard(); // Random generation
const card = generateCard(12345); // Deterministic with seed (for testing)
```

#### `generateMultipleCards(count: number, seed?: number): Card[]`

Generates multiple independent cards.

```typescript
const cards = generateMultipleCards(3); // 3 random cards
const cards = generateMultipleCards(5, 99999); // 5 deterministic cards
```

### Validation

#### `validateCard(card: Card): boolean`

Validates if a card follows authentic Vietnamese Lô Tô rules.

```typescript
const isValid = validateCard(card);

// Checks:
// ✓ 3 rows × 9 columns structure
// ✓ Exactly 15 numbers + 12 blanks
// ✓ Each row has 5 numbers + 4 blanks
// ✓ Numbers in range 1-90
// ✓ No duplicate numbers
// ✓ Column constraints enforced
// ✓ Numbers sorted within columns
```

### Win Detection

#### `checkRowWin(card: Card, calledNumbers: Set<number>): number[]`

Checks which rows (if any) have been completed.

```typescript
const winningRows = checkRowWin(card, calledNumbers);

if (winningRows.length > 0) {
  console.log(`Row ${winningRows[0]} is complete!`);
}

// Returns: Array of winning row indices (0-2)
// Empty array if no wins
```

#### `checkPlayerWin(cards: Card[], calledNumbers: Set<number>): WinResult | null`

Checks if player won on any of their cards.

```typescript
const win = checkPlayerWin(playerCards, calledNumbers);

if (win) {
  console.log(`Card ${win.ticketIndex}, Row ${win.rowIndices![0]} wins!`);
}

// Returns: WinResult object or null
```

### Utility Functions

#### `getCardNumbers(card: Card): number[]`

Gets all numbers from a card.

```typescript
const numbers = getCardNumbers(card); // [1, 7, 12, 21, 25, ...]
```

#### `getRemainingNumbers(calledNumbers: Set<number>): number[]`

Gets uncalled numbers (from 1-90).

```typescript
const remaining = getRemainingNumbers(new Set([1, 2, 3]));
// Returns: [4, 5, 6, ..., 90]
```

#### `randomCallNumber(remaining: number[], seed?: number): number | null`

Randomly selects next number to call.

```typescript
const remaining = getRemainingNumbers(calledNumbers);
const nextNumber = randomCallNumber(remaining);

if (nextNumber !== null) {
  console.log(`Calling number: ${nextNumber}`);
}
```

#### `formatNumber(num: number): string`

Formats a number for display (1-90 range).

```typescript
formatNumber(5);  // "5"
formatNumber(42); // "42"
formatNumber(90); // "90"
```

## Testing

### Run All Tests

```bash
npx tsx test-authentic-game.ts
```

Tests verify:
- ✓ 3×9 card structure
- ✓ 15 numbers + 12 blanks
- ✓ 5 numbers per row
- ✓ Number range 1-90
- ✓ Column constraints
- ✓ Numbers sorted within columns
- ✓ Row win detection
- ✓ Multiple card generation
- ✓ Player win detection
- ✓ Edge case handling

### Visual Demo

```bash
npx tsx demo-authentic-cards.ts
```

Shows visual examples of authentic cards with:
- Single card generation
- Multiple cards per player
- Win scenarios
- Column constraint visualization
- Before/after comparison
- Traditional calling phrases

## Backward Compatibility

All old functions are maintained with `@deprecated` tags:

```typescript
// Legacy API (still works)
import { generateTicket, checkPlayerWin } from './lib/game';

const tickets = generateMultipleTickets(2, 2); // Old format
const win = checkPlayerWin(tickets, calledNumbers); // Still works
```

## Type Definitions

```typescript
// Cell value: number (1-90) or null (blank)
type CellValue = number | null;

// Card: 3 rows × 9 columns
type Card = CellValue[][];

// Ticket: alias for Card (backward compatibility)
type Ticket = Card;

// Win result
interface WinResult {
  ticketIndex: number;  // Which card won
  boardIndex: number;   // Always 0 (for compatibility)
  type: WinType;        // 'row' for authentic rules
  rowIndices?: number[]; // Winning row indices (0-2)
}

type WinType = 'row' | 'twoRows' | 'fourCorners' | 'fullBoard';
// Note: Only 'row' is authentic; others kept for compatibility
```

## Cultural Context

Vietnamese Lô Tô is a traditional family game played during:
- **Tết (Lunar New Year)** celebrations
- Family gatherings
- Community events

### Traditional Calling Phrases

Callers use rhyming Vietnamese phrases to announce numbers:

| Number | Vietnamese | English |
|--------|-----------|---------|
| 11 | Hai cây giậu | Two sticks |
| 22 | Hai con ngỗng | Two geese |
| 33 | Ba ba | Three threes |
| 69 | Mười chín nụ hôn | Nineteen kisses |
| 77 | Bảy bảy | Seven seven |
| 88 | Hai bà già | Two old ladies |
| 90 | Cụ già | Elderly person |

## Resources

- `/AUTHENTIC_VIETNAMESE_LOTO_RULES.md` - Complete research and sources
- `/AUTHENTIC_CARD_EXAMPLES.md` - Visual examples of authentic cards
- `/GAME_ENGINE_REWRITE_SUMMARY.md` - Before/after comparison
- `/test-authentic-game.ts` - Comprehensive test suite
- `/demo-authentic-cards.ts` - Visual demonstration script

## License

This implementation is based on traditional Vietnamese Lô Tô game rules, which are in the public domain as a cultural game.
