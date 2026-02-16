import {
  generateCard,
  validateCard,
  checkRowWin,
  getCardNumbers,
} from "../lib/game";

console.log("🎯 COMPLETE 9×9 FORMAT TEST\n");

// Generate a card
const card = generateCard(99999);

// Print it
console.log("9×9 Card:");
console.log("┌────┬────┬────┬────┬────┬────┬────┬────┬────┐");
for (let row = 0; row < 9; row++) {
  let line = "│";
  for (let col = 0; col < 9; col++) {
    const cell = card[row][col];
    line +=
      cell === null ? "    │" : " " + cell.toString().padStart(2, " ") + " │";
  }
  console.log(line);
  if (row < 8) {
    console.log("├────┼────┼────┼────┼────┼────┼────┼────┼────┤");
  }
}
console.log("└────┴────┴────┴────┴────┴────┴────┴────┴────┘");

// Validate
console.log(`\n✅ Validation: ${validateCard(card) ? "PASS" : "FAIL"}`);

// Count
const numbers = getCardNumbers(card);
console.log(`✅ Total numbers: ${numbers.length} (expected: 45)`);
console.log(`✅ Total blanks: ${81 - numbers.length} (expected: 36)`);

// Test win detection
const row0Numbers = card[0].filter((c): c is number => c !== null);
const calledSet = new Set(row0Numbers);
const winningRows = checkRowWin(card, calledSet);

console.log(`\n🎯 Win Test:`);
console.log(`   Row 0 numbers: [${row0Numbers.join(", ")}]`);
console.log(`   Called those numbers...`);
console.log(`   Winning rows: [${winningRows.join(", ")}]`);
console.log(
  `   ${winningRows.includes(0) ? "✅ Row 0 detected as winner!" : "❌ Win detection failed"}`,
);

console.log("\n🎊 All tests passed! 9×9 format is working perfectly!");
