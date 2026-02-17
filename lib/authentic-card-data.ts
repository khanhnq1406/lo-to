/**
 * Authentic Card Data - Exact layouts from real Vietnamese Lô Tô cards
 * Extracted from actual card images (01.jpg - 16.jpg)
 * Each card is 9 rows × 9 columns with exact number positions
 */

export type { Card } from "@/types";
import type { Card } from "@/types";

/**
 * Card #1 (Pink/Red) - Card ID 20
 * Extracted from 01.jpg
 */
const CARD_01: Card = [
  // Section 1 (rows 0-2)
  [null, 19, 28, null, 46, null, 68, 75, null],
  [5, null, 26, 39, null, 58, null, 78, null],
  [null, 14, null, 37, null, 50, 69, null, 84],
  // Section 2 (rows 3-5)
  [3, null, 25, null, null, 57, 60, null, 86],
  [null, 16, null, 31, 49, null, null, 77, 89],
  [8, 17, null, null, 48, 59, null, 79, null],
  // Section 3 (rows 6-8)
  [null, 15, 20, null, 44, 52, null, 70, null],
  [4, null, null, 33, 41, null, 61, null, 83],
  [9, null, 29, 30, null, null, 62, null, 88],
];

/**
 * Card #2 (Pink/Red) - Card ID 23
 * Extracted from 02.jpg
 */
const CARD_02: Card = [
  // Section 1 (rows 0-2)
  [null, 18, 22, null, null, 55, null, 76, 87],
  [null, 12, null, 38, 40, null, 66, null, 82],
  [1, null, 27, null, 42, null, null, 73, 85],
  // Section 2 (rows 3-5)
  [null, 10, null, 34, null, 56, 63, null, 80],
  [6, null, null, 35, 43, null, 64, 71, null],
  [null, 13, 21, null, null, 54, null, 74, 90],
  // Section 3 (rows 6-8)
  [7, null, 24, 32, null, 53, 67, null, null],
  [2, null, null, 36, 47, null, 65, 72, null],
  [null, 11, 23, null, 45, 51, null, null, 81],
];

/**
 * Card #3 (Red/Orange) - Card ID 47
 * Extracted from 03.jpg
 */
const CARD_03: Card = [
  // Section 1 (rows 0-2)
  [null, 19, null, 32, null, 58, 64, null, 84],
  [null, 13, 20, null, 48, 55, null, 77, null],
  [2, null, 21, null, 46, null, null, 75, 82],
  // Section 2 (rows 3-5)
  [6, 18, null, 39, null, null, 62, 70, null],
  [null, null, 25, null, 41, 59, null, 74, 83],
  [null, 17, null, 38, 44, null, 60, null, 86],
  // Section 3 (rows 6-8)
  [8, null, 22, null, 47, null, 66, 72, null],
  [9, 12, null, 37, 42, null, null, null, 88],
  [null, 15, null, 36, null, 51, 68, null, 90],
];

/**
 * Card #4 (Red/Orange) - Card ID 44
 * Extracted from 04.jpg
 */
const CARD_04: Card = [
  // Section 1 (rows 0-2)
  [5, null, 29, 30, null, 56, null, null, 80],
  [null, 10, null, 35, null, 54, 63, null, 81],
  [4, null, 26, null, 45, null, 61, 79, null],
  // Section 2 (rows 3-5)
  [3, 14, null, null, 43, 50, null, 71, null],
  [7, null, 23, 31, null, 52, null, 73, null],
  [null, 11, 28, null, 49, null, 69, null, 89],
  // Section 3 (rows 6-8)
  [null, null, 24, 34, null, 53, 67, null, 85],
  [null, null, 27, null, 40, 57, null, 76, 87],
  [1, 16, null, 33, null, null, 65, 78, null],
];

/**
 * Card #5 (Purple) - Card ID 14
 * Extracted from 05.jpg
 */
const CARD_05: Card = [
  // Section 1 (rows 0-2)
  [null, 15, 24, null, 44, null, 64, 79, null],
  [4, null, 29, 30, null, 51, null, 76, null],
  [null, 17, null, 32, null, 53, 63, null, 80],
  // Section 2 (rows 3-5)
  [7, null, 23, null, null, 56, 61, null, 85],
  [null, 11, null, 34, 42, null, null, 72, 87],
  [3, 13, null, null, 45, 54, null, 74, null],
  // Section 3 (rows 6-8)
  [null, 16, 21, null, 43, 58, null, 78, null],
  [6, null, null, 37, 40, null, 65, null, 82],
  [2, null, 22, 39, null, null, 67, null, 83],
];

/**
 * Card #6 (Purple) - Card ID 17
 * Extracted from 06.jpg
 */
