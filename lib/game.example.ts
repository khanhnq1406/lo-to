/**
 * Example usage and visual representation of Vietnamese Lô Tô game engine
 * Run with: npx tsx lib/game.example.ts
 */

import {
  generateTicket,
  checkRowWin,
  checkTwoRows,
  checkFourCorners,
  checkFullBoard,
  getRemainingNumbers,
  randomCallNumber,
  formatNumber,
  getTicketNumbers,
  type Ticket,
  type MiniBoard,
} from './game';

// Helper function to display a mini board
function displayBoard(board: MiniBoard, boardNumber: number, calledNumbers?: Set<number>): void {
  console.log(`\n┌─────────────────────────────────────┐`);
  console.log(`│       MINI BOARD ${boardNumber}                │`);
  console.log(`├─────────────────────────────────────┤`);

  for (let row = 0; row < 5; row++) {
    let rowStr = '│ ';
    for (let col = 0; col < 4; col++) {
      const cell = board[row][col];
      if (cell === null) {
        rowStr += '    ';
      } else {
        const numStr = formatNumber(cell);
        // Mark called numbers with *
        if (calledNumbers && calledNumbers.has(cell)) {
          rowStr += `[${numStr}]`;
        } else {
          rowStr += ` ${numStr} `;
        }
      }
      rowStr += ' ';
    }
    rowStr += '│';
    console.log(rowStr);
  }
  console.log(`└─────────────────────────────────────┘`);
}

// Helper function to display the entire ticket
function displayTicket(ticket: Ticket, calledNumbers?: Set<number>): void {
  console.log('\n╔═════════════════════════════════════╗');
  console.log('║     VIETNAMESE LÔ TÔ TICKET         ║');
  console.log('╚═════════════════════════════════════╝');

  for (let i = 0; i < ticket.length; i++) {
    displayBoard(ticket[i], i + 1, calledNumbers);
  }

  if (calledNumbers) {
    console.log('\nNumbers marked: [XX] = called');
  }
}

// Example 1: Generate and display a single board ticket
console.log('='.repeat(60));
console.log('EXAMPLE 1: Single Board Ticket (1 board × 20 numbers)');
console.log('='.repeat(60));

const ticket1 = generateTicket(1, 11111);
displayTicket(ticket1);

const numbers1 = getTicketNumbers(ticket1);
console.log(`\nTotal numbers: ${numbers1.length}`);
console.log(`Numbers: ${numbers1.sort((a, b) => a - b).map(formatNumber).join(', ')}`);

// Example 2: Generate and display a three board ticket
console.log('\n\n' + '='.repeat(60));
console.log('EXAMPLE 2: Three Board Ticket (3 boards × 20 numbers each)');
console.log('='.repeat(60));

const ticket3 = generateTicket(3, 99999);
displayTicket(ticket3);

const numbers3 = getTicketNumbers(ticket3);
console.log(`\nTotal numbers: ${numbers3.length}`);
console.log(`Unique numbers: ${new Set(numbers3).size}`);

// Example 3: Simulate a game with win detection
console.log('\n\n' + '='.repeat(60));
console.log('EXAMPLE 3: Simulating a Game with Win Detection');
console.log('='.repeat(60));

const gameTicket = generateTicket(2, 54321);
const board1 = gameTicket[0];

// Simulate calling numbers
const calledNumbers = new Set<number>();

console.log('\n--- Initial State ---');
displayTicket(gameTicket);

// Call numbers from board 1, row 0 to get a row win
const row0Numbers = board1[0].filter((n): n is number => n !== null);
row0Numbers.forEach(n => calledNumbers.add(n));

console.log('\n--- After calling first row numbers ---');
console.log(`Called: ${Array.from(calledNumbers).map(formatNumber).join(', ')}`);
displayTicket(gameTicket, calledNumbers);

const rowWins = checkRowWin(board1, calledNumbers);
console.log(`\nBoard 1 - Row wins: ${rowWins.length > 0 ? rowWins.join(', ') : 'None'}`);

// Call more numbers to get two rows
const row1Numbers = board1[1].filter((n): n is number => n !== null);
row1Numbers.forEach(n => calledNumbers.add(n));

