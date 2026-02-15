/**
 * Client-side Win Detection Helper
 * Pure functions for detecting wins on player's cards
 *
 * FEATURES:
 * - Detects row wins (authentic Vietnamese Lô Tô)
 * - Returns detailed win information
 * - Uses game engine functions for validation
 * - Client-side only (server validates all claims)
 *
 * USAGE:
 * ```ts
 * const winResult = detectWin(playerCards, calledNumbers);
 * if (winResult) {
 *   // Player has won!
 *   console.log(`Won on card ${winResult.cardIndex}, row ${winResult.rowIndex}`);
 * }
 * ```
 */

import { Card, WinResult, WinType } from '@/types';
import { checkRowWin } from './game';

/**
 * Result of win detection for a specific card
 */
export interface CardWinResult {
  /** Index of the winning card in player's tickets array */
  cardIndex: number;
  /** Index of the winning row (0-2) */
  rowIndex: number;
  /** Type of win */
  type: WinType;
  /** The actual card that won */
  card: Card;
  /** Numbers that completed the winning row */
  winningNumbers: number[];
}

/**
 * Detects if any of the player's cards have won
 * Checks all cards and returns the first win found
 *
 * @param cards - Array of player's cards
 * @param calledNumbers - Set of numbers that have been called
 * @returns CardWinResult if win detected, null otherwise
 */
export function detectWin(
  cards: Card[],
  calledNumbers: Set<number>
): CardWinResult | null {
  if (!cards || cards.length === 0) {
    return null;
  }

  // Check each card for a win
  for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
    const card = cards[cardIndex];

    // Check for row win (authentic Vietnamese Lô Tô)
    const winningRowIndices = checkRowWin(card, calledNumbers);

    if (winningRowIndices.length > 0) {
      // Found a win! Return details of first winning row
      const rowIndex = winningRowIndices[0];
      const winningNumbers = getRowNumbers(card, rowIndex);

      return {
        cardIndex,
        rowIndex,
        type: 'row',
        card,
        winningNumbers,
      };
    }
  }

  return null;
}

/**
 * Gets all non-null numbers from a specific row in a card
 *
 * @param card - Card to check
 * @param rowIndex - Row index (0-2)
 * @returns Array of numbers in the row
 */
export function getRowNumbers(card: Card, rowIndex: number): number[] {
  if (!card || rowIndex < 0 || rowIndex >= card.length) {
    return [];
  }

  const row = card[rowIndex];
  if (!row) {
    return [];
  }

  return row.filter((cell): cell is number => cell !== null);
}

/**
 * Checks if a specific card has a win
 * Useful for checking a single card
 *
 * @param card - Single card to check
 * @param calledNumbers - Set of numbers that have been called
 * @returns CardWinResult if win detected, null otherwise
 */
export function detectCardWin(
  card: Card,
  calledNumbers: Set<number>
): CardWinResult | null {
  return detectWin([card], calledNumbers);
}

/**
 * Gets all winning cards from a player's cards
 * Returns all cards that have wins, not just the first one
 *
 * @param cards - Array of player's cards
 * @param calledNumbers - Set of numbers that have been called
 * @returns Array of all winning card results
 */
export function detectAllWins(
  cards: Card[],
  calledNumbers: Set<number>
): CardWinResult[] {
  if (!cards || cards.length === 0) {
    return [];
  }

  const wins: CardWinResult[] = [];

  // Check each card for wins
  for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
    const card = cards[cardIndex];

    // Check for row wins
    const winningRowIndices = checkRowWin(card, calledNumbers);

    // Add each winning row as a separate result
    for (const rowIndex of winningRowIndices) {
      const winningNumbers = getRowNumbers(card, rowIndex);

      wins.push({
        cardIndex,
        rowIndex,
        type: 'row',
        card,
        winningNumbers,
      });
    }
  }

  return wins;
}

/**
 * Converts a CardWinResult to a WinResult (for server communication)
 * Adds player information to the win result
 *
 * @param cardWin - Card win result from detection
 * @param playerId - ID of the winning player
 * @param playerName - Name of the winning player
 * @returns WinResult ready to send to server
 */
export function toWinResult(
  cardWin: CardWinResult,
  playerId: string,
  playerName: string
): WinResult {
  return {
    playerId,
    playerName,
    cardIndex: cardWin.cardIndex,
    rowIndex: cardWin.rowIndex,
    type: cardWin.type,
    // Legacy fields for backward compatibility
    ticketIndex: cardWin.cardIndex,
    boardIndex: 0,
    rowIndices: [cardWin.rowIndex],
  };
}

/**
 * Checks how close a card is to winning
 * Returns the minimum number of numbers needed to win
 *
 * @param card - Card to check
 * @param calledNumbers - Set of numbers that have been called
 * @returns Minimum numbers needed to complete any row (0 if already won)
 */
export function numbersNeededToWin(
  card: Card,
  calledNumbers: Set<number>
): number {
  if (!card || card.length !== 3) {
    return Infinity;
  }

  let minNeeded = Infinity;

  // Check each row
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    const row = card[rowIndex];
    if (!row || row.length !== 9) {
      continue;
    }

    // Get all non-null numbers in this row
    const rowNumbers = row.filter((cell): cell is number => cell !== null);

    // Count how many are NOT called yet
    const uncalledCount = rowNumbers.filter(num => !calledNumbers.has(num)).length;

    // Update minimum
    minNeeded = Math.min(minNeeded, uncalledCount);

    // If already won, return 0
    if (minNeeded === 0) {
      return 0;
    }
  }

  return minNeeded === Infinity ? Infinity : minNeeded;
}

/**
 * Gets the closest row to winning on a card
 * Returns row index and how many numbers are needed
 *
 * @param card - Card to check
 * @param calledNumbers - Set of numbers that have been called
 * @returns Object with rowIndex and numbersNeeded, or null if card invalid
 */
export function getClosestRow(
  card: Card,
  calledNumbers: Set<number>
): { rowIndex: number; numbersNeeded: number } | null {
  if (!card || card.length !== 3) {
    return null;
  }

  let bestRowIndex = -1;
  let minNeeded = Infinity;

  // Check each row
  for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
    const row = card[rowIndex];
    if (!row || row.length !== 9) {
      continue;
    }

    // Get all non-null numbers in this row
    const rowNumbers = row.filter((cell): cell is number => cell !== null);

    // Count how many are NOT called yet
    const uncalledCount = rowNumbers.filter(num => !calledNumbers.has(num)).length;

    // Update best row
    if (uncalledCount < minNeeded) {
      minNeeded = uncalledCount;
      bestRowIndex = rowIndex;
    }

    // If already won, return immediately
    if (minNeeded === 0) {
      return { rowIndex, numbersNeeded: 0 };
    }
  }

  if (bestRowIndex === -1) {
    return null;
  }

  return { rowIndex: bestRowIndex, numbersNeeded: minNeeded };
}
