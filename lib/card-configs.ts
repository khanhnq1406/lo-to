/**
 * Card Configuration - Predefined 16 cards with 8 colors
 * Maps sample images (01.jpg - 16.jpg) to color categories
 * Each color is assigned to exactly 2 cards
 *
 * Color mappings based on actual card images:
 * - Cards 1-2:  RGB(236,125,151) = #EC7D97 (Pink-Red)
 * - Cards 3-4:  RGB(238,119,107) = #EE776B (Coral)
 * - Cards 5-6:  RGB(130,76,175)  = #824CAF (Purple)
 * - Cards 7-8:  RGB(226,131,86)  = #E28356 (Orange)
 * - Cards 9-10: RGB(215,192,81)  = #D7C051 (Yellow)
 * - Cards 11-12: RGB(130,175,108) = #82AF6C (Green)
 * - Cards 13-14: RGB(63,145,204)  = #3F91CC (Blue)
 * - Cards 15-16: RGB(154,159,73)  = #9A9F49 (Olive-Pink)
 */

export type CardColor =
  | 'red'      // Cards 1-2: Pink-Red #EC7D97
  | 'blue'     // Cards 3-4: Coral #EE776B
  | 'purple'   // Cards 5-6: Purple #824CAF
  | 'orange'   // Cards 7-8: Orange #E28356
  | 'yellow'   // Cards 9-10: Yellow #D7C051
  | 'green'    // Cards 11-12: Green #82AF6C
  | 'cyan'     // Cards 13-14: Blue #3F91CC
  | 'pink';    // Cards 15-16: Olive-Pink #9A9F49

export interface CardConfig {
  /** Card ID (1-16) */
  id: number;

  /** Image filename in /sample folder */
  imageFile: string;

  /** Color category for this card */
  color: CardColor;

  /** Display name */
  name: string;

  /** Hex color from actual image */
  hexColor: string;

  /** RGB values from actual image */
  rgb: { r: number; g: number; b: number };
}

/**
 * Predefined 16 cards with 8 colors
 * Each color appears exactly twice
 * Hex colors extracted from actual card images
 */
export const CARD_CONFIGS: CardConfig[] = [
  { id: 1, imageFile: '01.jpg', color: 'red', name: 'Card 01', hexColor: '#EC7D97', rgb: { r: 236, g: 125, b: 151 } },
  { id: 2, imageFile: '02.jpg', color: 'red', name: 'Card 02', hexColor: '#EC7D97', rgb: { r: 236, g: 125, b: 151 } },
  { id: 3, imageFile: '03.jpg', color: 'blue', name: 'Card 03', hexColor: '#EE776B', rgb: { r: 238, g: 119, b: 107 } },
  { id: 4, imageFile: '04.jpg', color: 'blue', name: 'Card 04', hexColor: '#EE776B', rgb: { r: 238, g: 119, b: 107 } },
  { id: 5, imageFile: '05.jpg', color: 'purple', name: 'Card 05', hexColor: '#824CAF', rgb: { r: 130, g: 76, b: 175 } },
  { id: 6, imageFile: '06.jpg', color: 'purple', name: 'Card 06', hexColor: '#824CAF', rgb: { r: 130, g: 76, b: 175 } },
  { id: 7, imageFile: '07.jpg', color: 'orange', name: 'Card 07', hexColor: '#E28356', rgb: { r: 226, g: 131, b: 86 } },
  { id: 8, imageFile: '08.jpg', color: 'orange', name: 'Card 08', hexColor: '#E28356', rgb: { r: 226, g: 131, b: 86 } },
  { id: 9, imageFile: '09.jpg', color: 'yellow', name: 'Card 09', hexColor: '#D7C051', rgb: { r: 215, g: 192, b: 81 } },
  { id: 10, imageFile: '10.jpg', color: 'yellow', name: 'Card 10', hexColor: '#D7C051', rgb: { r: 215, g: 192, b: 81 } },
  { id: 11, imageFile: '11.jpg', color: 'green', name: 'Card 11', hexColor: '#82AF6C', rgb: { r: 130, g: 175, b: 108 } },
  { id: 12, imageFile: '12.jpg', color: 'green', name: 'Card 12', hexColor: '#82AF6C', rgb: { r: 130, g: 175, b: 108 } },
  { id: 13, imageFile: '13.jpg', color: 'cyan', name: 'Card 13', hexColor: '#3F91CC', rgb: { r: 63, g: 145, b: 204 } },
  { id: 14, imageFile: '14.jpg', color: 'cyan', name: 'Card 14', hexColor: '#3F91CC', rgb: { r: 63, g: 145, b: 204 } },
  { id: 15, imageFile: '15.jpg', color: 'pink', name: 'Card 15', hexColor: '#9A9F49', rgb: { r: 154, g: 159, b: 73 } },
  { id: 16, imageFile: '16.jpg', color: 'pink', name: 'Card 16', hexColor: '#9A9F49', rgb: { r: 154, g: 159, b: 73 } },
];

/**
 * Actual card colors extracted from sample images
 * Used as the single source of truth for all color styling
 */
