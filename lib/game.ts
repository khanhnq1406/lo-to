/**
 * Authentic Vietnamese Lô Tô Game Engine
 * Pure deterministic functions for game logic
 * No side effects - all functions are testable
 *
 * AUTHENTIC RULES:
 * - Cards are 3 rows × 9 columns = 27 cells
 * - Each card has exactly 15 numbers (1-90) and 12 blanks
 * - Each row has exactly 5 numbers and 4 blanks
 * - Column constraints: col 0 = 1-9, col 1 = 10-19, ..., col 8 = 80-90
 * - Win condition: Complete any horizontal row (5 numbers)
 */

/**
 * Cell value in a card - either a number (1-90) or null for blank
 */
export type CellValue = number | null;

/**
 * Card structure: 9 rows × 9 columns
 * Each card contains exactly 45 numbers (1-90) and 36 blank cells
 * Each row has exactly 5 numbers and 4 blanks
 */
export type Card = CellValue[][];

/**
 * Ticket is an alias for Card (for compatibility)
 * In authentic Vietnamese Lô Tô, each card is independent
 */
export type Ticket = Card;

/**
 * Legacy type for backward compatibility
 * @deprecated Use Card instead
 */
export type MiniBoard = Card;

/**
 * Shuffles an array using Fisher-Yates algorithm with a seeded random
 * @param array - Array to shuffle
 * @param seed - Optional seed for deterministic shuffling
 * @returns New shuffled array
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array];
  let currentIndex = arr.length;

  // Simple seeded random if seed provided, otherwise use Math.random
  let random = seed !== undefined
    ? (() => {
        let s = seed;
        return () => {
          s = (s * 9301 + 49297) % 233280;
          return s / 233280;
        };
      })()
    : Math.random;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}

/**
 * Generates a Vietnamese Lô Tô card with 9×9 format
 *
 * Format:
 * - 9 rows × 9 columns = 81 cells
 * - Exactly 45 numbers (1-90) + 36 blanks
 * - Each row: exactly 5 numbers + 4 blanks
 * - Column ranges: col 0 = 1-9, col 1 = 10-19, ..., col 8 = 80-90
 * - Numbers sorted ascending within each column
 *
 * @param seed - Optional seed for deterministic generation (for testing)
 * @returns Generated card following 9×9 format
 */
