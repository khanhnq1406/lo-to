/**
 * Debug Card Data - Check what's wrong with each card
 */

import { AUTHENTIC_CARDS } from './lib/authentic-card-data';

for (let cardId = 1; cardId <= 16; cardId++) {
  const card = AUTHENTIC_CARDS[cardId];
  if (!card) continue;

  console.log(`\nCard #${cardId}:`);

  // Count numbers per row
  card.forEach((row, idx) => {
    const nums = row.filter((c): c is number => c !== null);
    const blanks = row.filter((c) => c === null);
    console.log(`  Row ${idx}: ${nums.length} numbers, ${blanks.length} blanks - ${nums.join(', ')}`);
  });

  // Total
  const allNums = card.flat().filter((c): c is number => c !== null);
  const allBlanks = card.flat().filter((c) => c === null);
  console.log(`  Total: ${allNums.length} numbers, ${allBlanks.length} blanks`);

  // Check duplicates
  const unique = new Set(allNums);
  if (unique.size !== allNums.length) {
    console.log(`  ⚠️  DUPLICATES FOUND!`);
    const counts = new Map<number, number>();
    allNums.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));
    counts.forEach((count, num) => {
      if (count > 1) {
        console.log(`    Number ${num} appears ${count} times`);
      }
    });
  }
}
