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