export function generateCard(seed?: number): Card {
  // Define column ranges (Vietnamese Lô Tô)
  const columnRanges: [number, number][] = [
    [1, 9],    // Column 0: 1-9
    [10, 19],  // Column 1: 10-19
    [20, 29],  // Column 2: 20-29
    [30, 39],  // Column 3: 30-39
    [40, 49],  // Column 4: 40-49
    [50, 59],  // Column 5: 50-59
    [60, 69],  // Column 6: 60-69
    [70, 79],  // Column 7: 70-79
    [80, 90],  // Column 8: 80-90
  ];

  // Initialize 9×9 grid with all nulls
  const card: Card = Array.from({ length: 9 }, () => Array(9).fill(null));

  // Generate all available numbers for each column
  const columnNumbers: number[][] = columnRanges.map(([min, max]) => {
    const nums: number[] = [];
    for (let i = min; i <= max; i++) {
      nums.push(i);
    }
    return nums;
  });

  // Shuffle numbers in each column
  for (let col = 0; col < 9; col++) {
    columnNumbers[col] = shuffleArray(columnNumbers[col], seed ? seed + col : undefined);
  }

  // Step 1: Determine which columns will have numbers in each row
  // Each row needs exactly 5 numbers out of 9 columns
  // Total numbers needed: 45 (5 per row × 9 rows)

  // We need to ensure:
  // - Each column has exactly 5 numbers total (45 numbers / 9 columns = 5 per column)
  // - Each row has exactly 5 numbers
  // - Total is 45 numbers

  // Strategy: Build a valid 9×9 assignment grid systematically
  // We need exactly 5 numbers per row and exactly 5 numbers per column
  const rowColumnAssignments: boolean[][] = Array.from({ length: 9 }, () => Array(9).fill(false));

  // Track column usage count
  const columnUsageCount: number[] = Array(9).fill(0);

  // For each row, select 5 columns that haven't been used 5 times yet
  for (let row = 0; row < 9; row++) {
    // Get all columns and their current usage count
    const columnsByUsage: { col: number; count: number }[] = [];
    for (let col = 0; col < 9; col++) {
      columnsByUsage.push({ col, count: columnUsageCount[col] });
    }

    // Sort by usage count (prefer less-used columns) then shuffle within same count
    columnsByUsage.sort((a, b) => {
      if (a.count !== b.count) {
        return a.count - b.count; // Prefer less-used columns
      }
      // For same count, use seed-based ordering for determinism
      const aHash = ((seed || 0) + row * 100 + a.col) % 1000;
      const bHash = ((seed || 0) + row * 100 + b.col) % 1000;
      return aHash - bHash;
    });

    // Take first 5 columns (these are the least-used ones)
    const selectedCols = columnsByUsage.slice(0, 5).map(item => item.col);

    // Shuffle the selected columns for this row for variety
    const shuffledSelected = shuffleArray(selectedCols, seed ? seed + row * 500 : undefined);

    // Mark these columns for this row
    for (const col of shuffledSelected) {
      rowColumnAssignments[row][col] = true;
      columnUsageCount[col]++;
    }
  }

  // Step 2: Assign numbers to selected cells
  const columnNumberIndex: number[] = Array(9).fill(0);

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (rowColumnAssignments[row][col]) {
        // Assign next available number from this column
        if (columnNumberIndex[col] < columnNumbers[col].length) {
          card[row][col] = columnNumbers[col][columnNumberIndex[col]];
          columnNumberIndex[col]++;
        }
      }
    }
  }

  // Step 3: Sort numbers within each column (ascending top to bottom)
  for (let col = 0; col < 9; col++) {
    const columnValues: { value: number; row: number }[] = [];

    for (let row = 0; row < 9; row++) {
      if (card[row][col] !== null) {
        columnValues.push({ value: card[row][col]!, row });
      }
    }

    // Sort by value
    columnValues.sort((a, b) => a.value - b.value);

    // Clear column
    for (let row = 0; row < 9; row++) {
      card[row][col] = null;
    }

    // Reassign sorted values to original row positions (but sorted)
    const rowsWithNumbers = columnValues.map(v => v.row).sort((a, b) => a - b);
    for (let i = 0; i < columnValues.length; i++) {
      card[rowsWithNumbers[i]][col] = columnValues[i].value;
    }
  }

  return card;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateCard() instead
 */
export function generateTicket(boardCount: 1 | 2 | 3, seed?: number): Ticket[] {
  // For backward compatibility, return array of cards
  // In authentic Lô Tô, boardCount doesn't apply - each card is separate
  const cards: Ticket[] = [];
  for (let i = 0; i < boardCount; i++) {
    cards.push(generateCard(seed ? seed + i * 1000 : undefined));
  }
  return cards;
}

/**
 * Checks if a row in a card is completely filled with called numbers
 * A row wins when all 5 numbers (non-null cells) are in the called numbers list
 *
 * @param card - Card to check
 * @param calledNumbers - Set of numbers that have been called
 * @returns Array of winning row indices (0-8), empty if no wins
 */
export function checkRowWin(card: Card, calledNumbers: Set<number>): number[] {
  if (!card || card.length !== 9) {
    return [];
  }

  const winningRows: number[] = [];

  for (let row = 0; row < 9; row++) {
    const rowCells = card[row];
    if (!rowCells || rowCells.length !== 9) {
      continue;
    }

    // Get all non-null numbers in this row
    const rowNumbers = rowCells.filter((cell): cell is number => cell !== null);

    // Check if all numbers in this row have been called
    // Each row should have exactly 5 numbers
    if (rowNumbers.length === 5 && rowNumbers.every(num => calledNumbers.has(num))) {
      winningRows.push(row);
    }
  }

  return winningRows;
}

