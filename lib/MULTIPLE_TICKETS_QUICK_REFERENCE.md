# Multiple Tickets Quick Reference Guide

## Quick Start

### Generate Multiple Tickets
```typescript
import { generateMultipleTickets } from './lib/game';

// Generate 3 tickets, each with 2 mini boards
const playerTickets = generateMultipleTickets(3, 2);
```

### Check for Wins
```typescript
import { checkPlayerWin } from './lib/game';

const calledNumbers = new Set([1, 2, 3, 4, 5, ...]);
const win = checkPlayerWin(playerTickets, calledNumbers);

if (win) {
  console.log(`Winner!`);
  console.log(`  Ticket: ${win.ticketIndex + 1}`);
  console.log(`  Board: ${win.boardIndex + 1}`);
  console.log(`  Type: ${win.type}`);
}
```

### Get All Player Numbers
```typescript
import { getPlayerTicketNumbers } from './lib/game';

const allNumbers = getPlayerTicketNumbers(playerTickets);
console.log(`Player has ${allNumbers.size} unique numbers`);
```

## Function Reference

### `generateMultipleTickets(ticketCount, boardsPerTicket, seed?)`
Generates multiple independent tickets for a player.

**Parameters:**
- `ticketCount: number` - Number of tickets (≥ 1)
- `boardsPerTicket: 1 | 2 | 3` - Boards per ticket
- `seed?: number` - Optional seed for deterministic generation

**Returns:** `Ticket[]`

**Example:**
```typescript
const tickets = generateMultipleTickets(3, 2);
// 3 tickets × 2 boards × 20 numbers = 120 total numbers
```

---

### `checkPlayerWin(tickets, calledNumbers)`
Checks if player won on any ticket.

**Parameters:**
- `tickets: Ticket[]` - Player's tickets
- `calledNumbers: Set<number>` - Called numbers

**Returns:** `WinResult | null`

**Win Priority:** fullBoard > twoRows > fourCorners > row

**Example:**
```typescript
const win = checkPlayerWin(tickets, new Set([1, 2, 3, ...]));
if (win) {
  // Handle win
}
```

---

### `getPlayerTicketNumbers(tickets)`
Gets all unique numbers across player's tickets.

**Parameters:**
- `tickets: Ticket[]` - Player's tickets

**Returns:** `Set<number>`

**Example:**
```typescript
const allNumbers = getPlayerTicketNumbers(tickets);
// Returns Set of unique numbers
```

---

### `checkTicketWin(ticket, calledNumbers)`
Checks win for a single ticket (helper function).

**Parameters:**
- `ticket: Ticket` - Single ticket
- `calledNumbers: Set<number>` - Called numbers

**Returns:** `WinResult | null`

**Example:**
```typescript
const win = checkTicketWin(singleTicket, calledNumbers);
// win.ticketIndex will always be 0
```

---

### `validateMultipleTickets(tickets)`
Validates array of tickets.

**Parameters:**
- `tickets: Ticket[]` - Tickets to validate

**Returns:** `boolean`

**Example:**
```typescript
const valid = validateMultipleTickets(tickets);
if (!valid) {
  console.error('Invalid tickets!');
}
```

## Types Reference

### `WinType`
```typescript
type WinType = 'row' | 'twoRows' | 'fourCorners' | 'fullBoard';
```

### `WinResult`
```typescript
interface WinResult {
  ticketIndex: number;      // 0-based ticket index
  boardIndex: number;        // 0-based board index
  type: WinType;             // Type of win
  rowIndices?: number[];     // Row indices (for row wins)
}
```

## Common Patterns

### Pattern 1: Single Player Game Setup
```typescript
// Setup
const playerTickets = generateMultipleTickets(3, 2);
const calledNumbers = new Set<number>();

// During game
const nextNumber = /* get next number */;
calledNumbers.add(nextNumber);

const win = checkPlayerWin(playerTickets, calledNumbers);
if (win) {
  // Player won!
}
```

