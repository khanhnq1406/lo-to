/**
 * Visual demonstration of authentic Vietnamese Lô Tô cards
 * Run with: npx tsx demo-authentic-cards.ts
 */

import {
  generateCard,
  generateMultipleCards,
  getCardNumbers,
  checkRowWin,
  type Card,
} from './lib/game';

function printCard(card: Card, title: string): void {
  console.log(`\n${title}`);
  console.log('┌────┬────┬────┬────┬────┬────┬────┬────┬────┐');

  for (let row = 0; row < 3; row++) {
    let line = '│';
    for (let col = 0; col < 9; col++) {
      const cell = card[row][col];
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

  // Print statistics
  const numbers = getCardNumbers(card);
  const rowCounts = card.map(row => row.filter(cell => cell !== null).length);

  console.log(`Numbers: ${numbers.sort((a, b) => a - b).join(', ')}`);
  console.log(`Row distribution: [${rowCounts.join(', ')}]`);
  console.log(`Total: ${numbers.length} numbers + ${27 - numbers.length} blanks = 27 cells`);

  // Print column distribution
  console.log('Column ranges:');
  for (let col = 0; col < 9; col++) {
    const columnNumbers: number[] = [];
    for (let row = 0; row < 3; row++) {
      const cell = card[row][col];
      if (cell !== null) {
        columnNumbers.push(cell);
      }
    }

    const minRange = col === 0 ? 1 : col * 10;
    const maxRange = col === 8 ? 90 : (col === 0 ? 9 : col * 10 + 9);

    if (columnNumbers.length > 0) {
      console.log(`  Col ${col} (${minRange}-${maxRange}): ${columnNumbers.join(', ')}`);
    } else {
      console.log(`  Col ${col} (${minRange}-${maxRange}): -`);
    }
  }
}

function printWinDemo(card: Card, rowIndex: number): void {
  console.log(`\n🎉 ROW ${rowIndex} WIN DEMONSTRATION`);
  console.log('┌────┬────┬────┬────┬────┬────┬────┬────┬────┐');

  for (let row = 0; row < 3; row++) {
    let line = '│';
    for (let col = 0; col < 9; col++) {
      const cell = card[row][col];
      if (cell === null) {
        line += '    │';
      } else {
        // Highlight winning row
        if (row === rowIndex) {
          line += `[${cell.toString().padStart(2, ' ')}]│`;
        } else {
          line += ' ' + cell.toString().padStart(2, ' ') + ' │';
        }
      }
    }
    console.log(line);

    if (row < 2) {
      console.log('├────┼────┼────┼────┼────┼────┼────┼────┼────┤');
    }
  }

  console.log('└────┴────┴────┴────┴────┴────┴────┴────┴────┘');

  const winningNumbers = card[rowIndex].filter(n => n !== null);
  console.log(`Winning numbers: ${winningNumbers.join(', ')}`);
  console.log('Player shouts: "Kinh!" or "Lô tô!"');
}

console.log('='.repeat(70));
console.log('AUTHENTIC VIETNAMESE LÔ TÔ - VISUAL DEMONSTRATION');
console.log('='.repeat(70));

// Demo 1: Single card
console.log('\n📋 DEMO 1: Single Authentic Card');
const card1 = generateCard(12345);
printCard(card1, 'Example Card #1');

// Demo 2: Multiple cards for a player
console.log('\n\n📋 DEMO 2: Player with 3 Cards');
const playerCards = generateMultipleCards(3, 54321);

playerCards.forEach((card, index) => {
  printCard(card, `Player Card #${index + 1}`);
});

// Demo 3: Win scenario
console.log('\n\n📋 DEMO 3: Win Scenario');
const demoCard = generateCard(99999);
console.log('\nBefore calling numbers:');
printCard(demoCard, 'Game Card');

// Simulate calling all numbers in row 0
const row0Numbers = demoCard[0].filter(n => n !== null);
const calledNumbers = new Set(row0Numbers);

console.log(`\nCalled numbers: ${Array.from(calledNumbers).sort((a, b) => a - b).join(', ')}`);

const winningRows = checkRowWin(demoCard, calledNumbers);
if (winningRows.length > 0) {
  printWinDemo(demoCard, winningRows[0]);
}

// Demo 4: Column constraints visualization
console.log('\n\n📋 DEMO 4: Column Constraints Visualization');
console.log('\nColumn ranges in authentic Vietnamese Lô Tô:');
console.log('┌─────┬───────────┬─────────────────────────────────────┐');
console.log('│ Col │   Range   │            Description              │');
console.log('├─────┼───────────┼─────────────────────────────────────┤');
console.log('│  0  │   1-9     │ Single digits                       │');
console.log('│  1  │  10-19    │ Teens                               │');
console.log('│  2  │  20-29    │ Twenties                            │');
console.log('│  3  │  30-39    │ Thirties                            │');
console.log('│  4  │  40-49    │ Forties                             │');
console.log('│  5  │  50-59    │ Fifties                             │');
console.log('│  6  │  60-69    │ Sixties                             │');
console.log('│  7  │  70-79    │ Seventies                           │');
console.log('│  8  │  80-90    │ Eighties + 90 (special: 11 numbers) │');
console.log('└─────┴───────────┴─────────────────────────────────────┘');

// Demo 5: Comparison with wrong format
console.log('\n\n📋 DEMO 5: Before vs After Comparison');

console.log('\n❌ OLD FORMAT (INCORRECT):');
console.log('┌────┬────┬────┬────┐');
console.log('│  0 │  1 │  2 │  3 │  5 rows × 4 columns');
console.log('│  4 │  5 │  6 │  7 │  20 numbers (0-99)');
console.log('│  8 │  9 │ 10 │ 11 │  No blanks');
console.log('│ 12 │ 13 │ 14 │ 15 │  No column constraints');
console.log('│ 16 │ 17 │ 18 │ 19 │  Numbers NOT authentic');
console.log('└────┴────┴────┴────┘');

console.log('\n✓ NEW FORMAT (AUTHENTIC):');
console.log('┌────┬────┬────┬────┬────┬────┬────┬────┬────┐');
console.log('│  3 │    │ 25 │    │ 47 │    │    │ 72 │    │  3 rows × 9 columns');
console.log('├────┼────┼────┼────┼────┼────┼────┼────┼────┤');
console.log('│    │ 12 │    │ 33 │    │ 56 │ 68 │    │ 89 │  15 numbers (1-90)');
console.log('├────┼────┼────┼────┼────┼────┼────┼────┼────┤');
console.log('│  7 │    │ 21 │    │ 44 │    │ 61 │    │ 90 │  12 blanks');
console.log('└────┴────┴────┴────┴────┴────┴────┴────┴────┘  Column constraints enforced');
console.log('      Each row: 5 numbers + 4 blanks');
console.log('      Numbers sorted within columns');

// Demo 6: Cultural phrases
console.log('\n\n📋 DEMO 6: Traditional Calling Phrases');
console.log('\nIn Vietnamese culture, callers use rhyming phrases:');
console.log('┌────────┬──────────────────────┬──────────────────────────┐');
console.log('│ Number │     Vietnamese       │       English            │');
console.log('├────────┼──────────────────────┼──────────────────────────┤');
console.log('│   11   │ Hai cây giậu         │ Two sticks               │');
console.log('│   22   │ Hai con ngỗng        │ Two geese                │');
console.log('│   33   │ Ba ba                │ Three threes             │');
console.log('│   69   │ Mười chín nụ hôn     │ Nineteen kisses          │');
console.log('│   77   │ Bảy bảy              │ Seven seven              │');
console.log('│   88   │ Hai bà già           │ Two old ladies           │');
console.log('│   90   │ Cụ già               │ Elderly person           │');
console.log('└────────┴──────────────────────┴──────────────────────────┘');

console.log('\n' + '='.repeat(70));
console.log('DEMONSTRATION COMPLETE');
console.log('='.repeat(70));
console.log('\nKey Points:');
console.log('  • Authentic 3×9 grid format (27 cells)');
console.log('  • 15 numbers (1-90) + 12 blanks per card');
console.log('  • Each row: exactly 5 numbers + 4 blanks');
console.log('  • Column constraints strictly enforced');
console.log('  • Numbers sorted ascending within columns');
console.log('  • Win condition: Complete any 1 row (5 numbers)');
console.log('  • Traditional game played during Tết (Lunar New Year)');
console.log('\n' + '='.repeat(70));