/**
 * @deprecated Two rows win is not part of authentic Vietnamese Lô Tô
 * Kept for backward compatibility
 */
export function checkTwoRows(card: Card, calledNumbers: Set<number>): boolean {
  const winningRows = checkRowWin(card, calledNumbers);
  return winningRows.length >= 2;
}

/**
 * @deprecated Four corners win is not part of authentic Vietnamese Lô Tô
 * Kept for backward compatibility
 */
export function checkFourCorners(card: Card, calledNumbers: Set<number>): boolean {
  if (!card || card.length !== 9) {
    return false;
  }

  // Get corner cells (top-left, top-right, bottom-left, bottom-right)
  const topLeft = card[0]?.[0];
  const topRight = card[0]?.[8];
  const bottomLeft = card[8]?.[0];
  const bottomRight = card[8]?.[8];

  const corners = [topLeft, topRight, bottomLeft, bottomRight];

  // Get all non-null corner numbers
  const cornerNumbers = corners.filter((cell): cell is number => cell !== null);

  // If no corners have numbers, return false
  if (cornerNumbers.length === 0) {
    return false;
  }

  // Check if all corner numbers have been called
  return cornerNumbers.every(num => calledNumbers.has(num));
}

/**
 * @deprecated Full board win is not part of authentic Vietnamese Lô Tô
 * Kept for backward compatibility
 */
export function checkFullBoard(card: Card, calledNumbers: Set<number>): boolean {
  if (!card || card.length !== 9) {
    return false;
  }

  // Get all non-null numbers from the card
  const cardNumbers: number[] = [];

  for (const row of card) {
    if (!row || row.length !== 9) {
      return false;
    }
    for (const cell of row) {
      if (cell !== null) {
        cardNumbers.push(cell);
      }
    }
  }

  // Check if card has exactly 45 numbers
  if (cardNumbers.length !== 45) {
    return false;
  }

  // Check if all card numbers have been called
  return cardNumbers.every(num => calledNumbers.has(num));
}

/**
 * Gets the list of numbers that haven't been called yet
 * Authentic Vietnamese Lô Tô uses numbers 1-90
 *
 * @param calledNumbers - Set of numbers that have been called
 * @returns Array of remaining uncalled numbers (1-90)
 */
export function getRemainingNumbers(calledNumbers: Set<number>): number[] {
  const remaining: number[] = [];

  for (let i = 1; i <= 90; i++) {
    if (!calledNumbers.has(i)) {
      remaining.push(i);
    }
  }

  return remaining;
}

/**
 * Randomly selects a number from the remaining uncalled numbers
 * This is the only non-deterministic function (unless seed provided)
 *
 * @param remainingNumbers - Array of numbers that haven't been called
 * @param seed - Optional seed for deterministic selection (for testing)
 * @returns Random number from remaining, or null if no numbers left
 */
export function randomCallNumber(remainingNumbers: number[], seed?: number): number | null {
  if (!remainingNumbers || remainingNumbers.length === 0) {
    return null;
  }

  if (seed !== undefined) {
    // Deterministic random for testing
    const random = (seed * 9301 + 49297) % 233280;
    const index = Math.floor((random / 233280) * remainingNumbers.length);
    return remainingNumbers[index];
  }

  // True random selection
  const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
  return remainingNumbers[randomIndex];
}

/**
 * Validates if a card structure is valid
 *
 * @param card - Card to validate
 * @returns True if card is valid
 */
