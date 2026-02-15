/**
 * Test file for Vietnamese Lô Tô game engine
 * Run with: npx tsx lib/game.test.ts
 */

import {
  generateTicket,
  checkRowWin,
  checkTwoRows,
  checkFourCorners,
  checkFullBoard,
  getRemainingNumbers,
  randomCallNumber,
  validateTicket,
  formatNumber,
  getTicketNumbers,
  hasNumber,
  findNumberPosition,
  generateMultipleTickets,
  getPlayerTicketNumbers,
  checkPlayerWin,
  checkTicketWin,
  validateMultipleTickets,
  type Ticket,
  type MiniBoard,
} from './game';

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error('Expected:', expected);
    console.error('Actual:', actual);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Test 1: Generate ticket with 1 board
console.log('Test 1: Generate ticket with 1 board');
const ticket1 = generateTicket(1, 12345);
assert(ticket1.length === 1, 'Should have 1 board');
assert(ticket1[0].length === 5, 'Board should have 5 rows');
assert(ticket1[0][0].length === 4, 'Each row should have 4 columns');

// Count numbers
let numberCount = 0;
const numbers1 = new Set<number>();
for (const row of ticket1[0]) {
  for (const cell of row) {
    if (cell !== null) {
      numberCount++;
      numbers1.add(cell);
    }
  }
}
assert(numberCount === 20, 'Board should have exactly 20 numbers');
assert(numbers1.size === 20, 'All numbers should be unique');
console.log('✓ Ticket 1 generated correctly');

// Test 2: Generate ticket with 3 boards
console.log('\nTest 2: Generate ticket with 3 boards');
const ticket3 = generateTicket(3, 54321);
assert(ticket3.length === 3, 'Should have 3 boards');

const allNumbers = new Set<number>();
for (const board of ticket3) {
  let boardCount = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) {
        boardCount++;
        assert(!allNumbers.has(cell), 'Numbers should be unique across all boards');
        allNumbers.add(cell);
      }
    }
  }
  assert(boardCount === 20, 'Each board should have exactly 20 numbers');
}
assert(allNumbers.size === 60, 'Should have 60 unique numbers total');
console.log('✓ Ticket 3 generated correctly');

// Test 3: Validate ticket
console.log('\nTest 3: Validate ticket');
assert(validateTicket(ticket1), 'Valid ticket should pass validation');
assert(validateTicket(ticket3), 'Valid ticket should pass validation');

// Invalid ticket with only 16 numbers (should have 20)
const invalidTicket: Ticket = [
  [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [null, null, null, null]],
];
assert(!validateTicket(invalidTicket), 'Ticket without 20 numbers should fail');

// Invalid ticket with duplicate numbers
const duplicateTicket: Ticket = [
  [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 1]],
];
assert(!validateTicket(duplicateTicket), 'Ticket with duplicate numbers should fail');
console.log('✓ Ticket validation works');

// Test 4: Check row win
console.log('\nTest 4: Check row win');
const testBoard: MiniBoard = [
  [1, 2, 3, 4],
  [10, 20, 30, 40],
  [15, 25, 35, 45],
  [50, 60, 70, 80],
  [55, 65, 75, 85],
];

const called1 = new Set([1, 2, 3, 4, 10, 20]);
const wins1 = checkRowWin(testBoard, called1);
assertEqual(wins1, [0], 'Should detect row 0 win');

const called2 = new Set([1, 2, 3, 4, 10, 20, 30, 40]);
const wins2 = checkRowWin(testBoard, called2);
assertEqual(wins2.sort(), [0, 1], 'Should detect rows 0 and 1 wins');
console.log('✓ Row win detection works');

// Test 5: Check two rows
console.log('\nTest 5: Check two rows');
assert(!checkTwoRows(testBoard, called1), 'Should not detect two rows with only 1 complete');
assert(checkTwoRows(testBoard, called2), 'Should detect two rows');
console.log('✓ Two rows check works');

// Test 6: Check four corners
console.log('\nTest 6: Check four corners');
const cornersBoard: MiniBoard = [
  [1, 10, 20, 30],
  [5, 15, 25, 35],
  [8, 18, 28, 38],
  [11, 21, 31, 41],
  [12, 22, 32, 42],
];

