/**
 * Predefined Card Generator
 * Returns authentic card layouts from real Vietnamese Lô Tô images
 * Each card ID (1-16) maps to exact layout from sample images
 */

import { getAuthenticCard, getAuthenticCards, type Card } from './authentic-card-data';

/**
 * Generate a specific card by ID (1-16)
 * Returns the exact card layout from the corresponding image
 *
 * @param cardId - Card ID from 1-16
 * @returns Authentic card matching the image
 */
export function generatePredefinedCard(cardId: number): Card {
  const card = getAuthenticCard(cardId);

  if (!card) {
    throw new Error(`Card ID ${cardId} not found. Must be between 1 and 16`);
  }

  return card;
}

/**
 * Generate multiple predefined cards by their IDs
 *
 * @param cardIds - Array of card IDs to generate
 * @returns Array of authentic cards in the same order
 */
export function generatePredefinedCards(cardIds: number[]): Card[] {
  return getAuthenticCards(cardIds);
}