### Pattern 2: Multi-Player Game Setup
```typescript
// Setup
const players = [
  { name: 'Player 1', tickets: generateMultipleTickets(2, 2) },
  { name: 'Player 2', tickets: generateMultipleTickets(3, 1) },
  { name: 'Player 3', tickets: generateMultipleTickets(1, 3) },
];

const calledNumbers = new Set<number>();

// During game
const nextNumber = /* get next number */;
calledNumbers.add(nextNumber);

for (const player of players) {
  const win = checkPlayerWin(player.tickets, calledNumbers);
  if (win) {
    console.log(`${player.name} won!`);
    break;
  }
}
```

### Pattern 3: Display Player Progress
```typescript
const playerTickets = generateMultipleTickets(3, 2);
const playerNumbers = getPlayerTicketNumbers(playerTickets);
const calledNumbers = new Set([1, 2, 3, ...]);

// Calculate coverage
const calledPlayerNumbers = Array.from(calledNumbers)
  .filter(num => playerNumbers.has(num));

const coverage = (calledPlayerNumbers.length / playerNumbers.size) * 100;
console.log(`Coverage: ${coverage.toFixed(1)}%`);
```

### Pattern 4: Ticket Selection UI
```typescript
function selectTickets(count: number, boardsPerTicket: 1 | 2 | 3) {
  const tickets = generateMultipleTickets(count, boardsPerTicket);

  // Display info
  const totalBoards = count * boardsPerTicket;
  const totalNumbers = totalBoards * 20;
  const uniqueNumbers = getPlayerTicketNumbers(tickets).size;

  console.log(`Selected ${count} tickets`);
  console.log(`Total boards: ${totalBoards}`);
  console.log(`Total numbers: ${totalNumbers}`);
  console.log(`Unique numbers: ${uniqueNumbers}`);

  return tickets;
}
```

## Testing

### Run All Tests
```bash
npx tsx lib/game.test.ts
```

### Run Demo
```bash
npx tsx lib/demo-multiple-tickets.ts
```

## Common Scenarios

### Scenario 1: Check if specific win type exists
```typescript
const win = checkPlayerWin(tickets, calledNumbers);
if (win?.type === 'fullBoard') {
  console.log('Full board win!');
}
```

### Scenario 2: Get winning rows
```typescript
const win = checkPlayerWin(tickets, calledNumbers);
if (win?.rowIndices) {
  console.log(`Winning rows: ${win.rowIndices.join(', ')}`);
}
```

### Scenario 3: Check specific ticket
```typescript
const tickets = generateMultipleTickets(3, 2);
const ticket2Win = checkTicketWin(tickets[1], calledNumbers);
if (ticket2Win) {
  console.log('Ticket 2 has a win!');
}
```

## Error Handling

All functions throw descriptive errors for invalid inputs:

```typescript
try {
  generateMultipleTickets(0, 2);
} catch (error) {
  console.error(error.message);
  // "Ticket count must be a positive integer"
}

try {
  generateMultipleTickets(2, 5 as any);
} catch (error) {
  console.error(error.message);
  // "Boards per ticket must be between 1 and 3"
}
```

## Performance Tips

1. **Use Sets for called numbers** - O(1) lookup time
2. **Cache player numbers** - Don't recalculate every check
3. **Early exit on win** - Stop checking once win found
4. **Reasonable ticket counts** - 1-10 tickets works well

## Best Practices

1. **Validate tickets** after generation
   ```typescript
   const tickets = generateMultipleTickets(3, 2);
   if (!validateMultipleTickets(tickets)) {
     throw new Error('Invalid tickets generated');
   }
   ```

2. **Use deterministic seeds** for testing
   ```typescript
   const tickets = generateMultipleTickets(3, 2, 12345);
   // Same seed = same tickets
   ```

3. **Store win results** for history
   ```typescript
   const winHistory: WinResult[] = [];
   const win = checkPlayerWin(tickets, calledNumbers);
   if (win) {
     winHistory.push(win);
   }
   ```

4. **Clear win priority** to users
   ```typescript
   const priorities = {
     fullBoard: 1,
     twoRows: 2,
     fourCorners: 3,
     row: 4
   };
   ```