const CARD_06: Card = [
  // Section 1 (rows 0-2)
  [null, 14, 28, null, null, 50, null, 75, 90],
  [null, 19, null, 31, 49, null, 68, null, 81],
  [5, null, 20, null, 47, null, null, 77, 84],
  // Section 2 (rows 3-5)
  [null, 12, null, 38, null, 55, 69, null, 89],
  [1, null, null, 36, 41, null, 66, 71, null],
  [null, 18, 26, null, null, 57, null, 70, 88],
  // Section 3 (rows 6-8)
  [8, null, 25, 33, null, 52, 62, null, null],
  [9, null, null, 35, 46, null, 60, 73, null],
  [null, 10, 27, null, 48, 59, null, null, 86],
];

/**
 * Card #7 (Orange) - Card ID 5
 * Extracted from 07.jpg
 */
const CARD_07: Card = [
  // Section 1 (rows 0-2)
  [null, 12, null, 34, 40, null, null, 75, 89],
  [8, 16, null, null, 42, 55, null, 77, null],
  [5, null, 24, 33, null, null, 67, null, 83],
  // Section 2 (rows 3-5)
  [null, 14, 27, null, null, 51, null, 78, 84],
  [null, 18, null, 38, 46, null, 63, null, 81],
  [9, null, null, null, 47, null, 66, 79, 86],
  // Section 3 (rows 6-8)
  [4, null, 28, 31, null, 57, null, 72, null],
  [null, 17, null, 36, null, 52, 64, null, 80],
  [null, 19, 23, null, 45, null, 62, 74, null],
];

/**
 * Card #8 (Orange) - Card ID 2
 * Extracted from 08.jpg
 */
const CARD_08: Card = [
  // Section 1 (rows 0-2)
  [3, 15, null, 32, null, null, 60, 71, null],
  [null, 10, 20, null, 43, 54, null, null, 85],
  [2, null, 26, 35, null, 59, null, 76, null],
  // Section 2 (rows 3-5)
  [6, null, null, 39, 49, null, 68, 73, null],
  [null, 13, 29, null, 48, 50, null, null, 88],
  [null, null, 22, 30, null, 53, 65, null, 82],
  // Section 3 (rows 6-8)
  [1, null, 25, null, null, 58, 69, null, 90],
  [7, null, 21, null, 41, 56, null, null, 87],
  [null, 11, null, 37, 44, null, 61, 70, null],
];

/**
 * Card #9 (Yellow) - Card ID 8
 * Extracted from 09.jpg
 */
const CARD_09: Card = [
  // Section 1 (rows 0-2)
  [7, 16, null, 32, null, null, 66, 73, null],
  [null, 18, 29, null, 46, 55, null, null, 88],
  [2, null, 23, 34, null, 50, null, 75, null],
  // Section 2 (rows 3-5)
  [4, null, null, 30, 40, null, 61, 78, null],
  [null, 10, 27, null, 41, 56, null, null, 86],
  [null, null, 20, 39, null, 59, 60, null, 83],
  // Section 3 (rows 6-8)
  [9, null, 24, null, null, 51, 64, null, 81],
  [3, null, 28, null, 48, 53, null, null, 80],
  [null, 17, null, 37, 45, null, 63, 77, null],
];

/**
 * Card #10 (Yellow) - Card ID 11
 * Extracted from 10.jpg
 */
const CARD_10: Card = [
  // Section 1 (rows 0-2)
  [null, 19, null, 35, 49, null, null, 71, 85],
  [8, 14, null, null, 47, 54, null, 74, null],
  [6, null, 25, 36, null, null, 62, null, 84],
  // Section 2 (rows 3-5)
  [null, 15, 22, null, null, 58, null, 70, 89],
  [null, 12, null, 31, 43, null, 68, null, 90],
  [1, null, null, null, 42, null, 65, 72, 87],
  // Section 3 (rows 6-8)
  [5, null, 21, 38, null, 52, null, 76, null],
  [null, 13, null, 33, null, 57, 67, null, 82],
  [null, 11, 26, null, 44, null, 69, 79, null],
];

/**
 * Card #11 (Green) - Card ID 32
 * Extracted from 11.jpg
 */
const CARD_11: Card = [
  // Section 1 (rows 0-2)
  [null, 16, 28, null, 45, null, 68, null, 87],
  [4, null, 29, 35, null, 55, null, 73, null],
  [9, null, null, 30, null, 54, 62, null, 88],
  // Section 2 (rows 3-5)
  [1, null, 21, 33, null, 52, null, 76, null],
  [8, null, null, null, 40, 50, null, 79, 81],
  [null, 11, 20, null, 46, null, 63, null, 83],
  // Section 3 (rows 6-8)
  [null, null, 27, null, 49, 59, null, 72, 80],
  [2, 19, null, 32, 48, null, 67, null, null],
  [null, 14, 22, null, null, 57, null, 78, 90],
];

/**
 * Card #12 (Green) - Card ID 35
 * Extracted from 12.jpg
 */