export const ACTUAL_CARD_COLORS: Record<CardColor, {
  /** Primary color (for blank cells, backgrounds) */
  primary: string;
  /** Darker shade (for borders, hover states) */
  dark: string;
  /** Lighter shade (for backgrounds, highlights) */
  light: string;
  /** Text color that contrasts well with primary */
  textOnPrimary: string;
  /** Text color for badges/labels */
  textOnLight: string;
}> = {
  red: {
    primary: '#EC7D97',    // Cards 1-2: RGB(236,125,151)
    dark: '#D05A76',       // Darker shade
    light: '#F5B3C4',      // Lighter shade
    textOnPrimary: '#fff', // White text
    textOnLight: '#8B2A4A', // Dark text
  },
  blue: {
    primary: '#EE776B',    // Cards 3-4: RGB(238,119,107)
    dark: '#D9584A',       // Darker shade
    light: '#F7B0A8',      // Lighter shade
    textOnPrimary: '#fff',
    textOnLight: '#8B2E21',
  },
  purple: {
    primary: '#824CAF',    // Cards 5-6: RGB(130,76,175)
    dark: '#6A3C8E',       // Darker shade
    light: '#B88DD4',      // Lighter shade
    textOnPrimary: '#fff',
    textOnLight: '#4A2260',
  },
  orange: {
    primary: '#E28356',    // Cards 7-8: RGB(226,131,86)
    dark: '#C86A3F',       // Darker shade
    light: '#F0B08F',      // Lighter shade
    textOnPrimary: '#fff',
    textOnLight: '#7A3A1A',
  },
  yellow: {
    primary: '#D7C051',    // Cards 9-10: RGB(215,192,81)
    dark: '#B8A13A',       // Darker shade
    light: '#E8D88A',      // Lighter shade
    textOnPrimary: '#000',
    textOnLight: '#6B5A1F',
  },
  green: {
    primary: '#82AF6C',    // Cards 11-12: RGB(130,175,108)
    dark: '#68904F',       // Darker shade
    light: '#ACCF9B',      // Lighter shade
    textOnPrimary: '#fff',
    textOnLight: '#3F5A2E',
  },
  cyan: {
    primary: '#3F91CC',    // Cards 13-14: RGB(63,145,204)
    dark: '#2C6FA3',       // Darker shade
    light: '#7BB3DD',      // Lighter shade
    textOnPrimary: '#fff',
    textOnLight: '#1A466A',
  },
  pink: {
    primary: '#9A9F49',    // Cards 15-16: RGB(154,159,73)
    dark: '#7A7F32',       // Darker shade
    light: '#BBBF77',      // Lighter shade
    textOnPrimary: '#fff',
    textOnLight: '#4A4D20',
  },
};

/**
 * Tailwind CSS class mappings (for compatibility with existing code)
 * These now use arbitrary values with actual colors
 */
export const COLOR_CLASSES: Record<CardColor, {
  border: string;
  bg: string;
  text: string;
  hover: string;
  ring: string;
}> = {
  red: {
    border: 'border-[#EC7D97]',
    bg: 'bg-[#F5B3C4]',
    text: 'text-[#8B2A4A]',
    hover: 'hover:border-[#D05A76]',
    ring: 'ring-[#EC7D97]',
  },
  blue: {
    border: 'border-[#EE776B]',
    bg: 'bg-[#F7B0A8]',
    text: 'text-[#8B2E21]',
    hover: 'hover:border-[#D9584A]',
    ring: 'ring-[#EE776B]',
  },
  purple: {
    border: 'border-[#824CAF]',
    bg: 'bg-[#B88DD4]',
    text: 'text-[#4A2260]',
    hover: 'hover:border-[#6A3C8E]',
    ring: 'ring-[#824CAF]',
  },
  orange: {
    border: 'border-[#E28356]',
    bg: 'bg-[#F0B08F]',
    text: 'text-[#7A3A1A]',
    hover: 'hover:border-[#C86A3F]',
    ring: 'ring-[#E28356]',
  },
  yellow: {
    border: 'border-[#D7C051]',
    bg: 'bg-[#E8D88A]',
    text: 'text-[#6B5A1F]',
    hover: 'hover:border-[#B8A13A]',
    ring: 'ring-[#D7C051]',
  },
  green: {
    border: 'border-[#82AF6C]',
    bg: 'bg-[#ACCF9B]',
    text: 'text-[#3F5A2E]',
    hover: 'hover:border-[#68904F]',
    ring: 'ring-[#82AF6C]',
  },
  cyan: {
    border: 'border-[#3F91CC]',
    bg: 'bg-[#7BB3DD]',
    text: 'text-[#1A466A]',
    hover: 'hover:border-[#2C6FA3]',
    ring: 'ring-[#3F91CC]',
  },
  pink: {
    border: 'border-[#9A9F49]',
    bg: 'bg-[#BBBF77]',
    text: 'text-[#4A4D20]',
    hover: 'hover:border-[#7A7F32]',
    ring: 'ring-[#9A9F49]',
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
 * Get color classes for a card (Tailwind CSS classes)
 */
export function getCardColorClasses(cardId: number) {
  const config = getCardConfig(cardId);
  if (!config) return COLOR_CLASSES.red; // Default fallback
  return COLOR_CLASSES[config.color];
}

/**
 * Get actual color values for a card (hex colors)
 */
export function getCardActualColors(cardId: number) {
  const config = getCardConfig(cardId);
  if (!config) return ACTUAL_CARD_COLORS.red; // Default fallback
  return ACTUAL_CARD_COLORS[config.color];
}

/**
 * Get blank cell color for a card (primary color from actual image)
 */
export function getBlankCellColor(cardId: number): string {
  const config = getCardConfig(cardId);
  if (!config) return ACTUAL_CARD_COLORS.red.primary;
  return ACTUAL_CARD_COLORS[config.color].primary;
}

/**
 * Get blank cell border color for a card (darker shade)
 */
export function getBlankCellBorderColor(cardId: number): string {
  const config = getCardConfig(cardId);
  if (!config) return ACTUAL_CARD_COLORS.red.dark;
  return ACTUAL_CARD_COLORS[config.color].dark;
}
