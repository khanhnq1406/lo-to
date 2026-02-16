import { generateCard, validateCard, getCardNumbers } from "../lib/game";

console.log("Testing 9×9 Card Generation...\n");

const card = generateCard(12345);

// Print the card
console.log("Generated 9×9 Card:");
console.log("┌────┬────┬────┬────┬────┬────┬────┬────┬────┐");
for (let row = 0; row < 9; row++) {
  let line = "│";
  for (let col = 0; col < 9; col++) {
    const cell = card[row][col];
    if (cell === null) {
      line += "    │";
    } else {
      line += " " + cell.toString().padStart(2, " ") + " │";
    }
  }
  console.log(line);
  if (row < 8) {
    console.log("├────┼────┼────┼────┼────┼────┼────┼────┼────┤");
  }
}
console.log("└────┴────┴────┴────┴────┴────┴────┴────┴────┘");

// Validate
const isValid = validateCard(card);
console.log(`\nValidation: ${isValid ? "✅ PASS" : "❌ FAIL"}`);

// Count numbers
const numbers = getCardNumbers(card);
console.log(`Total numbers: ${numbers.length}`);

// Count per row
console.log("\nNumbers per row:");
for (let row = 0; row < 9; row++) {
  const rowCount = card[row].filter((cell) => cell !== null).length;
  console.log(`  Row ${row}: ${rowCount} numbers`);
}

// Count per column
console.log("\nNumbers per column:");
for (let col = 0; col < 9; col++) {
  let colCount = 0;
  for (let row = 0; row < 9; row++) {
    if (card[row][col] !== null) colCount++;
  }
  console.log(`  Col ${col}: ${colCount} numbers`);
}

console.log("\n✅ 9×9 card generation successful!");