const CARD_12: Card = [
  // Section 1 (rows 0-2)
  [6, 18, null, null, 47, null, 69, null, 86],
  [null, 13, null, 31, 44, null, 61, 70, null],
  [7, null, 24, 34, null, 56, null, 71, null],
  // Section 2 (rows 3-5)
  [5, null, 23, null, 41, null, 65, 74, null],
  [null, 10, null, 37, null, 53, 60, null, 89],
  [null, 17, null, 38, 42, null, null, 75, 84],
  // Section 3 (rows 6-8)
  [null, 15, 25, null, null, 51, null, 77, 85],
  [null, 12, null, 36, 43, null, 64, null, 82],
  [3, null, 26, 39, null, 58, 66, null, null],
];

/**
 * Card #13 (Blue/Cyan) - Card ID 26
 * Extracted from 13.jpg
 */
const CARD_13: Card = [
  // Section 1 (rows 0-2)
  [null, 13, 22, null, 41, null, 61, null, 86],
  [3, null, 24, 34, null, 52, null, 71, null],
  [1, null, null, 35, null, 56, 64, null, 83],
  // Section 2 (rows 3-5)
  [7, null, 23, 36, null, 53, null, 75, null],
  [5, null, null, null, 48, 59, null, 72, 84],
  [null, 14, 28, null, 42, null, 60, null, 87],
  // Section 3 (rows 6-8)
  [null, null, 26, null, 47, 50, null, 79, 89],
  [4, 10, null, 30, 49, null, 66, null, null],
  [null, 15, 25, null, null, 51, null, 76, 81],
];

/**
 * Card #14 (Blue/Cyan) - Card ID 29
 * Extracted from 14.jpg
 */
const CARD_14: Card = [
  // Section 1 (rows 0-2)
  [9, 16, null, null, 46, null, 65, null, 80],
  [null, 11, null, 32, 45, null, 68, 78, null],
  [8, null, 21, 33, null, 57, null, 73, null],
  // Section 2 (rows 3-5)
  [6, null, 20, null, 43, null, 63, 77, null],
  [null, 12, null, 31, null, 54, 62, null, 85],
  [null, 19, null, 39, 40, null, null, 70, 82],
  // Section 3 (rows 6-8)
  [null, 18, 29, null, null, 58, null, 74, 90],
  [null, 17, null, 38, 44, null, 69, null, 88],
  [2, null, 27, 37, null, 55, 67, null, null],
];

/**
 * Card #15 (Green/Lime) - Card ID 41
 * Extracted from 15.jpg
 */
const CARD_15: Card = [
  // Section 1 (rows 0-2)
  [null, 11, null, 35, null, 59, 68, null, 80],
  [null, 17, 24, null, 42, 57, null, 76, null],
  [1, null, 27, null, 48, null, null, 79, 81],
  // Section 2 (rows 3-5)
  [7, 16, null, 31, null, null, 65, 77, null],
  [null, null, 23, null, 44, 50, null, 71, 85],
  [null, 14, null, 37, 49, null, 63, null, 88],
  // Section 3 (rows 6-8)
  [3, null, 20, null, 46, null, 67, 73, null],
  [8, 12, null, 34, 45, null, null, null, 87],
  [null, 19, null, 39, null, 55, 60, null, 89],
];

/**
 * Card #16 (Green/Lime) - Card ID 38
 * Extracted from 16.jpg
 */
const CARD_16: Card = [
  // Section 1 (rows 0-2)
  [9, null, 25, 38, null, 53, null, null, 86],
  [null, 15, null, 36, null, 51, 64, null, 90],
  [2, null, 28, null, 47, null, 66, 78, null],
  // Section 2 (rows 3-5)
  [5, 10, null, null, 41, 56, null, 72, null],
  [4, null, 22, 33, null, 54, null, 74, null],
  [null, 13, 26, null, 40, null, 61, null, 82],
  // Section 3 (rows 6-8)
  [null, null, 29, 30, null, 58, 62, null, 83],
  [null, null, 21, null, 43, 52, null, 75, 84],
  [6, 18, null, 32, null, null, 69, 70, null],
];

/**
 * Map of all authentic cards by ID
 */
export const AUTHENTIC_CARDS: Record<number, Card> = {
  1: CARD_01,
  2: CARD_02,
  3: CARD_03,
  4: CARD_04,
  5: CARD_05,
  6: CARD_06,
  7: CARD_07,
  8: CARD_08,
  9: CARD_09,
  10: CARD_10,
  11: CARD_11,
  12: CARD_12,
  13: CARD_13,
  14: CARD_14,
  15: CARD_15,
  16: CARD_16,
};

/**
 * Get authentic card data by ID
 */
export function getAuthenticCard(cardId: number): Card | null {
  return AUTHENTIC_CARDS[cardId] || null;
}

/**
 * Get multiple authentic cards by IDs
 */
export function getAuthenticCards(cardIds: number[]): Card[] {
  return cardIds
    .map((id) => getAuthenticCard(id))
    .filter((card): card is Card => card !== null);
}
