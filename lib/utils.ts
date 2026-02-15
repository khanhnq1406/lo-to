/**
 * Utility functions
 * Common helper functions for the application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format room ID for display
 * Converts room ID to uppercase and adds spaces for readability
 */
export function formatRoomId(roomId: string): string {
  return roomId.toUpperCase().match(/.{1,3}/g)?.join(' ') || roomId.toUpperCase();
}

/**
 * Validate room ID format
 * Room IDs should be 6 characters (alphanumeric)
 */
export function isValidRoomId(roomId: string): boolean {
  return /^[A-Za-z0-9]{6}$/.test(roomId);
}

/**
 * Validate player name
 * Names should be 1-20 characters
 */
export function isValidPlayerName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 20;
}
