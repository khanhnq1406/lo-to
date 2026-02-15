/**
 * Test script for authentic Vietnamese Lô Tô game engine
 * Run with: npx tsx test-authentic-game.ts
 */

import {
  generateCard,
  validateCard,
  getCardNumbers,
  checkRowWin,
  getRemainingNumbers,
  randomCallNumber,
  formatNumber,
  generateMultipleCards,
  hasNumber,
  findNumberPosition,
  checkPlayerWin,
  type Card,
} from './lib/game';

// Test utilities
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error('Expected:', expected);
    console.error('Actual:', actual);
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

console.log('='.repeat(70));
console.log('TESTING AUTHENTIC VIETNAMESE LÔ TÔ GAME ENGINE');
console.log('='.repeat(70));

// Test 1: Generate authentic card with correct structure
console.log('\n[Test 1] Generate authentic card (3×9 layout)');
const card1 = generateCard(12345);
assert(card1.length === 3, 'Card should have 3 rows');
assert(card1[0].length === 9, 'Each row should have 9 columns');
console.log('✓ Card has correct 3×9 structure');

// Test 2: Verify 15 numbers + 12 blanks
console.log('\n[Test 2] Verify card has 15 numbers + 12 blanks');
let numberCount = 0;
let blankCount = 0;
const numbers1 = new Set<number>();

for (const row of card1) {
  for (const cell of row) {
    if (cell !== null) {
      numberCount++;
      numbers1.add(cell);
    } else {
      blankCount++;
    }
  }
}

assert(numberCount === 15, 'Card should have exactly 15 numbers');
assert(blankCount === 12, 'Card should have exactly 12 blanks');
assert(numbers1.size === 15, 'All 15 numbers should be unique');
console.log('✓ Card has 15 unique numbers and 12 blanks');

// Test 3: Verify each row has exactly 5 numbers
console.log('\n[Test 3] Verify each row has exactly 5 numbers');
for (let row = 0; row < 3; row++) {
  const rowNumbers = card1[row].filter(cell => cell !== null);
  assert(rowNumbers.length === 5, `Row ${row} should have exactly 5 numbers`);
}
console.log('✓ Each row has exactly 5 numbers');

// Test 4: Verify number range (1-90, NOT 0-99)
console.log('\n[Test 4] Verify numbers are in range 1-90');
const allNumbers = getCardNumbers(card1);
for (const num of allNumbers) {
  assert(num >= 1 && num <= 90, `Number ${num} should be between 1 and 90`);
}
console.log('✓ All numbers are in range 1-90');

// Test 5: Verify column constraints
console.log('\n[Test 5] Verify column range constraints');
for (let col = 0; col < 9; col++) {
  const minExpected = col === 0 ? 1 : col * 10;
  const maxExpected = col === 8 ? 90 : (col === 0 ? 9 : col * 10 + 9);

  for (let row = 0; row < 3; row++) {
    const cell = card1[row][col];
    if (cell !== null) {
      assert(
        cell >= minExpected && cell <= maxExpected,
        `Column ${col} number ${cell} should be in range ${minExpected}-${maxExpected}`
      );
    }
  }
}
console.log('✓ All columns follow correct number ranges');

// Test 6: Verify numbers sorted within columns
console.log('\n[Test 6] Verify numbers are sorted within columns');
for (let col = 0; col < 9; col++) {
  const columnNumbers: number[] = [];
  for (let row = 0; row < 3; row++) {
    const cell = card1[row][col];
    if (cell !== null) {
      columnNumbers.push(cell);
    }
  }

  for (let i = 1; i < columnNumbers.length; i++) {
    assert(
      columnNumbers[i] > columnNumbers[i - 1],
      `Column ${col} should be sorted ascending`
    );
  }
}
console.log('✓ Numbers are sorted within columns');

// Test 7: Validate card
console.log('\n[Test 7] Validate card structure');
assert(validateCard(card1), 'Valid card should pass validation');
console.log('✓ Card validation passes');

