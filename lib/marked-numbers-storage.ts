/**
 * Marked Numbers Storage Utility
 * Manages persistence of manually marked numbers across page refreshes
 */

const MARKED_NUMBERS_KEY = 'loto-marked-numbers';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface MarkedNumbersData {
  [roomId: string]: {
    [cardKey: string]: {
      markedCells?: Set<string>; // For CardGrid (row-col format)
      markedNumbers?: Set<number>; // For PlayableCardImage
      timestamp: number;
    };
  };
}

/**
 * Get all marked numbers from localStorage
 */
function getAllMarkedNumbers(): MarkedNumbersData {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(MARKED_NUMBERS_KEY);
    if (!data) return {};

    const parsed = JSON.parse(data);

    // Convert arrays back to Sets
    const result: MarkedNumbersData = {};
    Object.keys(parsed).forEach((roomId) => {
      result[roomId] = {};
      Object.keys(parsed[roomId]).forEach((cardKey) => {
        const entry = parsed[roomId][cardKey];
        result[roomId][cardKey] = {
          markedCells: entry.markedCells ? new Set(entry.markedCells) : undefined,
          markedNumbers: entry.markedNumbers ? new Set(entry.markedNumbers) : undefined,
          timestamp: entry.timestamp,
        };
      });
    });

    return result;
  } catch (error) {
    console.error('[MarkedNumbers] Failed to load marked numbers:', error);
    return {};
  }
}

/**
 * Save all marked numbers to localStorage
 */
function saveAllMarkedNumbers(data: MarkedNumbersData): void {
  if (typeof window === 'undefined') return;

  try {
    // Convert Sets to arrays for JSON serialization
    const toSave: any = {};
    Object.keys(data).forEach((roomId) => {
      toSave[roomId] = {};
      Object.keys(data[roomId]).forEach((cardKey) => {
        const entry = data[roomId][cardKey];
        toSave[roomId][cardKey] = {
          markedCells: entry.markedCells ? Array.from(entry.markedCells) : undefined,
          markedNumbers: entry.markedNumbers ? Array.from(entry.markedNumbers) : undefined,
          timestamp: entry.timestamp,
        };
      });
    });

    localStorage.setItem(MARKED_NUMBERS_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('[MarkedNumbers] Failed to save marked numbers:', error);
  }
}

/**
 * Get marked cells for CardGrid component
 */
export function getMarkedCells(roomId: string, cardIndex: number): Set<string> {
  const allData = getAllMarkedNumbers();
  const roomData = allData[roomId];
  if (!roomData) return new Set();

  const cardKey = `card-${cardIndex}`;
  const cardData = roomData[cardKey];
  if (!cardData) return new Set();

  // Check if data has expired
  const now = Date.now();
  if (now - cardData.timestamp > STORAGE_EXPIRY) {
    return new Set();
  }

  return cardData.markedCells || new Set();
}

/**
 * Save marked cells for CardGrid component
 */
export function saveMarkedCells(
  roomId: string,
  cardIndex: number,
  markedCells: Set<string>
): void {
  const allData = getAllMarkedNumbers();

  if (!allData[roomId]) {
    allData[roomId] = {};
  }

  const cardKey = `card-${cardIndex}`;
  allData[roomId][cardKey] = {
    markedCells,
    timestamp: Date.now(),
  };

  saveAllMarkedNumbers(allData);
}

/**
 * Get marked numbers for PlayableCardImage component
 */
export function getMarkedNumbers(roomId: string, cardId: number): Set<number> {
  const allData = getAllMarkedNumbers();
  const roomData = allData[roomId];
  if (!roomData) return new Set();

  const cardKey = `playable-${cardId}`;
  const cardData = roomData[cardKey];
  if (!cardData) return new Set();

  // Check if data has expired
  const now = Date.now();
  if (now - cardData.timestamp > STORAGE_EXPIRY) {
    return new Set();
  }

  return cardData.markedNumbers || new Set();
}

/**
 * Save marked numbers for PlayableCardImage component
 */
export function saveMarkedNumbers(
  roomId: string,
  cardId: number,
  markedNumbers: Set<number>
): void {
  const allData = getAllMarkedNumbers();

  if (!allData[roomId]) {
    allData[roomId] = {};
  }

  const cardKey = `playable-${cardId}`;
  allData[roomId][cardKey] = {
    markedNumbers,
    timestamp: Date.now(),
  };

  saveAllMarkedNumbers(allData);
}

/**
 * Clear marked numbers for a specific room
 */
export function clearMarkedNumbersForRoom(roomId: string): void {
  const allData = getAllMarkedNumbers();
  delete allData[roomId];
  saveAllMarkedNumbers(allData);
}

/**
 * Clear all marked numbers
 */
export function clearAllMarkedNumbers(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(MARKED_NUMBERS_KEY);
  } catch (error) {
    console.error('[MarkedNumbers] Failed to clear marked numbers:', error);
  }
}

/**
 * Clean expired entries from storage
 */
export function cleanExpiredMarkedNumbers(): void {
  if (typeof window === 'undefined') return;

  try {
    const allData = getAllMarkedNumbers();
    const now = Date.now();
    let changed = false;

    // Remove expired entries
    Object.keys(allData).forEach((roomId) => {
      Object.keys(allData[roomId]).forEach((cardKey) => {
        if (now - allData[roomId][cardKey].timestamp > STORAGE_EXPIRY) {
          delete allData[roomId][cardKey];
          changed = true;
        }
      });

      // Remove empty rooms
      if (Object.keys(allData[roomId]).length === 0) {
        delete allData[roomId];
        changed = true;
      }
    });

    if (changed) {
      saveAllMarkedNumbers(allData);
    }
  } catch (error) {
    console.error('[MarkedNumbers] Failed to clean expired entries:', error);
  }
}
