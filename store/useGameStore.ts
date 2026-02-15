/**
 * Vietnamese Lô Tô Game - Zustand State Management Store
 * Global state management for client-side game state
 *
 * FEATURES:
 * - Room state management (players, game state, called numbers)
 * - Current player state (ID, cards, roles)
 * - UI preferences (dark mode, sound)
 * - Connection status and error handling
 * - Derived selectors for performance optimization
 * - localStorage persistence for user preferences
 *
 * USAGE:
 * ```tsx
 * // Subscribe to specific state
 * const room = useGameStore(state => state.room);
 * const darkMode = useGameStore(state => state.darkMode);
 *
 * // Use actions
 * const setRoom = useGameStore(state => state.setRoom);
 * const toggleDarkMode = useGameStore(state => state.toggleDarkMode);
 *
 * // Use derived selectors
 * const currentPlayer = useGameStore(state => state.getCurrentPlayer());
 * const isHost = useGameStore(state => state.isHost());
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { Room, Player, WinResult, GameState, Card } from '@/types';

// ============================================================================
// STORE INTERFACE
// ============================================================================

/**
 * Game store state and actions
 */
interface GameStore {
  // ===========================
  // STATE
  // ===========================

  /** Current room state (null if not in a room) */
  room: Room | null;

  /** Current player's socket ID */
  currentPlayerId: string | null;

  /** Current player's cards (stored directly to avoid reference issues) */
  playerCards: Card[];

  /** Dark mode enabled */
  darkMode: boolean;

  /** Sound effects enabled */
  soundEnabled: boolean;

  /** Manual marking mode (false = auto-mark, true = manual-mark)
   * @deprecated Now controlled by room host via room.manualMarkingMode
   * Kept for backward compatibility only
   */
  manualMarkingMode: boolean;

  /** Is currently connecting to server */
  connecting: boolean;

  /** Current error message (null if no error) */
  error: string | null;

  // ===========================
  // ROOM ACTIONS
  // ===========================

  /**
   * Set the entire room state
   * Called when receiving room updates from server
   */
  setRoom: (room: Room | null) => void;

  /**
   * Add a player to the room
   */
  addPlayer: (player: Player) => void;

  /**
   * Remove a player from the room
   */
  removePlayer: (playerId: string) => void;

  /**
   * Update game state
   */
  setGameState: (state: GameState) => void;

  /**
   * Add a number to the called history
   */
  addCalledNumber: (number: number) => void;

  /**
   * Set the current number being called
   */
  setCurrentNumber: (number: number | null) => void;

  /**
   * Set the winner
   */
  setWinner: (winner: WinResult | null) => void;

  /**
   * Update a specific player in the room
   */
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;

  // ===========================
  // PLAYER ACTIONS
  // ===========================

  /**
   * Set current player ID
   */
  setCurrentPlayerId: (playerId: string | null) => void;

  /**
   * Set current player's cards
   */
  setPlayerCards: (cards: Card[]) => void;

  // ===========================
  // UI ACTIONS
  // ===========================

  /**
   * Toggle dark mode
   */
  toggleDarkMode: () => void;

  /**
   * Set dark mode explicitly
   */
  setDarkMode: (enabled: boolean) => void;

  /**
   * Toggle sound
   */
  toggleSound: () => void;

  /**
   * Set sound enabled explicitly
   */
  setSoundEnabled: (enabled: boolean) => void;

  /**
   * Toggle manual marking mode
   */
  toggleManualMarkingMode: () => void;

  /**
   * Set manual marking mode explicitly
   */
  setManualMarkingMode: (enabled: boolean) => void;

  /**
   * Set connecting state
   */
  setConnecting: (connecting: boolean) => void;

  /**
   * Set error message
   */
  setError: (message: string) => void;

  /**
   * Clear error message
   */
  clearError: () => void;

  // ===========================
  // RESET
  // ===========================

  /**
   * Reset store to initial state (except persisted preferences)
   */
  reset: () => void;

