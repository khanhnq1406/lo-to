# Vietnamese Lô Tô Game Engine

Pure deterministic functions for Vietnamese Lô Tô (Vietnamese Bingo) game logic.

## Overview

This game engine implements the core logic for Vietnamese Lô Tô, a real-time multiplayer game. All functions are pure (no side effects), making them testable and suitable for both client-side and server-side validation.

## Vietnamese Lô Tô Format

- **Ticket**: Contains 1-3 mini boards (user selects)
- **Mini Board**: 5 rows × 4 columns = 20 cells
- **Numbers**: Each mini board has exactly 20 unique numbers (0-99)
- **Uniqueness**: All numbers are unique across the entire ticket (no duplicates)
- **Display**: Numbers formatted as 00-99 with leading zeros
- **Sorting**: Numbers are sorted within columns for traditional appearance

## Core Types

```typescript
type CellValue = number | null; // number 0-99 or null for blank
type MiniBoard = CellValue[][]; // 5 rows × 4 columns
type Ticket = MiniBoard[]; // 1-3 mini boards
```

## API Functions

### Ticket Generation

#### `generateTicket(boardCount: 1 | 2 | 3, seed?: number): Ticket`

Generates a Vietnamese Lô Tô ticket with specified number of mini boards.

**Parameters:**
- `boardCount`: Number of mini boards (1-3)
- `seed`: Optional seed for deterministic generation (useful for testing)

**Returns:** Generated ticket with mini boards

**Example:**
```typescript
const ticket = generateTicket(3); // 3 boards, 60 unique numbers
```

### Win Detection

#### `checkRowWin(board: MiniBoard, calledNumbers: Set<number>): number[]`

Checks if any row is completely filled with called numbers.

**Returns:** Array of winning row indices (0-4), empty if no wins

**Example:**
```typescript
const calledNumbers = new Set([1, 2, 3, 4, 10, 20, 30, 40]);
const winningRows = checkRowWin(board, calledNumbers);
// Returns [0, 1] if rows 0 and 1 are complete
```

#### `checkTwoRows(board: MiniBoard, calledNumbers: Set<number>): boolean`

Checks if a board has at least 2 complete rows.

**Returns:** True if 2 or more rows are complete

#### `checkFourCorners(board: MiniBoard, calledNumbers: Set<number>): boolean`

Checks if the four corners of a mini board are marked.

**Corners:** top-left [0][0], top-right [0][3], bottom-left [4][0], bottom-right [4][3]

**Returns:** True if all non-null corner numbers have been called

#### `checkFullBoard(board: MiniBoard, calledNumbers: Set<number>): boolean`

Checks if all numbers on a mini board have been called (full house/blackout).

**Returns:** True if all 20 numbers on the board have been called

### Number Management

#### `getRemainingNumbers(calledNumbers: Set<number>): number[]`

Gets the list of numbers that haven't been called yet (0-99).

**Example:**
```typescript
const called = new Set([0, 1, 2, 99]);
const remaining = getRemainingNumbers(called); // [3, 4, 5, ..., 98]
```

#### `randomCallNumber(remainingNumbers: number[], seed?: number): number | null`

Randomly selects a number from the remaining uncalled numbers.

**Parameters:**
- `remainingNumbers`: Array of numbers that haven't been called
- `seed`: Optional seed for deterministic selection (for testing)

**Returns:** Random number from remaining, or null if no numbers left

### Utility Functions

#### `validateTicket(ticket: Ticket): boolean`

Validates if a ticket structure is valid.

**Checks:**
- 1-3 boards
- Each board: 5 rows × 4 columns
- Exactly 20 numbers per board
- All numbers 0-99
- No duplicate numbers across ticket

#### `formatNumber(num: number): string`

Formats a number for display (adds leading zero if needed).

**Example:**
```typescript
formatNumber(5);  // "05"
formatNumber(42); // "42"
```

#### `getTicketNumbers(ticket: Ticket): number[]`

Gets all numbers from a ticket.

**Returns:** Array of all numbers in the ticket

#### `hasNumber(ticket: Ticket, number: number): boolean`

Checks if a specific number exists in a ticket.

#### `findNumberPosition(ticket: Ticket, number: number): { boardIndex: number; rowIndex: number; colIndex: number } | null`

Gets the board and position of a number in a ticket.

**Returns:** Object with indices, or null if not found

## Usage Example

```typescript
import {
  generateTicket,
  checkRowWin,
  checkFullBoard,
  getRemainingNumbers,
  randomCallNumber,
  formatNumber,
} from './game';

// Generate a ticket with 2 boards
const ticket = generateTicket(2);

// Start calling numbers
const calledNumbers = new Set<number>();
const remaining = getRemainingNumbers(calledNumbers);
const nextNumber = randomCallNumber(remaining);

if (nextNumber !== null) {
  calledNumbers.add(nextNumber);
  console.log(`Called: ${formatNumber(nextNumber)}`);
}

// Check for wins
const board1 = ticket[0];
const rowWins = checkRowWin(board1, calledNumbers);

if (rowWins.length > 0) {
  console.log(`Rows ${rowWins.join(', ')} are complete!`);
}

if (checkFullBoard(board1, calledNumbers)) {
  console.log('FULL BOARD! Winner!');
}
```

## Testing

Run tests:
```bash
npx tsx lib/game.test.ts
```

View examples:
```bash
npx tsx lib/game.example.ts
```

## Design Principles

1. **Pure Functions**: No side effects, all functions return new values
2. **Deterministic**: Optional seed parameter for testing and replay
3. **Type Safety**: Full TypeScript typing with strict mode
4. **Validation**: Comprehensive input validation and edge case handling
5. **Performance**: Efficient algorithms, O(1) lookups with Set data structure
6. **Testability**: Easy to test, mock, and verify

## Win Conditions

Vietnamese Lô Tô typically has multiple win conditions:

1. **Single Row**: First to complete any single row
2. **Two Rows**: First to complete any two rows
3. **Four Corners**: First to mark all four corners
4. **Full Board**: First to mark all 20 numbers (blackout/full house)

Each condition can award different prizes or points.

## Traditional Format

The Vietnamese Lô Tô format differs from American Bingo:

- Uses numbers 00-99 (vs 1-75)
- 5 rows × 4 columns (vs 5×5)
- 20 numbers per board (vs 25)
- No free space in center
- Numbers sorted within columns
- Multiple boards per ticket common

## Integration Notes

### Client Side
- Use for ticket display and local validation
- Real-time win detection for immediate feedback
- Visual marking of called numbers

### Server Side
- Use for authoritative game state
- Validate client-reported wins
- Generate tickets for new players
- Manage number calling sequence

### Multiplayer Synchronization
- Server is source of truth for called numbers
- Clients receive called numbers via WebSocket
- Both sides run same win detection logic
- Server validates all win claims