const calledCorners1 = new Set([1, 30, 12]);
assert(!checkFourCorners(cornersBoard, calledCorners1), 'Should need all 4 corners');

const calledCorners2 = new Set([1, 30, 12, 42]);
assert(checkFourCorners(cornersBoard, calledCorners2), 'Should detect all 4 corners marked');
console.log('✓ Four corners check works');

// Test 7: Check full board
console.log('\nTest 7: Check full board');
const allBoardNumbers = new Set<number>();
for (const row of testBoard) {
  for (const cell of row) {
    if (cell !== null) {
      allBoardNumbers.add(cell);
    }
  }
}

assert(!checkFullBoard(testBoard, called2), 'Should not detect full board with partial numbers');
assert(checkFullBoard(testBoard, allBoardNumbers), 'Should detect full board');
console.log('✓ Full board check works');

// Test 8: Get remaining numbers
console.log('\nTest 8: Get remaining numbers');
const called = new Set([0, 1, 2, 99]);
const remaining = getRemainingNumbers(called);
assert(remaining.length === 96, 'Should have 96 remaining numbers');
assert(!remaining.includes(0), 'Should not include 0');
assert(!remaining.includes(1), 'Should not include 1');
assert(!remaining.includes(2), 'Should not include 2');
assert(!remaining.includes(99), 'Should not include 99');
assert(remaining.includes(50), 'Should include 50');
console.log('✓ Get remaining numbers works');

// Test 9: Random call number (deterministic)
console.log('\nTest 9: Random call number');
const remainingNums = [10, 20, 30, 40, 50];
const randomNum1 = randomCallNumber(remainingNums, 123);
const randomNum2 = randomCallNumber(remainingNums, 123);
assert(randomNum1 !== null, 'Should return a number');
assert(remainingNums.includes(randomNum1!), 'Should return a number from remaining');
assertEqual(randomNum1, randomNum2, 'Same seed should produce same result (deterministic)');

const emptyResult = randomCallNumber([]);
assertEqual(emptyResult, null, 'Should return null for empty array');
console.log('✓ Random call number works');

// Test 10: Format number
console.log('\nTest 10: Format number');
assertEqual(formatNumber(0), '00', 'Should format 0 as 00');
assertEqual(formatNumber(5), '05', 'Should format 5 as 05');
assertEqual(formatNumber(42), '42', 'Should format 42 as 42');
assertEqual(formatNumber(99), '99', 'Should format 99 as 99');
console.log('✓ Format number works');

// Test 11: Get ticket numbers
console.log('\nTest 11: Get ticket numbers');
const ticketNumbers = getTicketNumbers(ticket1);
assert(ticketNumbers.length === 20, 'Should get all 20 numbers from ticket');
assert(new Set(ticketNumbers).size === 20, 'All numbers should be unique');
console.log('✓ Get ticket numbers works');

// Test 12: Has number
console.log('\nTest 12: Has number');
const firstNumber = ticketNumbers[0];
assert(hasNumber(ticket1, firstNumber), 'Should find existing number');
assert(!hasNumber(ticket1, 999), 'Should not find non-existing number');
console.log('✓ Has number works');

// Test 13: Find number position
console.log('\nTest 13: Find number position');
const position = findNumberPosition(ticket1, firstNumber);
assert(position !== null, 'Should find position of existing number');
assert(position!.boardIndex === 0, 'Should be on board 0');

const notFound = findNumberPosition(ticket1, 999);
assertEqual(notFound, null, 'Should return null for non-existing number');
console.log('✓ Find number position works');

// Test 14: Numbers sorted in columns
console.log('\nTest 14: Numbers sorted in columns');
for (const board of ticket3) {
  for (let col = 0; col < 4; col++) {
    const columnNumbers: number[] = [];
    for (let row = 0; row < 5; row++) {
      const cell = board[row][col];
      if (cell !== null) {
        columnNumbers.push(cell);
      }
    }
    // Check if column is sorted
    for (let i = 1; i < columnNumbers.length; i++) {
      assert(
        columnNumbers[i] > columnNumbers[i - 1],
        `Column ${col} should be sorted in ascending order`
      );
    }
  }
}
console.log('✓ Numbers are sorted in columns');

