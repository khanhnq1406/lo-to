/**
 * Session Storage Utility
 * Manages player session persistence across page refreshes
 */

export interface PlayerSession {
  sessionId: string;
  playerId: string;
  playerName: string;
  roomId: string;
  timestamp: number;
}

const SESSION_KEY = 'loto-player-session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Save player session to localStorage
 */
export function saveSession(session: PlayerSession): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('[Session] Failed to save session:', error);
  }
}

/**
 * Get player session from localStorage
 * Returns null if session doesn't exist or has expired
 */
export function getSession(): PlayerSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    const session: PlayerSession = JSON.parse(data);

    // Check if session has expired
    const now = Date.now();
    if (now - session.timestamp > SESSION_EXPIRY) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('[Session] Failed to load session:', error);
    return null;
  }
}

/**
 * Update session with new socket ID
 */
export function updateSessionPlayerId(playerId: string): void {
  const session = getSession();
  if (!session) return;

  session.playerId = playerId;
  session.timestamp = Date.now();
  saveSession(session);
}

/**
 * Clear player session from localStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('[Session] Failed to clear session:', error);
  }
}

/**
 * Check if session exists
 */
export function hasSession(): boolean {
  return getSession() !== null;
}

// ============================================================================
// PLAYER NAME CACHE
// ============================================================================

const PLAYER_NAMES_KEY = 'loto-player-names-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface PlayerNameCache {
  [playerId: string]: {
    name: string;
    timestamp: number;
  };
}

/**
 * Cache a player's name for quick lookup
 */
export function cachePlayerName(playerId: string, name: string): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = getPlayerNameCache();
    cache[playerId] = {
      name,
      timestamp: Date.now(),
    };
    localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('[Session] Failed to cache player name:', error);
  }
}

/**
 * Get cached player name
 */
export function getCachedPlayerName(playerId: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const cache = getPlayerNameCache();
    const entry = cache[playerId];

    if (!entry) return null;

    // Check if cache entry has expired
    const now = Date.now();
    if (now - entry.timestamp > CACHE_EXPIRY) {
      // Remove expired entry
      delete cache[playerId];
      localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(cache));
      return null;
    }

    return entry.name;
  } catch (error) {
    console.error('[Session] Failed to get cached player name:', error);
    return null;
  }
}

/**
 * Get all cached player names
 */
function getPlayerNameCache(): PlayerNameCache {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(PLAYER_NAMES_KEY);
    if (!data) return {};

    return JSON.parse(data);
  } catch (error) {
    console.error('[Session] Failed to load player name cache:', error);
    return {};
  }
}

/**
 * Clear expired entries from player name cache
 */
export function cleanPlayerNameCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = getPlayerNameCache();
    const now = Date.now();
    let changed = false;

    // Remove expired entries
    Object.keys(cache).forEach((playerId) => {
      if (now - cache[playerId].timestamp > CACHE_EXPIRY) {
        delete cache[playerId];
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(PLAYER_NAMES_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('[Session] Failed to clean player name cache:', error);
  }
}
