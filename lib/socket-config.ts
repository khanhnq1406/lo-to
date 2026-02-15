/**
 * Socket.io Client Configuration
 * Handles connection URL resolution for different environments
 */

/**
 * Get Socket.io server URL based on environment
 * @returns Socket.io server URL
 */
export function getSocketUrl(): string {
  // Server-side: return empty string (not used)
  if (typeof window === 'undefined') {
    return '';
  }

  // Development: use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production: use environment variable or fallback to current origin
  return process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
}

/**
 * Socket.io client connection options
 */
export const socketOptions = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
  autoConnect: true,
};