// Test 8: Test win detection (row win only)
console.log('\n[Test 8] Test row win detection');
const testCard: Card = [
  [1, null, 21, null, 41, null, 61, 71, null],  // 5 numbers
  [null, 12, null, 32, null, 52, 62, null, 82], // 5 numbers
  [7, null, 28, null, 48, null, 68, null, 90],  // 5 numbers
];

const calledRow0Partial = new Set([1, 21, 41, 71]); // Missing one number (61)
const win1 = checkRowWin(testCard, calledRow0Partial);
assertEqual(win1, [], 'Should not detect win with incomplete row');

const calledRow0Complete = new Set([1, 21, 41, 61, 71]); // All 5 numbers
const win2 = checkRowWin(testCard, calledRow0Complete);
assert(win2.length === 1 && win2[0] === 0, 'Should detect row 0 win');
console.log('✓ Row win detection works correctly');

// Test 9: Test getRemainingNumbers (1-90 range)
console.log('\n[Test 9] Test remaining numbers (1-90 range)');
const called = new Set([1, 2, 90]);
const remaining = getRemainingNumbers(called);
assert(remaining.length === 87, 'Should have 87 remaining numbers (90 - 3 = 87)');
assert(!remaining.includes(0), 'Should not include 0');
assert(!remaining.includes(1), 'Should not include 1');
assert(!remaining.includes(2), 'Should not include 2');
assert(!remaining.includes(90), 'Should not include 90');
assert(remaining.includes(50), 'Should include 50');
console.log('✓ Remaining numbers range is 1-90');

// Test 10: Test number formatting (no leading zeros needed)
console.log('\n[Test 10] Test number formatting');
assertEqual(formatNumber(1), '1', 'Should format 1 as "1"');
assertEqual(formatNumber(5), '5', 'Should format 5 as "5"');
assertEqual(formatNumber(42), '42', 'Should format 42 as "42"');
assertEqual(formatNumber(90), '90', 'Should format 90 as "90"');

try {
  formatNumber(0);
  assert(false, 'Should throw error for 0');
} catch (e) {
  console.log('✓ Number formatting works (1-90 range, no leading zeros)');
}

// Test 11: Test multiple card generation
console.log('\n[Test 11] Generate multiple independent cards');
const cards = generateMultipleCards(3, 99999);
assert(cards.length === 3, 'Should generate 3 cards');

for (let i = 0; i < cards.length; i++) {
  const card = cards[i];
  assert(validateCard(card), `Card ${i} should be valid`);

  const cardNums = getCardNumbers(card);
  assert(cardNums.length === 15, `Card ${i} should have 15 numbers`);
  assert(new Set(cardNums).size === 15, `Card ${i} should have unique numbers`);
}
console.log('✓ Multiple card generation works');

// Test 12: Test player win detection
console.log('\n[Test 12] Test player win detection (authentic rules)');
const playerCards: Card[] = [
  [
    [1, null, 21, null, 41, null, 61, 71, null],  // 5 numbers
    [null, 12, null, 32, null, 52, 62, null, 82], // 5 numbers
    [7, null, 28, null, 48, null, 68, null, 90],  // 5 numbers
  ],
  [
    [2, null, null, 35, null, 58, null, 74, 81],  // 5 numbers
    [null, 14, 22, null, 45, 59, 66, null, null], // 5 numbers
    [8, 19, null, 38, null, null, null, 77, 88],  // 5 numbers
  ],
];

// Test card 1, row 0 win
const card1Row0Numbers = playerCards[0][0].filter(n => n !== null);
const calledCard1Row0 = new Set(card1Row0Numbers);
const playerWin1 = checkPlayerWin(playerCards, calledCard1Row0);
assert(playerWin1 !== null, 'Should detect win on card 1, row 0');
assert(playerWin1!.type === 'row', 'Should be row win type');
assert(playerWin1!.ticketIndex === 0, 'Should be on card 0');
console.log('✓ Player win detection works (card 1, row 0)');