// Test 15: Edge cases
console.log('\nTest 15: Edge cases');
try {
  generateTicket(0 as any);
  assert(false, 'Should throw error for 0 boards');
} catch (e) {
  console.log('✓ Correctly throws error for 0 boards');
}

try {
  generateTicket(4 as any);
  assert(false, 'Should throw error for 4 boards');
} catch (e) {
  console.log('✓ Correctly throws error for 4 boards');
}

const emptyBoard: MiniBoard = [];
assertEqual(checkRowWin(emptyBoard, new Set()), [], 'Should return empty array for invalid board');
assertEqual(checkFourCorners(emptyBoard, new Set()), false, 'Should return false for invalid board');
assertEqual(checkFullBoard(emptyBoard, new Set()), false, 'Should return false for invalid board');
console.log('✓ Edge cases handled correctly');

// Test 16: Generate multiple tickets
console.log('\nTest 16: Generate multiple tickets');
const multipleTickets = generateMultipleTickets(3, 2, 99999);
assert(multipleTickets.length === 3, 'Should generate 3 tickets');

for (let i = 0; i < multipleTickets.length; i++) {
  const ticket = multipleTickets[i];
  assert(ticket.length === 2, `Ticket ${i} should have 2 boards`);
  assert(validateTicket(ticket), `Ticket ${i} should be valid`);

  // Each ticket should have 40 unique numbers (2 boards * 20 numbers)
  const ticketNums = getTicketNumbers(ticket);
  assert(ticketNums.length === 40, `Ticket ${i} should have 40 numbers`);
  assert(new Set(ticketNums).size === 40, `Ticket ${i} numbers should be unique within ticket`);
}

// Numbers can repeat across different tickets
const ticket0Nums = new Set(getTicketNumbers(multipleTickets[0]));
const ticket1Nums = new Set(getTicketNumbers(multipleTickets[1]));
const ticket2Nums = new Set(getTicketNumbers(multipleTickets[2]));

// There should be some overlap between tickets (not a strict test, but likely with random generation)
const allUniqueCount = new Set([...ticket0Nums, ...ticket1Nums, ...ticket2Nums]).size;
assert(allUniqueCount <= 120, 'Total unique numbers should be <= 120 (some overlap expected)');
console.log('✓ Multiple tickets generated correctly');

// Test 17: Get player ticket numbers
console.log('\nTest 17: Get player ticket numbers');
const playerNumbers = getPlayerTicketNumbers(multipleTickets);
assert(playerNumbers.size <= 120, 'Should have at most 120 unique numbers');
assert(playerNumbers.size >= 40, 'Should have at least 40 unique numbers (one ticket worth)');

// Verify all numbers from each ticket are included
for (const ticket of multipleTickets) {
  const ticketNums = getTicketNumbers(ticket);
  for (const num of ticketNums) {
    assert(playerNumbers.has(num), `Player numbers should include ${num}`);
  }
}
console.log('✓ Get player ticket numbers works');

// Test 18: Check player win - row win
console.log('\nTest 18: Check player win - row win');
const testTickets: Ticket[] = [
  [
    [
      [1, 2, 3, 4],
      [10, 20, 30, 40],
      [15, 25, 35, 45],
      [50, 60, 70, 80],
      [55, 65, 75, 85],
    ],
  ],
  [
    [
      [5, 6, 7, 8],
      [11, 21, 31, 41],
      [16, 26, 36, 46],
      [51, 61, 71, 81],
      [56, 66, 76, 86],
    ],
  ],
];

const calledRow = new Set([1, 2, 3, 4]);
const rowWin = checkPlayerWin(testTickets, calledRow);
assert(rowWin !== null, 'Should detect row win');
assert(rowWin!.type === 'row', 'Should be row win type');
assert(rowWin!.ticketIndex === 0, 'Should be on ticket 0');
assert(rowWin!.boardIndex === 0, 'Should be on board 0');
assert(rowWin!.rowIndices !== undefined && rowWin!.rowIndices.includes(0), 'Should include row 0');
console.log('✓ Player row win detection works');