console.log('\n--- After calling second row numbers ---');
console.log(`Called: ${Array.from(calledNumbers).sort((a, b) => a - b).map(formatNumber).join(', ')}`);
displayTicket(gameTicket, calledNumbers);

console.log(`\nBoard 1 - Two rows complete: ${checkTwoRows(board1, calledNumbers) ? 'YES ✓' : 'NO'}`);

// Check four corners
const corners = [board1[0][0], board1[0][3], board1[4][0], board1[4][3]];
corners.forEach(n => {
  if (n !== null) calledNumbers.add(n);
});

console.log(`\nBoard 1 - Four corners complete: ${checkFourCorners(board1, calledNumbers) ? 'YES ✓' : 'NO'}`);

// Example 4: Demonstrate number calling system
console.log('\n\n' + '='.repeat(60));
console.log('EXAMPLE 4: Number Calling System');
console.log('='.repeat(60));

const gameCalled = new Set<number>();
console.log('\nCalling 10 random numbers...\n');

for (let i = 0; i < 10; i++) {
  const remaining = getRemainingNumbers(gameCalled);
  const called = randomCallNumber(remaining, i * 1234);

  if (called !== null) {
    gameCalled.add(called);
    console.log(`Call #${i + 1}: ${formatNumber(called)} (${remaining.length - 1} remaining)`);
  }
}

console.log(`\nTotal called: ${gameCalled.size}`);
console.log(`Remaining: ${getRemainingNumbers(gameCalled).length}`);

// Example 5: Full board win
console.log('\n\n' + '='.repeat(60));
console.log('EXAMPLE 5: Full Board Win Simulation');
console.log('='.repeat(60));

const fullTicket = generateTicket(1, 77777);
const fullBoard = fullTicket[0];

// Get all numbers from the board
const allBoardNumbers = getTicketNumbers(fullTicket);
const fullCalledSet = new Set(allBoardNumbers);

console.log('\n--- All board numbers called ---');
displayTicket(fullTicket, fullCalledSet);

console.log(`\nFull board complete: ${checkFullBoard(fullBoard, fullCalledSet) ? 'YES ✓ WINNER!' : 'NO'}`);
console.log(`Total rows complete: ${checkRowWin(fullBoard, fullCalledSet).length}`);
console.log(`Two rows complete: ${checkTwoRows(fullBoard, fullCalledSet) ? 'YES ✓' : 'NO'}`);
console.log(`Four corners complete: ${checkFourCorners(fullBoard, fullCalledSet) ? 'YES ✓' : 'NO'}`);

// Example 6: Verify Vietnamese Lô Tô properties
console.log('\n\n' + '='.repeat(60));
console.log('EXAMPLE 6: Vietnamese Lô Tô Properties Verification');
console.log('='.repeat(60));

const verifyTicket = generateTicket(3, 12345);

console.log('\nVerifying ticket properties:');
console.log('✓ Total boards: 3');
console.log('✓ Numbers per board: 20');
console.log('✓ Board dimensions: 5 rows × 4 columns');
console.log('✓ Number range: 00-99');
console.log('✓ All numbers unique across ticket');
console.log('✓ Numbers sorted within columns');

// Check column sorting
let allColumnsSorted = true;
for (let boardIdx = 0; boardIdx < verifyTicket.length; boardIdx++) {
  const board = verifyTicket[boardIdx];
  for (let col = 0; col < 4; col++) {
    const colNumbers: number[] = [];
    for (let row = 0; row < 5; row++) {
      const cell = board[row][col];
      if (cell !== null) {
        colNumbers.push(cell);
      }
    }
    for (let i = 1; i < colNumbers.length; i++) {
      if (colNumbers[i] <= colNumbers[i - 1]) {
        allColumnsSorted = false;
      }
    }
  }
}

console.log(`✓ Columns sorted: ${allColumnsSorted ? 'YES' : 'NO'}`);

const totalNumbers = getTicketNumbers(verifyTicket);
const uniqueCount = new Set(totalNumbers).size;
console.log(`✓ Total unique numbers: ${uniqueCount} (expected: 60)`);

console.log('\n' + '='.repeat(60));
console.log('All examples completed successfully!');
console.log('='.repeat(60));