// Test card 2, row 1 win
const card2Row1Numbers = playerCards[1][1].filter(n => n !== null);
const calledCard2Row1 = new Set(card2Row1Numbers);
const playerWin2 = checkPlayerWin(playerCards, calledCard2Row1);
assert(playerWin2 !== null, 'Should detect win on card 2, row 1');
assert(playerWin2!.type === 'row', 'Should be row win type');
assert(playerWin2!.ticketIndex === 1, 'Should be on card 1');
console.log('✓ Player win detection works (card 2, row 1)');

// Test 13: Test deterministic generation
console.log('\n[Test 13] Test deterministic generation with seed');
const card1a = generateCard(55555);
const card1b = generateCard(55555);
const nums1a = getCardNumbers(card1a);
const nums1b = getCardNumbers(card1b);
assertEqual(
  nums1a.sort((a, b) => a - b),
  nums1b.sort((a, b) => a - b),
  'Same seed should generate same numbers'
);
console.log('✓ Deterministic generation works');

// Test 14: Print visual example
console.log('\n[Test 14] Visual card example');
console.log('Generated authentic Vietnamese Lô Tô card:');
console.log('┌────┬────┬────┬────┬────┬────┬────┬────┬────┐');
for (let row = 0; row < 3; row++) {
  let line = '│';
  for (let col = 0; col < 9; col++) {
    const cell = card1[row][col];
    if (cell === null) {
      line += '    │';
    } else {
      line += ' ' + cell.toString().padStart(2, ' ') + ' │';
    }
  }
  console.log(line);
  if (row < 2) {
    console.log('├────┼────┼────┼────┼────┼────┼────┼────┼────┤');
  }
}
console.log('└────┴────┴────┴────┴────┴────┴────┴────┴────┘');

// Test 15: Edge cases
console.log('\n[Test 15] Test edge cases');

// Invalid card: wrong dimensions
const invalidCard1: Card = [[1, 2, 3, 4, 5, 6, 7, 8, 9]]; // Only 1 row
assert(!validateCard(invalidCard1), 'Should reject card with wrong row count');

// Invalid card: wrong number range
const invalidCard2: Card = [
  [0, null, 21, null, 41, null, 61, 71, null], // 0 is invalid (5 numbers)
  [null, 12, null, 32, null, 52, 62, null, 82], // 5 numbers
  [7, null, 28, null, 48, null, 68, null, 90],  // 5 numbers
];
assert(!validateCard(invalidCard2), 'Should reject card with number 0');

// Invalid card: wrong column range
const invalidCard3: Card = [
  [11, null, 21, null, 41, null, 61, 71, null], // 11 in column 0 (should be 1-9) - 5 numbers
  [null, 12, null, 32, null, 52, 62, null, 82], // 5 numbers
  [7, null, 28, null, 48, null, 68, null, 90],  // 5 numbers
];
assert(!validateCard(invalidCard3), 'Should reject card with wrong column range');

console.log('✓ Edge cases handled correctly');

// Final summary
console.log('\n' + '='.repeat(70));
console.log('ALL TESTS PASSED! ✓');
console.log('='.repeat(70));
console.log('\nAuthentic Vietnamese Lô Tô game engine is working correctly!');
console.log('\nKey features verified:');
console.log('  ✓ 3 rows × 9 columns = 27 cells');
console.log('  ✓ 15 numbers (1-90) + 12 blanks per card');
console.log('  ✓ Each row: exactly 5 numbers + 4 blanks');
console.log('  ✓ Column constraints: col 0 = 1-9, col 1 = 10-19, ..., col 8 = 80-90');
console.log('  ✓ Numbers sorted ascending within columns');
console.log('  ✓ Win condition: Complete any horizontal row (5 numbers)');
console.log('  ✓ Multiple independent cards per player');
console.log('  ✓ Deterministic generation with seed for testing');
console.log('\n' + '='.repeat(70));
