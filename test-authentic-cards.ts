/**
 * Test Authentic Card Data
 * Verify that extracted card data matches Vietnamese Lô Tô rules
 * Run with: npx tsx test-authentic-cards.ts
 */

import { AUTHENTIC_CARDS, getAuthenticCard } from './lib/authentic-card-data';
import { CardSchema } from './types';

console.log('🎴 Testing Authentic Card Data from Images\n');

let allPassed = true;

// Test each card
for (let cardId = 1; cardId <= 16; cardId++) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing Card #${cardId}`);
  console.log('='.repeat(50));

  const card = getAuthenticCard(cardId);

  if (!card) {
    console.log(`❌ FAIL: Card #${cardId} not found`);
    allPassed = false;
    continue;
  }

  // Validate with Zod schema
  const validation = CardSchema.safeParse(card);

  if (!validation.success) {
    console.log(`❌ FAIL: Card #${cardId} validation failed`);
    console.log('Errors:', validation.error.errors);
    allPassed = false;
    continue;
  }

  // Count numbers and blanks
  const cells = card.flat();
  const numbers = cells.filter((c): c is number => c !== null);
  const blanks = cells.filter((c) => c === null);

  console.log(`✅ Card structure: ${card.length}×${card[0].length} (9×9)`);
  console.log(`✅ Total cells: ${cells.length}`);
  console.log(`✅ Numbers: ${numbers.length} (expected 45)`);
  console.log(`✅ Blanks: ${blanks.length} (expected 36)`);

  // Check unique numbers
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size === numbers.length) {
    console.log(`✅ All numbers unique: ${uniqueNumbers.size}`);
  } else {
    console.log(`❌ Duplicate numbers found!`);
    allPassed = false;
  }

  // Check number range
  const inRange = numbers.every((n) => n >= 1 && n <= 90);
  if (inRange) {
    console.log(`✅ All numbers in range 1-90`);
  } else {
    console.log(`❌ Numbers out of range!`);
    allPassed = false;
  }

  // Check row constraints (each row: 5 numbers, 4 blanks)
  let rowsValid = true;
  card.forEach((row, idx) => {
    const rowNumbers = row.filter((c): c is number => c !== null);
    const rowBlanks = row.filter((c) => c === null);

    if (rowNumbers.length !== 5 || rowBlanks.length !== 4) {
      console.log(
        `❌ Row ${idx}: ${rowNumbers.length} numbers, ${rowBlanks.length} blanks (expected 5,4)`
      );
      rowsValid = false;
      allPassed = false;
    }
  });

  if (rowsValid) {
    console.log(`✅ All rows have 5 numbers + 4 blanks`);
  }

  // Check column constraints
  let columnsValid = true;
  for (let col = 0; col < 9; col++) {
    const minRange = col === 0 ? 1 : col * 10;
    const maxRange = col === 8 ? 90 : col * 10 + 9;

    const columnNumbers: number[] = [];
    for (let row = 0; row < 9; row++) {
      const cell = card[row][col];
      if (cell !== null) {
        if (cell < minRange || cell > maxRange) {
          console.log(
            `❌ Col ${col}: Number ${cell} out of range ${minRange}-${maxRange}`
          );
          columnsValid = false;
          allPassed = false;
        }
        columnNumbers.push(cell);
      }
    }

    // Check if sorted
    const sorted = [...columnNumbers].sort((a, b) => a - b);
    if (JSON.stringify(columnNumbers) !== JSON.stringify(sorted)) {
      console.log(`❌ Col ${col}: Numbers not sorted:`, columnNumbers);
      columnsValid = false;
      allPassed = false;
    }
  }

  if (columnsValid) {
    console.log(`✅ All columns have correct ranges and sorting`);
  }

  console.log(`\n✨ Card #${cardId}: ${validation.success ? 'VALID' : 'INVALID'}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));

const totalCards = Object.keys(AUTHENTIC_CARDS).length;
console.log(`Total cards extracted: ${totalCards}/16`);

if (totalCards === 16 && allPassed) {
  console.log('\n✅ ALL TESTS PASSED! 🎉');
  console.log('All 16 cards are valid and match Vietnamese Lô Tô rules!');
} else {
  console.log('\n❌ SOME TESTS FAILED');
  console.log('Please review the errors above.');
}

console.log('\n');
