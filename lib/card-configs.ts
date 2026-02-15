/**
 * Card Configuration - Predefined 16 cards with 8 colors
 * Maps sample images (01.jpg - 16.jpg) to color categories
 * Each color is assigned to exactly 2 cards
 */

export type CardColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'cyan';

export interface CardConfig {
  /** Card ID (1-16) */
  id: number;

  /** Image filename in /sample folder */
  imageFile: string;

  /** Color category for this card */
  color: CardColor;

  /** Display name */
  name: string;
}

/**
 * Predefined 16 cards with 8 colors
 * Each color appears exactly twice
 */
export const CARD_CONFIGS: CardConfig[] = [
  { id: 1, imageFile: '01.jpg', color: 'red', name: 'Card 01' },
  { id: 2, imageFile: '02.jpg', color: 'red', name: 'Card 02' },
  { id: 3, imageFile: '03.jpg', color: 'blue', name: 'Card 03' },
  { id: 4, imageFile: '04.jpg', color: 'blue', name: 'Card 04' },
  { id: 5, imageFile: '05.jpg', color: 'green', name: 'Card 05' },
  { id: 6, imageFile: '06.jpg', color: 'green', name: 'Card 06' },
  { id: 7, imageFile: '07.jpg', color: 'yellow', name: 'Card 07' },
  { id: 8, imageFile: '08.jpg', color: 'yellow', name: 'Card 08' },
  { id: 9, imageFile: '09.jpg', color: 'purple', name: 'Card 09' },
  { id: 10, imageFile: '10.jpg', color: 'purple', name: 'Card 10' },
  { id: 11, imageFile: '11.jpg', color: 'orange', name: 'Card 11' },
  { id: 12, imageFile: '12.jpg', color: 'orange', name: 'Card 12' },
  { id: 13, imageFile: '13.jpg', color: 'pink', name: 'Card 13' },
  { id: 14, imageFile: '14.jpg', color: 'pink', name: 'Card 14' },
  { id: 15, imageFile: '15.jpg', color: 'cyan', name: 'Card 15' },
  { id: 16, imageFile: '16.jpg', color: 'cyan', name: 'Card 16' },
];

/**
 * Color to Tailwind CSS class mappings
 */
export const COLOR_CLASSES: Record<CardColor, {
  border: string;
  bg: string;
  text: string;
  hover: string;
  ring: string;
}> = {
  red: {
    border: 'border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    hover: 'hover:border-red-600',
    ring: 'ring-red-500',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    hover: 'hover:border-blue-600',
    ring: 'ring-blue-500',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    text: 'text-green-700',
    hover: 'hover:border-green-600',
    ring: 'ring-green-500',
  },
  yellow: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    hover: 'hover:border-yellow-600',
    ring: 'ring-yellow-500',
  },
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    hover: 'hover:border-purple-600',
    ring: 'ring-purple-500',
  },
  orange: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    hover: 'hover:border-orange-600',
    ring: 'ring-orange-500',
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    hover: 'hover:border-pink-600',
    ring: 'ring-pink-500',
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    hover: 'hover:border-cyan-600',
    ring: 'ring-cyan-500',
  },
};

/**
 * Get card config by ID
 */
export function getCardConfig(cardId: number): CardConfig | undefined {
  return CARD_CONFIGS.find((c) => c.id === cardId);
}

/**
 * Get all cards by color
 */
export function getCardsByColor(color: CardColor): CardConfig[] {
  return CARD_CONFIGS.filter((c) => c.color === color);
}

/**
 * Get color classes for a card
 */
export function getCardColorClasses(cardId: number) {
  const config = getCardConfig(cardId);
  if (!config) return COLOR_CLASSES.red; // Default fallback
  return COLOR_CLASSES[config.color];
}