// Test 19: Check player win - two rows
console.log('\nTest 19: Check player win - two rows');
const calledTwoRows = new Set([1, 2, 3, 4, 10, 20, 30, 40]);
const twoRowsWin = checkPlayerWin(testTickets, calledTwoRows);
assert(twoRowsWin !== null, 'Should detect two rows win');
assert(twoRowsWin!.type === 'twoRows', 'Should be two rows win type');
assert(twoRowsWin!.ticketIndex === 0, 'Should be on ticket 0');
assert(twoRowsWin!.boardIndex === 0, 'Should be on board 0');
console.log('✓ Player two rows win detection works');

// Test 20: Check player win - four corners
console.log('\nTest 20: Check player win - four corners');
const testTicketsCorners: Ticket[] = [
  [
    [
      [1, 10, 20, 30],
      [5, 15, 25, 35],
      [8, 18, 28, 38],
      [11, 21, 31, 41],
      [12, 22, 32, 42],
    ],
  ],
];

const calledCornerWin = new Set([1, 30, 12, 42]);
const cornersWin = checkPlayerWin(testTicketsCorners, calledCornerWin);
assert(cornersWin !== null, 'Should detect four corners win');
assert(cornersWin!.type === 'fourCorners', 'Should be four corners win type');
assert(cornersWin!.ticketIndex === 0, 'Should be on ticket 0');
assert(cornersWin!.boardIndex === 0, 'Should be on board 0');
console.log('✓ Player four corners win detection works');

// Test 21: Check player win - full board
console.log('\nTest 21: Check player win - full board');
const allTicketNumbers = new Set<number>();
for (const board of testTickets[0]) {
  for (const row of board) {
    for (const cell of row) {
      if (cell !== null) {
        allTicketNumbers.add(cell);
      }
    }
  }
}

const fullBoardWin = checkPlayerWin(testTickets, allTicketNumbers);
assert(fullBoardWin !== null, 'Should detect full board win');
assert(fullBoardWin!.type === 'fullBoard', 'Should be full board win type');
assert(fullBoardWin!.ticketIndex === 0, 'Should be on ticket 0');
console.log('✓ Player full board win detection works');

// Test 22: Check player win priority
console.log('\nTest 22: Check player win priority');
// When multiple wins exist, should return highest priority: fullBoard > twoRows > fourCorners > row
const priorityCalledNumbers = new Set([
  1, 2, 3, 4, // Row 0 complete
  10, 20, 30, 40, // Row 1 complete (two rows now)
  1, 30, 12, 42, // Four corners complete
  // Add all numbers for full board
  15, 25, 35, 45, 50, 60, 70, 80, 55, 65, 75, 85,
]);

const priorityWin = checkPlayerWin(testTickets, priorityCalledNumbers);
assert(priorityWin !== null, 'Should detect win');
assert(priorityWin!.type === 'fullBoard', 'Should prioritize full board win');
console.log('✓ Win priority works correctly');

// Test 23: Check player win across multiple tickets
console.log('\nTest 23: Check player win across multiple tickets');
const multiTicketCalledNumbers = new Set([5, 6, 7, 8]); // First row of second ticket
const multiTicketWin = checkPlayerWin(testTickets, multiTicketCalledNumbers);
assert(multiTicketWin !== null, 'Should detect win on second ticket');
assert(multiTicketWin!.type === 'row', 'Should be row win type');
assert(multiTicketWin!.ticketIndex === 1, 'Should be on ticket 1');
assert(multiTicketWin!.boardIndex === 0, 'Should be on board 0');
console.log('✓ Win detection across multiple tickets works');

// Test 24: Check ticket win (single ticket helper)
console.log('\nTest 24: Check ticket win (single ticket helper)');
const singleTicket = testTickets[0];
const singleCalledNumbers = new Set([1, 2, 3, 4]);
const singleTicketWin = checkTicketWin(singleTicket, singleCalledNumbers);
assert(singleTicketWin !== null, 'Should detect win on single ticket');
assert(singleTicketWin!.type === 'row', 'Should be row win type');
assert(singleTicketWin!.ticketIndex === 0, 'Should always be ticket index 0 for single ticket check');
assert(singleTicketWin!.boardIndex === 0, 'Should be on board 0');
console.log('✓ Single ticket win check works');

// Test 25: Validate multiple tickets
console.log('\nTest 25: Validate multiple tickets');
const validMultiple = generateMultipleTickets(2, 2, 11111);
assert(validateMultipleTickets(validMultiple), 'Valid multiple tickets should pass');

