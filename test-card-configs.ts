/**
 * Test Card Configurations
 * Verify card configs are correctly set up
 * Run with: npx tsx test-card-configs.ts
 */

import {
  CARD_CONFIGS,
  COLOR_CLASSES,
  getCardConfig,
  getCardsByColor,
  getCardColorClasses,
  type CardColor,
} from './lib/card-configs';

console.log('🎴 Testing Card Configurations\n');

// Test 1: Verify all 16 cards exist
console.log('Test 1: Verify 16 cards');
if (CARD_CONFIGS.length === 16) {
  console.log('✅ PASS: 16 cards configured');
} else {
  console.log(`❌ FAIL: Expected 16 cards, got ${CARD_CONFIGS.length}`);
}

// Test 2: Verify card IDs are sequential 1-16
console.log('\nTest 2: Verify card IDs');
const cardIds = CARD_CONFIGS.map((c) => c.id).sort((a, b) => a - b);
const expectedIds = Array.from({ length: 16 }, (_, i) => i + 1);
if (JSON.stringify(cardIds) === JSON.stringify(expectedIds)) {
  console.log('✅ PASS: Card IDs are 1-16');
} else {
  console.log('❌ FAIL: Card IDs are not sequential 1-16');
  console.log('  Got:', cardIds);
}

// Test 3: Verify 8 colors
console.log('\nTest 3: Verify 8 colors');
const colors = new Set(CARD_CONFIGS.map((c) => c.color));
if (colors.size === 8) {
  console.log('✅ PASS: 8 distinct colors');
  console.log('  Colors:', Array.from(colors).join(', '));
} else {
  console.log(`❌ FAIL: Expected 8 colors, got ${colors.size}`);
}

// Test 4: Verify each color has exactly 2 cards
console.log('\nTest 4: Verify color distribution');
const colorCounts = new Map<CardColor, number>();
CARD_CONFIGS.forEach((card) => {
  colorCounts.set(card.color, (colorCounts.get(card.color) || 0) + 1);
});

let allHaveTwo = true;
colorCounts.forEach((count, color) => {
  if (count !== 2) {
    console.log(`❌ FAIL: Color ${color} has ${count} cards (expected 2)`);
    allHaveTwo = false;
  }
});

if (allHaveTwo) {
  console.log('✅ PASS: Each color has exactly 2 cards');
  colorCounts.forEach((count, color) => {
    const cards = getCardsByColor(color);
    console.log(`  ${color}: Cards ${cards.map((c) => c.id).join(', ')}`);
  });
}

// Test 5: Verify image files
console.log('\nTest 5: Verify image filenames');
const expectedFiles = Array.from({ length: 16 }, (_, i) =>
  String(i + 1).padStart(2, '0') + '.jpg'
);
const actualFiles = CARD_CONFIGS.map((c) => c.imageFile).sort();
if (JSON.stringify(actualFiles) === JSON.stringify(expectedFiles)) {
  console.log('✅ PASS: Image files named 01.jpg - 16.jpg');
} else {
  console.log('❌ FAIL: Image filenames incorrect');
  console.log('  Expected:', expectedFiles);
  console.log('  Got:', actualFiles);
}

// Test 6: Verify COLOR_CLASSES has all colors
console.log('\nTest 6: Verify COLOR_CLASSES');
const requiredColors: CardColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'cyan',
];

let allColorsPresent = true;
requiredColors.forEach((color) => {
  if (!COLOR_CLASSES[color]) {
    console.log(`❌ FAIL: Missing COLOR_CLASSES for ${color}`);
    allColorsPresent = false;
  }
});

if (allColorsPresent) {
  console.log('✅ PASS: All 8 colors have CSS classes');
}

// Test 7: Verify helper functions
console.log('\nTest 7: Verify helper functions');

// Test getCardConfig
const card5 = getCardConfig(5);
if (card5 && card5.id === 5 && card5.color === 'green') {
  console.log('✅ PASS: getCardConfig(5) returns correct card');
} else {
  console.log('❌ FAIL: getCardConfig(5) incorrect');
}

// Test getCardsByColor
const greenCards = getCardsByColor('green');
if (greenCards.length === 2 && greenCards.every((c) => c.color === 'green')) {
  console.log('✅ PASS: getCardsByColor("green") returns 2 green cards');
} else {
  console.log('❌ FAIL: getCardsByColor("green") incorrect');
}

// Test getCardColorClasses
const card1Classes = getCardColorClasses(1);
if (card1Classes.border === 'border-red-500') {
  console.log('✅ PASS: getCardColorClasses(1) returns red classes');
} else {
  console.log('❌ FAIL: getCardColorClasses(1) incorrect');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('Card Configuration Summary:');
console.log('='.repeat(50));
CARD_CONFIGS.forEach((card) => {
  console.log(
    `Card ${String(card.id).padStart(2, '0')}: ${card.imageFile} - ${card.color} - ${card.name}`
  );
});

console.log('\n✨ All tests completed!\n');