  // ===========================
  // DERIVED SELECTORS
  // ===========================

  /**
   * Get current player object
   */
  getCurrentPlayer: () => Player | null;

  /**
   * Get a specific player by ID
   */
  getPlayer: (playerId: string) => Player | null;

  /**
   * Check if current player is the host
   */
  isHost: () => boolean;

  /**
   * Check if current player is the caller
   */
  isCaller: () => boolean;

  /**
   * Get remaining uncalled numbers (1-90)
   */
  getRemainingNumbers: () => number[];

  /**
   * Get count of remaining numbers
   */
  getRemainingCount: () => number;

  /**
   * Get selected cards map
   */
  getSelectedCards: () => Record<number, string>;

  /**
   * Get current player's selected card ID
   */
  getMySelectedCardId: () => number | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  room: null,
  currentPlayerId: null,
  playerCards: [],
  connecting: false,
  error: null,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

/**
 * Main game store with persisted preferences
 * Dark mode and sound settings are persisted to localStorage
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,
      darkMode: false,
      soundEnabled: true,
      manualMarkingMode: true, // Default but not used (room.manualMarkingMode is the source of truth)

      // ===========================
      // ROOM ACTIONS
      // ===========================

      setRoom: (room) => {
        const { currentPlayerId } = get();

        // Extract player cards when room updates
        let playerCards: Card[] = [];
        if (room && currentPlayerId) {
          const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
          playerCards = currentPlayer?.tickets || [];
        }

        set({ room, playerCards });
      },

      addPlayer: (player) => {
        const { room } = get();
        if (!room) return;

        // Check if player already exists
        const existingIndex = room.players.findIndex((p) => p.id === player.id);

        if (existingIndex >= 0) {
          // Update existing player
          const updatedPlayers = [...room.players];
          updatedPlayers[existingIndex] = player;
          set({
            room: {
              ...room,
              players: updatedPlayers,
            },
          });
        } else {
          // Add new player
          set({
            room: {
              ...room,
              players: [...room.players, player],
            },
          });
        }
      },

      removePlayer: (playerId) => {
        const { room } = get();
        if (!room) return;

        set({
          room: {
            ...room,
            players: room.players.filter((p) => p.id !== playerId),
          },
        });
      },

      setGameState: (gameState) => {
        const { room } = get();
        if (!room) return;

        set({
          room: {
            ...room,
            gameState,
          },
        });
      },

      addCalledNumber: (number) => {
        const { room } = get();
        if (!room) return;

        // Don't add duplicates
        if (room.calledHistory.includes(number)) return;

        set({
          room: {
            ...room,
            calledHistory: [...room.calledHistory, number],
            currentNumber: number,
          },
        });
      },

      setCurrentNumber: (number) => {
        const { room } = get();
        if (!room) return;

        set({
          room: {
            ...room,
            currentNumber: number,
          },
        });
      },

      setWinner: (winner) => {
        const { room } = get();
        if (!room) return;

        set({
          room: {
            ...room,
            winner,
            gameState: 'finished',
          },
        });
      },

      updatePlayer: (playerId, updates) => {
        const { room, currentPlayerId } = get();
        if (!room) return;

        const playerIndex = room.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1) return;

        const updatedPlayers = [...room.players];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          ...updates,
        };

        // Update playerCards if this is the current player and tickets changed
        let playerCards = get().playerCards;
        if (playerId === currentPlayerId && updates.tickets) {
          playerCards = updates.tickets;
        }

        set({
          room: {
            ...room,
            players: updatedPlayers,
          },
          playerCards,
        });
      },

      // ===========================
      // PLAYER ACTIONS
      // ===========================

      setCurrentPlayerId: (playerId) => {
        set({ currentPlayerId: playerId });
      },

      setPlayerCards: (cards) => {
        const { room, currentPlayerId } = get();
        if (!room || !currentPlayerId) return;

        const playerIndex = room.players.findIndex((p) => p.id === currentPlayerId);
        if (playerIndex === -1) return;

        const updatedPlayers = [...room.players];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          tickets: cards,
        };

        set({
          room: {
            ...room,
            players: updatedPlayers,
          },
          playerCards: cards, // Store directly in state
        });
      },

      // ===========================
      // UI ACTIONS
      // ===========================

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      setDarkMode: (enabled) => {
        set({ darkMode: enabled });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      setSoundEnabled: (enabled) => {
        set({ soundEnabled: enabled });
      },

      toggleManualMarkingMode: () => {
        set((state) => ({ manualMarkingMode: !state.manualMarkingMode }));
      },

      setManualMarkingMode: (enabled) => {
        set({ manualMarkingMode: enabled });
      },

      setConnecting: (connecting) => {
        set({ connecting });
      },

      setError: (message) => {
        set({ error: message });
      },

      clearError: () => {
        set({ error: null });
      },

      // ===========================
      // RESET
      // ===========================

      reset: () => {
        // Reset everything except persisted preferences (darkMode, soundEnabled)
        set((state) => ({
          ...initialState,
          darkMode: state.darkMode,
          soundEnabled: state.soundEnabled,
        }));
      },

      // ===========================
      // DERIVED SELECTORS
      // ===========================

      getCurrentPlayer: () => {
        const { room, currentPlayerId } = get();
        if (!room || !currentPlayerId) return null;

        return room.players.find((p) => p.id === currentPlayerId) || null;
      },

      getPlayer: (playerId) => {
        const { room } = get();
        if (!room) return null;

        return room.players.find((p) => p.id === playerId) || null;
      },

      isHost: () => {
        const { room, currentPlayerId } = get();
        if (!room || !currentPlayerId) return false;

        const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
        return currentPlayer?.isHost || false;
      },

      isCaller: () => {
        const { room, currentPlayerId } = get();
        if (!room || !currentPlayerId) return false;

        const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
        return currentPlayer?.isCaller || false;
      },

      getRemainingNumbers: () => {
        const { room } = get();
        if (!room) {
          // Return all numbers 1-90 if no room
          return Array.from({ length: 90 }, (_, i) => i + 1);
        }

        const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
        return allNumbers.filter((num) => !room.calledHistory.includes(num));
      },

      getRemainingCount: () => {
        const { room } = get();
        if (!room) return 90;

        return 90 - room.calledHistory.length;
      },

      getSelectedCards: () => {
        const { room } = get();
        if (!room) return {};
        return room.selectedCards || {};
      },

      getMySelectedCardId: () => {
        const { room, currentPlayerId } = get();
        if (!room || !currentPlayerId) return null;

        const selectedCards = room.selectedCards || {};
        const entry = Object.entries(selectedCards).find(
          ([_, playerId]) => playerId === currentPlayerId
        );

        return entry ? parseInt(entry[0], 10) : null;
      },
    }),
    {
      name: 'loto-game-preferences', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist UI preferences (not game state)
      // Note: manualMarkingMode is now controlled by room host, not persisted locally
      partialize: (state) => ({
        darkMode: state.darkMode,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);

// ============================================================================
// SELECTOR HOOKS (OPTIMIZED)
// ============================================================================

/**
 * Optimized selector hooks for common use cases
 * Use these instead of accessing store directly for better performance
 */

/**
 * Get room state
 */
export const useRoom = () => useGameStore((state) => state.room);

/**
 * Get current player ID
 */
export const useCurrentPlayerId = () => useGameStore((state) => state.currentPlayerId);

/**
 * Get current player object
 */
export const useCurrentPlayer = () => useGameStore((state) => state.getCurrentPlayer());

/**
 * Get if current player is host
 */
export const useIsHost = () => useGameStore((state) => state.isHost());

/**
 * Get if current player is caller
 */
export const useIsCaller = () => useGameStore((state) => state.isCaller());

/**
 * Get current player's cards
 * Reads directly from state to avoid reference issues
 */
export const usePlayerCards = () => useGameStore((state) => state.playerCards);

/**
 * Get game state
 */
export const useGameState = () => useGameStore((state) => state.room?.gameState || 'waiting');

/**
 * Get called history
 * Uses shallow comparison to avoid reference issues
 */
export const useCalledHistory = () =>
  useGameStore(
    useShallow((state) => {
      if (!state.room) return [];
      return state.room.calledHistory;
    })
  );

/**
 * Get current number
 */
export const useCurrentNumber = () => useGameStore((state) => state.room?.currentNumber || null);

/**
 * Get remaining numbers
 * DEPRECATED: Use useMemo in component instead to avoid infinite loops
 * This should only be used for display purposes, not for triggering effects
 */
export const useRemainingNumbers = () =>
  useGameStore(
    useShallow((state) => {
      const room = state.room;
      if (!room) {
        return Array.from({ length: 90 }, (_, i) => i + 1);
      }
      const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      return allNumbers.filter((num) => !room.calledHistory.includes(num));
    })
  );

/**
 * Get remaining count
 */
export const useRemainingCount = () => useGameStore((state) => state.getRemainingCount());

/**
 * Get players list
 * Uses shallow comparison to avoid reference issues
 */
export const usePlayers = () =>
  useGameStore(
    useShallow((state) => {
      if (!state.room) return [];
      return state.room.players;
    })
  );

/**
 * Get winner
 */
export const useWinner = () => useGameStore((state) => state.room?.winner || null);

/**
 * Get caller mode
 */
export const useCallerMode = () => useGameStore((state) => state.room?.callerMode || 'machine');

/**
 * Get machine interval
 */
export const useMachineInterval = () => useGameStore((state) => state.room?.machineInterval || 3000);

/**
 * Get dark mode
 */
export const useDarkMode = () => useGameStore((state) => state.darkMode);

/**
 * Get sound enabled
 */
export const useSoundEnabled = () => useGameStore((state) => state.soundEnabled);

/**
 * Get connecting state
 */
export const useConnecting = () => useGameStore((state) => state.connecting);

/**
 * Get error
 */
export const useError = () => useGameStore((state) => state.error);

/**
 * Get room ID
 */
export const useRoomId = () => useGameStore((state) => state.room?.id || null);

/**
 * Get selected cards map
 */
export const useSelectedCards = () =>
  useGameStore(
    useShallow((state) => {
      if (!state.room) return {};
      return state.room.selectedCards || {};
    })
  );

/**
 * Get current player's selected card ID
 */
export const useMySelectedCardId = () => useGameStore((state) => state.getMySelectedCardId());

/**
 * Get manual marking mode
 */
export const useManualMarkingMode = () => useGameStore((state) => state.manualMarkingMode);

// ============================================================================
// ACTION HOOKS
// ============================================================================

/**
 * Get store actions (doesn't cause rerenders)
 */
export const useGameActions = () => ({
  setRoom: useGameStore.getState().setRoom,
  addPlayer: useGameStore.getState().addPlayer,
  removePlayer: useGameStore.getState().removePlayer,
  setGameState: useGameStore.getState().setGameState,
  addCalledNumber: useGameStore.getState().addCalledNumber,
  setCurrentNumber: useGameStore.getState().setCurrentNumber,
  setWinner: useGameStore.getState().setWinner,
  updatePlayer: useGameStore.getState().updatePlayer,
  setCurrentPlayerId: useGameStore.getState().setCurrentPlayerId,
  setPlayerCards: useGameStore.getState().setPlayerCards,
  toggleDarkMode: useGameStore.getState().toggleDarkMode,
  setDarkMode: useGameStore.getState().setDarkMode,
  toggleSound: useGameStore.getState().toggleSound,
  setSoundEnabled: useGameStore.getState().setSoundEnabled,
  setConnecting: useGameStore.getState().setConnecting,
  setError: useGameStore.getState().setError,
  clearError: useGameStore.getState().clearError,
  reset: useGameStore.getState().reset,
});

// ============================================================================
// EXPORTS
// ============================================================================

export default useGameStore;