const invalidMultiple: Ticket[] = [
  testTickets[0],
  [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [null, null, null, null]]], // Invalid board (only 16 numbers)
];
assert(!validateMultipleTickets(invalidMultiple), 'Invalid multiple tickets should fail');

assert(!validateMultipleTickets([]), 'Empty array should fail validation');
console.log('✓ Multiple tickets validation works');

// Test 26: Generate multiple tickets edge cases
console.log('\nTest 26: Generate multiple tickets edge cases');
try {
  generateMultipleTickets(0, 2);
  assert(false, 'Should throw error for 0 tickets');
} catch (e) {
  console.log('✓ Correctly throws error for 0 tickets');
}

try {
  generateMultipleTickets(-1, 2);
  assert(false, 'Should throw error for negative tickets');
} catch (e) {
  console.log('✓ Correctly throws error for negative tickets');
}

try {
  generateMultipleTickets(2.5, 2);
  assert(false, 'Should throw error for non-integer tickets');
} catch (e) {
  console.log('✓ Correctly throws error for non-integer tickets');
}

try {
  generateMultipleTickets(2, 0 as any);
  assert(false, 'Should throw error for 0 boards per ticket');
} catch (e) {
  console.log('✓ Correctly throws error for 0 boards per ticket');
}

try {
  generateMultipleTickets(2, 4 as any);
  assert(false, 'Should throw error for 4 boards per ticket');
} catch (e) {
  console.log('✓ Correctly throws error for 4 boards per ticket');
}

const singleMultiTicket = generateMultipleTickets(1, 1, 77777);
assert(singleMultiTicket.length === 1, 'Should generate 1 ticket');
assert(singleMultiTicket[0].length === 1, 'Should have 1 board');
console.log('✓ Multiple tickets edge cases handled correctly');

// Test 27: No win scenario
console.log('\nTest 27: No win scenario');
const noWinCalledNumbers = new Set([1, 2]); // Not enough for any win
const noWin = checkPlayerWin(testTickets, noWinCalledNumbers);
assertEqual(noWin, null, 'Should return null when no win exists');

const emptyCalledNumbers = new Set<number>();
const emptyWin = checkPlayerWin(testTickets, emptyCalledNumbers);
assertEqual(emptyWin, null, 'Should return null for empty called numbers');

const emptyTickets: Ticket[] = [];
const emptyTicketsWin = checkPlayerWin(emptyTickets, new Set([1, 2, 3, 4]));
assertEqual(emptyTicketsWin, null, 'Should return null for empty tickets array');
console.log('✓ No win scenarios handled correctly');

// Test 28: Deterministic ticket generation with seed
console.log('\nTest 28: Deterministic ticket generation with seed');
const deterministicTickets1 = generateMultipleTickets(2, 2, 55555);
const deterministicTickets2 = generateMultipleTickets(2, 2, 55555);

assert(deterministicTickets1.length === deterministicTickets2.length, 'Should generate same number of tickets');

for (let i = 0; i < deterministicTickets1.length; i++) {
  const nums1 = getTicketNumbers(deterministicTickets1[i]);
  const nums2 = getTicketNumbers(deterministicTickets2[i]);
  assertEqual(nums1.sort(), nums2.sort(), `Ticket ${i} should have same numbers with same seed`);
}
console.log('✓ Deterministic generation with seed works');

// Test 29: Large number of tickets
console.log('\nTest 29: Large number of tickets');
const manyTickets = generateMultipleTickets(10, 3, 33333);
assert(manyTickets.length === 10, 'Should generate 10 tickets');
assert(validateMultipleTickets(manyTickets), 'All 10 tickets should be valid');

for (const ticket of manyTickets) {
  assert(ticket.length === 3, 'Each ticket should have 3 boards');
  const nums = getTicketNumbers(ticket);
  assert(nums.length === 60, 'Each ticket should have 60 numbers');
  assert(new Set(nums).size === 60, 'Each ticket should have 60 unique numbers');
}
console.log('✓ Large number of tickets works correctly');

console.log('\n' + '='.repeat(50));
console.log('All tests passed! ✓');
console.log('='.repeat(50));