export function validateCard(card: Card): boolean {
  // Check structure: 9 rows × 9 columns
  if (!card || card.length !== 9) {
    return false;
  }

  const allNumbers = new Set<number>();
  let totalNumberCount = 0;

  for (let row = 0; row < 9; row++) {
    const rowCells = card[row];

    if (!rowCells || rowCells.length !== 9) {
      return false;
    }

    let rowNumberCount = 0;

    for (const cell of rowCells) {
      if (cell !== null) {
        // Check if number is in valid range (1-90)
        if (cell < 1 || cell > 90 || !Number.isInteger(cell)) {
          return false;
        }

        // Check for duplicates
        if (allNumbers.has(cell)) {
          return false;
        }

        allNumbers.add(cell);
        rowNumberCount++;
        totalNumberCount++;
      }
    }

    // Each row must have exactly 5 numbers
    if (rowNumberCount !== 5) {
      return false;
    }
  }

  // Card must have exactly 45 numbers total
  if (totalNumberCount !== 45) {
    return false;
  }

  // Validate column constraints
  for (let col = 0; col < 9; col++) {
    const minRange = col === 0 ? 1 : col * 10;
    const maxRange = col === 0 ? 9 : col * 10 + 9;

    // Special case for column 8: 80-90 (not 80-89)
    const actualMaxRange = col === 8 ? 90 : maxRange;

    for (let row = 0; row < 9; row++) {
      const cell = card[row][col];
      if (cell !== null) {
        if (cell < minRange || cell > actualMaxRange) {
          return false;
        }
      }
    }

    // Check if numbers in column are sorted ascending
    const columnNumbers: number[] = [];
    for (let row = 0; row < 9; row++) {
      const cell = card[row][col];
      if (cell !== null) {
        columnNumbers.push(cell);
      }
    }

    for (let i = 1; i < columnNumbers.length; i++) {
      if (columnNumbers[i] <= columnNumbers[i - 1]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateCard() instead
 */
export function validateTicket(ticket: Ticket[] | Ticket): boolean {
  // Handle both single card and array of cards
  if (Array.isArray(ticket) && ticket.length > 0 && Array.isArray(ticket[0])) {
    // Check if it's an array of cards (new format) or a single card (3x9 array)
    if (ticket[0].length === 9) {
      // It's a single card (3×9)
      return validateCard(ticket as Card);
    } else {
      // It's an array of cards
      return (ticket as Card[]).every(card => validateCard(card));
    }
  }
  return false;
}

/**
 * Formats a number for display
 * Vietnamese Lô Tô displays numbers 1-90
 *
 * @param num - Number to format (1-90)
 * @returns Formatted string (e.g., "5", "42", "90")
 */
export function formatNumber(num: number): string {
  if (num < 1 || num > 90) {
    throw new Error('Number must be between 1 and 90');
  }
  return num.toString();
}

/**
 * Gets all numbers from a card
 *
 * @param card - Card to extract numbers from
 * @returns Array of all numbers in the card
 */
export function getCardNumbers(card: Card): number[] {
  const numbers: number[] = [];

  for (const row of card) {
    for (const cell of row) {
      if (cell !== null) {
        numbers.push(cell);
      }
    }
  }

  return numbers;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getCardNumbers() instead
 */
export function getTicketNumbers(ticket: Ticket[] | Ticket): number[] {
  // Handle both single card and array of cards
  if (Array.isArray(ticket) && ticket.length > 0 && Array.isArray(ticket[0])) {
    if (ticket[0].length === 9) {
      // It's a single card
      return getCardNumbers(ticket as Card);
    } else {
      // It's an array of cards
      const allNumbers: number[] = [];
      for (const card of ticket as Card[]) {
        allNumbers.push(...getCardNumbers(card));
      }
      return allNumbers;
    }
  }
  return [];
}

/**
 * Checks if a specific number exists in a card
 *
 * @param card - Card to search
 * @param number - Number to find
 * @returns True if number exists in card
 */
export function hasNumber(card: Card | Ticket[] | Ticket, number: number): boolean {
  // Handle both single card and array of cards for backward compatibility
  if (Array.isArray(card) && card.length > 0 && Array.isArray(card[0])) {
    if (card[0].length === 9) {
      // It's a single card
      const singleCard = card as Card;
      for (const row of singleCard) {
        for (const cell of row) {
          if (cell === number) {
            return true;
          }
        }
      }
    } else {
      // It's an array of cards
      for (const c of card as Card[]) {
        if (hasNumber(c, number)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Gets the position of a number in a card
 *
 * @param card - Card to search
 * @param number - Number to find
 * @returns Object with rowIndex and colIndex, or null if not found
 */
export function findNumberPosition(
  card: Card | Ticket[] | Ticket,
  number: number
): { boardIndex: number; rowIndex: number; colIndex: number } | null {
  // Handle both single card and array of cards for backward compatibility
  if (Array.isArray(card) && card.length > 0 && Array.isArray(card[0])) {
    if (card[0].length === 9) {
      // It's a single card
      const singleCard = card as Card;
      for (let rowIndex = 0; rowIndex < singleCard.length; rowIndex++) {
        const row = singleCard[rowIndex];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          if (row[colIndex] === number) {
            return { boardIndex: 0, rowIndex, colIndex };
          }
        }
      }
    } else {
      // It's an array of cards
      for (let boardIndex = 0; boardIndex < (card as Card[]).length; boardIndex++) {
        const c = (card as Card[])[boardIndex];
        for (let rowIndex = 0; rowIndex < c.length; rowIndex++) {
          const row = c[rowIndex];
          for (let colIndex = 0; colIndex < row.length; colIndex++) {
            if (row[colIndex] === number) {
              return { boardIndex, rowIndex, colIndex };
            }
          }
        }
      }
    }
  }
  return null;
}

/**
 * Win type for a player's card
 * Authentic Vietnamese Lô Tô only has 'row' win
 * Other types kept for backward compatibility
 */
export type WinType = 'row' | 'twoRows' | 'fourCorners' | 'fullBoard';

/**
 * Win result containing which card, board, and win type
 */
export interface WinResult {
  ticketIndex: number;
  boardIndex: number;
  type: WinType;
  rowIndices?: number[]; // For row and twoRows wins
}

/**
 * Generates multiple independent cards for a player
 * Each card has unique numbers within itself
 * Numbers CAN repeat across different cards (they're separate cards)
 *
 * @param cardCount - Number of cards to generate (must be >= 1)
 * @param seed - Optional seed for deterministic generation (for testing)
 * @returns Array of independent cards
 * @throws Error if parameters are invalid
 */
export function generateMultipleCards(
  cardCount: number,
  seed?: number
): Card[] {
  if (!Number.isInteger(cardCount) || cardCount < 1) {
    throw new Error('Card count must be a positive integer');
  }

  const cards: Card[] = [];

  // Generate each card independently
  // Use different seeds for each card if seed provided
  for (let i = 0; i < cardCount; i++) {
    const cardSeed = seed !== undefined ? seed + i * 1000 : undefined;
    const card = generateCard(cardSeed);
    cards.push(card);
  }

  return cards;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateMultipleCards() instead
 */
export function generateMultipleTickets(
  ticketCount: number,
  boardsPerTicket: 1 | 2 | 3,
  seed?: number
): Ticket[][] {
  // For backward compatibility, return array of ticket arrays
  // Each "ticket" is an array of cards (boards)
  const tickets: Ticket[][] = [];

  for (let i = 0; i < ticketCount; i++) {
    const ticketCards: Card[] = [];
    for (let j = 0; j < boardsPerTicket; j++) {
      const cardSeed = seed !== undefined ? seed + i * 1000 + j * 100 : undefined;
      ticketCards.push(generateCard(cardSeed));
    }
    tickets.push(ticketCards);
  }

  return tickets;
}

/**
 * Gets all unique numbers across all of a player's cards
 *
 * @param cards - Array of player's cards
 * @returns Set of all unique numbers across all cards
 */
export function getPlayerCardNumbers(cards: Card[]): Set<number> {
  const allNumbers = new Set<number>();

  for (const card of cards) {
    const cardNumbers = getCardNumbers(card);
    cardNumbers.forEach(num => allNumbers.add(num));
  }

  return allNumbers;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getPlayerCardNumbers() instead
 */
export function getPlayerTicketNumbers(tickets: Ticket[][]): Set<number> {
  const allNumbers = new Set<number>();

  for (const ticket of tickets) {
    for (const card of ticket) {
      const cardNumbers = getCardNumbers(card);
      cardNumbers.forEach(num => allNumbers.add(num));
    }
  }

  return allNumbers;
}

/**
 * Checks if a player won on any of their cards (authentic Vietnamese Lô Tô)
 * Only checks for row wins (first to complete any row wins)
 *
 * @param cards - Array of player's cards
 * @param calledNumbers - Set of numbers that have been called
 * @returns WinResult if any win found, null otherwise
 */
export function checkPlayerWin(cards: Card[] | Ticket[][], calledNumbers: Set<number>): WinResult | null {
  if (!cards || cards.length === 0) {
    return null;
  }

  // Handle backward compatibility: check if it's old format (array of tickets)
  // Old format: cards[0] is a ticket (array of cards), so cards[0][0] is a card (3×9), and cards[0][0][0] is a row (length 9)
  // New format: cards[0] is a card (3×9), so cards[0][0] is a row (length 9), and cards[0][0][0] is a cell (number or null)
  const isOldFormat = Array.isArray(cards[0]) &&
                      cards[0].length > 0 &&
                      Array.isArray(cards[0][0]) &&
                      cards[0][0].length > 0 &&
                      Array.isArray(cards[0][0][0]); // In old format, [0][0][0] is a row array

  if (isOldFormat) {
    // Old format: array of tickets (each ticket is array of cards)
    const tickets = cards as Ticket[][];

    // Check for row win (authentic rule)
    for (let ticketIndex = 0; ticketIndex < tickets.length; ticketIndex++) {
      const ticket = tickets[ticketIndex];
      for (let boardIndex = 0; boardIndex < ticket.length; boardIndex++) {
        const card = ticket[boardIndex];
        const rowIndices = checkRowWin(card, calledNumbers);
        if (rowIndices.length > 0) {
          return {
            ticketIndex,
            boardIndex,
            type: 'row',
            rowIndices
          };
        }
      }
    }
  } else {
    // New format: array of cards
    const playerCards = cards as Card[];

    // Check for row win (authentic rule)
    for (let cardIndex = 0; cardIndex < playerCards.length; cardIndex++) {
      const card = playerCards[cardIndex];
      const rowIndices = checkRowWin(card, calledNumbers);
      if (rowIndices.length > 0) {
        return {
          ticketIndex: cardIndex,
          boardIndex: 0,
          type: 'row',
          rowIndices
        };
      }
    }
  }

  return null;
}

/**
 * Checks all win conditions for a single card
 * Returns the highest priority win found
 *
 * @param card - Card to check
 * @param calledNumbers - Set of numbers that have been called
 * @returns WinResult if any win found (with ticketIndex always 0), null otherwise
 */
export function checkTicketWin(card: Card | Ticket[], calledNumbers: Set<number>): WinResult | null {
  // Handle backward compatibility
  if (Array.isArray(card) && card.length > 0 && Array.isArray(card[0])) {
    if (card[0].length === 9) {
      // It's a single card
      const result = checkPlayerWin([card as Card], calledNumbers);
      if (result) {
        return { ...result, ticketIndex: 0 };
      }
    } else {
      // It's a ticket (array of cards)
      const result = checkPlayerWin([[card as unknown as Card]], calledNumbers);
      if (result) {
        return { ...result, ticketIndex: 0 };
      }
    }
  }
  return null;
}

/**
 * Validates multiple cards
 * Each card must be valid independently
 *
 * @param cards - Array of cards to validate
 * @returns True if all cards are valid
 */
export function validateMultipleCards(cards: Card[]): boolean {
  if (!cards || cards.length === 0) {
    return false;
  }

  // Validate each card independently
  for (const card of cards) {
    if (!validateCard(card)) {
      return false;
    }
  }

  return true;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateMultipleCards() instead
 */
export function validateMultipleTickets(tickets: Ticket[][]): boolean {
  if (!tickets || tickets.length === 0) {
    return false;
  }

  // Validate each ticket independently
  for (const ticket of tickets) {
    for (const card of ticket) {
      if (!validateCard(card)) {
        return false;
      }
    }
  }

  return true;
}
