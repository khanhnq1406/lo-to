/**
 * Vietnamese Lô Tô Game - Type Definitions & Zod Schemas
 * Complete type system with runtime validation for multiplayer game
 *
 * VIETNAMESE LÔ TÔ FORMAT (9×9):
 * - Card structure: 9 rows × 9 columns = 81 cells
 * - Each card: 45 numbers (1-90) + 36 blanks
 * - Each row: exactly 5 numbers + 4 blanks
 * - Column constraints: col 0 = 1-9, col 1 = 10-19, ..., col 8 = 80-90
 * - Numbers sorted ascending within each column
 * - Win condition: Complete any horizontal row (5 numbers)
 *
 * MIGRATION FROM LEGACY FORMAT:
 * - Old: 5 rows × 4 columns = 20 cells, numbers 0-99
 * - Previous: 3 rows × 9 columns = 27 cells, numbers 1-90
 * - New: 9 rows × 9 columns = 81 cells, numbers 1-90
 * - Old: MiniBoard[] = Ticket (array of boards)
 * - New: Card = Ticket (single card)
 * - Old: Multiple win types (row, twoRows, fourCorners, fullBoard)
 * - New: Single win type (row) for authentic format
 * - Legacy types kept with @deprecated tags for backward compatibility
 */

import { z } from 'zod';

// ============================================================================
// GAME STATE TYPES
// ============================================================================

/**
 * Game states in the room lifecycle
 * - waiting: Players joining, game hasn't started yet
 * - playing: Game in progress, numbers being called
 * - finished: Game ended, winner declared
 */
export type GameState = 'waiting' | 'playing' | 'finished';

export const GameStateSchema = z.enum(['waiting', 'playing', 'finished']);

/**
 * Number calling modes
 * - machine: Auto-calls numbers at specified interval
 * - manual: Host manually calls each number
 */
export type CallerMode = 'machine' | 'manual';

export const CallerModeSchema = z.enum(['machine', 'manual']);

/**
 * Win types
 * - row: Single row complete (5 numbers) - AUTHENTIC Vietnamese Lô Tô
 *
 * @deprecated Legacy win types (kept for backward compatibility):
 * - twoRows: Two rows complete (not used in authentic format)
 * - fourCorners: All four corners marked (not used in authentic format)
 * - fullBoard: All numbers on a card called (not used in authentic format)
 */
export type WinType = 'row' | 'twoRows' | 'fourCorners' | 'fullBoard';

export const WinTypeSchema = z.enum(['row', 'twoRows', 'fourCorners', 'fullBoard']);

// ============================================================================
// BOARD TYPES
// ============================================================================

/**
 * Cell value in a card
 * - number: 1-90 (Authentic Vietnamese Lô Tô uses 90 numbers)
 * - null: Empty/blank cell
 */
export type CellValue = number | null;

export const CellValueSchema = z.union([
  z.number().int().min(1).max(90),
  z.null()
]);

/**
 * Card structure: 9 rows × 9 columns = 81 cells
 * Each card contains exactly 45 unique numbers (1-90) and 36 blanks
 * Each row has exactly 5 numbers and 4 blanks
 * Column constraints: col 0 = 1-9, col 1 = 10-19, ..., col 8 = 80-90
 * Numbers are sorted ascending within each column
 */
export type Card = CellValue[][];

export const CardSchema = z.array(
  z.array(CellValueSchema).length(9)
).length(9).refine(
  (card) => {
    // Count non-null numbers
    const numbers = card.flat().filter((cell): cell is number => cell !== null);

    // Must have exactly 45 numbers
    if (numbers.length !== 45) {
      return false;
    }

    // All numbers must be unique
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== 45) {
      return false;
    }

    // All numbers must be in valid range (1-90)
    if (!numbers.every(num => num >= 1 && num <= 90)) {
      return false;
    }

    // Each row must have exactly 5 numbers and 4 blanks
    for (const row of card) {
      const rowNumbers = row.filter((cell): cell is number => cell !== null);
      if (rowNumbers.length !== 5) {
        return false;
      }
    }

    // Validate column constraints
    for (let col = 0; col < 9; col++) {
      const minRange = col === 0 ? 1 : col * 10;
      const maxRange = col === 8 ? 90 : col * 10 + 9;

      const columnNumbers: number[] = [];
      for (let row = 0; row < 9; row++) {
        const cell = card[row][col];
        if (cell !== null) {
          // Check if number is in correct column range
          if (cell < minRange || cell > maxRange) {
            return false;
          }
          columnNumbers.push(cell);
        }
      }

      // Note: Real Vietnamese Lô Tô cards don't have sorted columns
      // Removed sorting validation to match authentic cards
    }

    return true;
  },
  { message: 'Card must be 9×9 with exactly 45 unique numbers (1-90), 5 per row, and proper column constraints' }
);

/**
 * @deprecated Use Card instead. MiniBoard is legacy from old 5×4 format.
 * Kept for backward compatibility only.
 */
export type MiniBoard = Card;

/**
 * @deprecated Use CardSchema instead. MiniBoardSchema is legacy from old 5×4 format.
 */
export const MiniBoardSchema = CardSchema;

/**
 * Ticket is an alias for Card (for compatibility)
 * In authentic Vietnamese Lô Tô, each card is independent
 * A ticket IS a card (not an array of cards)
 */
export type Ticket = Card;

export const TicketSchema = CardSchema;

// ============================================================================
// PLAYER TYPE
// ============================================================================

/**
 * Player in a game room
 * CRITICAL: Players can have MULTIPLE cards
 * Example: Player buys 3 cards = 3 independent 9×9 cards
 * Each card in the tickets array is a separate Card (9×9), not a "ticket with multiple boards"
 */
export interface Player {
  /** Unique player identifier (socket ID) */
  id: string;

  /** Player display name */
  name: string;

  /** Array of cards owned by player (can have multiple!)
   *  Each element is a Card (3×9), not an array of cards
   */
  tickets: Card[];

  /** Is this player the room host? */
  isHost: boolean;

  /** Is this player the number caller? (host or designated caller) */
  isCaller: boolean;

  /** Is player currently connected via WebSocket? */
  connected: boolean;
}

export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  tickets: z.array(CardSchema).min(0), // Can have 0 cards initially
  isHost: z.boolean(),
  isCaller: z.boolean(),
  connected: z.boolean()
});

// ============================================================================
// WIN RESULT TYPE
// ============================================================================

/**
 * Win result containing winner details and which card won
 * Used when a player achieves a winning pattern
 *
 * AUTHENTIC FORMAT (preferred):
 * - cardIndex: Index of winning card in player's tickets array
 * - rowIndex: Index of winning row (0-2)
 * - type: 'row'
 *
 * LEGACY FORMAT (backward compatible):
 * - ticketIndex: Same as cardIndex
 * - boardIndex: Index of board within ticket (old multi-board format)
 * - rowIndices: Array of winning row indices
 * - type: 'row' | 'twoRows' | 'fourCorners' | 'fullBoard'
 */
export interface WinResult {
  /** ID of winning player */
  playerId: string;

  /** Display name of winning player */
  playerName: string;

  /** Index of winning card in player's tickets array (AUTHENTIC) */
  cardIndex?: number;

  /** Index of winning row within the card 0-8 */
  rowIndex?: number;

  /** Type of win achieved */
  type: WinType;

  /** @deprecated Use cardIndex instead. ticketIndex kept for backward compatibility */
  ticketIndex?: number;

  /** @deprecated boardIndex kept for backward compatibility with old multi-board format */
  boardIndex?: number;

  /** @deprecated Use rowIndex instead. rowIndices kept for backward compatibility */
  rowIndices?: number[];
}

export const WinResultSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1),
  cardIndex: z.number().int().min(0).optional(),
  rowIndex: z.number().int().min(0).max(8).optional(),
  type: WinTypeSchema,
  // Legacy fields for backward compatibility
  ticketIndex: z.number().int().min(0).optional(),
  boardIndex: z.number().int().min(0).max(2).optional(),
  rowIndices: z.array(z.number().int().min(0).max(8)).optional()
}).refine(
  (result) => {
    // Must have either new format (cardIndex + rowIndex) or old format (ticketIndex + boardIndex)
    const hasNewFormat = result.cardIndex !== undefined || result.rowIndex !== undefined;
    const hasOldFormat = result.ticketIndex !== undefined || result.boardIndex !== undefined;

    if (!hasNewFormat && !hasOldFormat) {
      return false;
    }

    // Row and twoRows wins should include rowIndices (legacy) or rowIndex (new)
    if (result.type === 'row' || result.type === 'twoRows') {
      return (result.rowIndices !== undefined && result.rowIndices.length > 0) ||
             (result.rowIndex !== undefined);
    }

    return true;
  },
  { message: 'WinResult must have valid win indices (either new format cardIndex/rowIndex or legacy format ticketIndex/boardIndex)' }
);

// ============================================================================
// ROOM TYPE
// ============================================================================

/**
 * Game room containing all game state
 * Represents a multiplayer game session
 */
export interface Room {
  /** Unique room identifier */
  id: string;

  /** All players in the room */
  players: Player[];

  /** Current game state */
  gameState: GameState;

  /** Number calling mode (machine or manual) */
  callerMode: CallerMode;

  /** Most recently called number (null if none called yet) */
  currentNumber: number | null;

  /** History of all called numbers (1-90) */
  calledHistory: number[];

  /** Winner information (null if no winner yet) */
  winner: WinResult | null;

  /** Interval for machine mode (milliseconds between calls) */
  machineInterval: number;

  /** Room creation timestamp */
  createdAt: Date;

  /** Card selections: Map of cardId (1-16) to playerId
   * Each player can select multiple cards (up to 5)
   */
  selectedCards: Record<number, string>;

  /** Manual marking mode (false = auto-mark, true = manual-mark)
   * Set by room host, applies to all players
   */
  manualMarkingMode: boolean;
}

export const RoomSchema = z.object({
  id: z.string().min(1),
  players: z.array(PlayerSchema).max(50), // Reasonable max players
  gameState: GameStateSchema,
  callerMode: CallerModeSchema,
  currentNumber: z.number().int().min(1).max(90).nullable(),
  calledHistory: z.array(z.number().int().min(1).max(90)).max(90),
  winner: WinResultSchema.nullable(),
  machineInterval: z.number().int().min(1000).max(60000), // 1s to 60s
  createdAt: z.date(),
  selectedCards: z.record(z.string(), z.string()).optional().default({}),
  manualMarkingMode: z.boolean().default(true)
}).refine(
  (room) => {
    // Called history should not have duplicates
    const uniqueNumbers = new Set(room.calledHistory);
    if (uniqueNumbers.size !== room.calledHistory.length) {
      return false;
    }

    // Current number should be in history if game is playing/finished
    if (room.currentNumber !== null && room.gameState !== 'waiting') {
      if (!room.calledHistory.includes(room.currentNumber)) {
        return false;
      }
    }

    // Must have at least one host
    const hosts = room.players.filter(p => p.isHost);
    if (room.players.length > 0 && hosts.length === 0) {
      return false;
    }

    return true;
  },
  { message: 'Room state validation failed' }
);

// ============================================================================
// SOCKET EVENT TYPES - CLIENT TO SERVER
// ============================================================================

/**
 * Client joins a room with their name
 */
export interface ClientJoinRoomEvent {
  roomId: string;
  playerName: string;
}

export const ClientJoinRoomEventSchema = z.object({
  roomId: z.string().min(1),
  playerName: z.string().min(1).max(50)
});

/**
 * Client requests to create a new room
 */
export interface ClientCreateRoomEvent {
  playerName: string;
  callerMode: CallerMode;
  machineInterval?: number; // Optional, defaults to 3000ms
}

export const ClientCreateRoomEventSchema = z.object({
  playerName: z.string().min(1).max(50),
  callerMode: CallerModeSchema,
  machineInterval: z.number().int().min(1000).max(60000).optional()
});

/**
 * Client requests to start the game (host only)
 */
export interface ClientStartGameEvent {
  roomId: string;
}

export const ClientStartGameEventSchema = z.object({
  roomId: z.string().min(1)
});

/**
 * Caller manually calls a number (manual mode only)
 */
export interface ClientCallNumberEvent {
  roomId: string;
  number: number;
}

export const ClientCallNumberEventSchema = z.object({
  roomId: z.string().min(1),
  number: z.number().int().min(1).max(90)
});

/**
 * Player claims a win
 */
export interface ClientClaimWinEvent {
  roomId: string;
  ticketIndex: number;
  boardIndex: number;
  type: WinType;
}

export const ClientClaimWinEventSchema = z.object({
  roomId: z.string().min(1),
  ticketIndex: z.number().int().min(0),
  boardIndex: z.number().int().min(0).max(2),
  type: WinTypeSchema
});

/**
 * Player generates new cards for themselves
 */
export interface ClientGenerateTicketsEvent {
  roomId: string;
  cardCount: number; // How many cards to generate (each card is 9×9)
  /** @deprecated boardsPerTicket not used in authentic format - each card is independent */
  boardsPerTicket?: 1 | 2 | 3;
}

export const ClientGenerateTicketsEventSchema = z.object({
  roomId: z.string().min(1),
  cardCount: z.number().int().min(1).max(10), // Max 10 cards per player
  // Legacy field for backward compatibility
  boardsPerTicket: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional()
});

/**
 * Host kicks a player from the room
 */
export interface ClientKickPlayerEvent {
  roomId: string;
  playerId: string;
}

export const ClientKickPlayerEventSchema = z.object({
  roomId: z.string().min(1),
  playerId: z.string().min(1)
});

/**
 * Player leaves the room
 */
export interface ClientLeaveRoomEvent {
  roomId: string;
}

export const ClientLeaveRoomEventSchema = z.object({
  roomId: z.string().min(1)
});

/**
 * Host changes caller mode
 */
export interface ClientChangeCallerModeEvent {
  roomId: string;
  callerMode: CallerMode;
  machineInterval?: number; // Only for machine mode
}

export const ClientChangeCallerModeEventSchema = z.object({
  roomId: z.string().min(1),
  callerMode: CallerModeSchema,
  machineInterval: z.number().int().min(1000).max(60000).optional()
});

/**
 * Host changes who the caller is
 */
export interface ClientChangeCallerEvent {
  roomId: string;
  targetPlayerId: string;
}

export const ClientChangeCallerEventSchema = z.object({
  roomId: z.string().min(1),
  targetPlayerId: z.string().min(1)
});

/**
 * Player selects a card (1-16)
 */
export interface ClientSelectCardEvent {
  roomId: string;
  cardId: number; // 1-16
}

export const ClientSelectCardEventSchema = z.object({
  roomId: z.string().min(1),
  cardId: z.number().int().min(1).max(16)
});

/**
 * Player deselects a specific card
 */
export interface ClientDeselectCardEvent {
  roomId: string;
  cardId: number; // Specific card to deselect
}

export const ClientDeselectCardEventSchema = z.object({
  roomId: z.string().min(1),
  cardId: z.number().int().min(1).max(16)
});

/**
 * Client requests to reset/stop the game
 */
export interface ClientResetGameEvent {
  roomId: string;
}

export const ClientResetGameEventSchema = z.object({
  roomId: z.string().min(1)
});

/**
 * Host changes marking mode (manual/auto)
 */
export interface ClientChangeMarkingModeEvent {
  roomId: string;
  manualMarkingMode: boolean;
}

export const ClientChangeMarkingModeEventSchema = z.object({
  roomId: z.string().min(1),
  manualMarkingMode: z.boolean()
});

// ============================================================================
// SOCKET EVENT TYPES - SERVER TO CLIENT
// ============================================================================

/**
 * Server sends updated room state to all clients
 */
export interface ServerRoomUpdateEvent {
  room: SerializableRoom;
}

export const ServerRoomUpdateEventSchema = z.object({
  room: z.object({
    id: z.string(),
    players: z.array(PlayerSchema),
    gameState: GameStateSchema,
    callerMode: CallerModeSchema,
    currentNumber: z.number().nullable(),
    calledHistory: z.array(z.number()),
    winner: WinResultSchema.nullable(),
    machineInterval: z.number(),
    createdAt: z.string(),
    selectedCards: z.record(z.string(), z.string()).optional().default({}),
    manualMarkingMode: z.boolean().default(true)
  })
});

/**
 * Server confirms player joined successfully
 */
export interface ServerPlayerJoinedEvent {
  playerId: string;
  playerName: string;
  isHost: boolean;
}

export const ServerPlayerJoinedEventSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1),
  isHost: z.boolean()
});

/**
 * Server notifies a player left
 */
export interface ServerPlayerLeftEvent {
  playerId: string;
  playerName: string;
}

export const ServerPlayerLeftEventSchema = z.object({
  playerId: z.string().min(1),
  playerName: z.string().min(1)
});

/**
 * Server announces game started
 */
export interface ServerGameStartedEvent {
  roomId: string;
}

export const ServerGameStartedEventSchema = z.object({
  roomId: z.string().min(1)
});

/**
 * Server announces a new number was called
 */
export interface ServerNumberCalledEvent {
  number: number;
  calledHistory: number[];
  remainingCount: number; // How many numbers left
}

export const ServerNumberCalledEventSchema = z.object({
  number: z.number().int().min(1).max(90),
  calledHistory: z.array(z.number().int().min(1).max(90)),
  remainingCount: z.number().int().min(0).max(90)
});

/**
 * Server announces game finished with winner
 */
export interface ServerGameFinishedEvent {
  winner: WinResult;
}

export const ServerGameFinishedEventSchema = z.object({
  winner: WinResultSchema
});

/**
 * Server announces game has been reset
 */
export interface ServerGameResetEvent {
  roomId: string;
}

export const ServerGameResetEventSchema = z.object({
  roomId: z.string().min(1)
});

/**
 * Server sends error message to client
 */
export interface ServerErrorEvent {
  message: string;
  code?: string;
}

export const ServerErrorEventSchema = z.object({
  message: z.string().min(1),
  code: z.string().optional()
});

/**
 * Server confirms cards generated for player
 */
export interface ServerTicketsGeneratedEvent {
  playerId: string;
  tickets: Card[];
}

export const ServerTicketsGeneratedEventSchema = z.object({
  playerId: z.string().min(1),
  tickets: z.array(CardSchema)
});

/**
 * Server confirms caller mode changed
 */
export interface ServerCallerModeChangedEvent {
  callerMode: CallerMode;
  machineInterval?: number;
}

export const ServerCallerModeChangedEventSchema = z.object({
  callerMode: CallerModeSchema,
  machineInterval: z.number().int().min(1000).max(60000).optional()
});

/**
 * Server confirms caller changed
 */
export interface ServerCallerChangedEvent {
  oldCallerId: string;
  oldCallerName: string;
  newCallerId: string;
  newCallerName: string;
}

export const ServerCallerChangedEventSchema = z.object({
  oldCallerId: z.string().min(1),
  oldCallerName: z.string().min(1),
  newCallerId: z.string().min(1),
  newCallerName: z.string().min(1)
});

/**
 * Server confirms card selected
 */
export interface ServerCardSelectedEvent {
  cardId: number;
  playerId: string;
  playerName: string;
}

export const ServerCardSelectedEventSchema = z.object({
  cardId: z.number().int().min(1).max(16),
  playerId: z.string().min(1),
  playerName: z.string().min(1)
});

/**
 * Server confirms card deselected
 */
export interface ServerCardDeselectedEvent {
  cardId: number;
  playerId: string;
}

export const ServerCardDeselectedEventSchema = z.object({
  cardId: z.number().int().min(1).max(16),
  playerId: z.string().min(1)
});

/**
 * Server confirms marking mode changed
 */
export interface ServerMarkingModeChangedEvent {
  manualMarkingMode: boolean;
}

export const ServerMarkingModeChangedEventSchema = z.object({
  manualMarkingMode: z.boolean()
});

// ============================================================================
// SOCKET EVENT TYPE UNIONS
// ============================================================================

/**
 * All possible client-to-server events
 */
export type ClientEvent =
  | { type: 'join_room'; data: ClientJoinRoomEvent }
  | { type: 'create_room'; data: ClientCreateRoomEvent }
  | { type: 'start_game'; data: ClientStartGameEvent }
  | { type: 'call_number'; data: ClientCallNumberEvent }
  | { type: 'claim_win'; data: ClientClaimWinEvent }
  | { type: 'generate_tickets'; data: ClientGenerateTicketsEvent }
  | { type: 'kick_player'; data: ClientKickPlayerEvent }
  | { type: 'leave_room'; data: ClientLeaveRoomEvent }
  | { type: 'change_caller_mode'; data: ClientChangeCallerModeEvent }
  | { type: 'change_caller'; data: ClientChangeCallerEvent }
  | { type: 'select_card'; data: ClientSelectCardEvent }
  | { type: 'deselect_card'; data: ClientDeselectCardEvent }
  | { type: 'change_marking_mode'; data: ClientChangeMarkingModeEvent };

/**
 * All possible server-to-client events
 */
export type ServerEvent =
  | { type: 'room_update'; data: ServerRoomUpdateEvent }
  | { type: 'player_joined'; data: ServerPlayerJoinedEvent }
  | { type: 'player_left'; data: ServerPlayerLeftEvent }
  | { type: 'game_started'; data: ServerGameStartedEvent }
  | { type: 'number_called'; data: ServerNumberCalledEvent }
  | { type: 'game_finished'; data: ServerGameFinishedEvent }
  | { type: 'error'; data: ServerErrorEvent }
  | { type: 'tickets_generated'; data: ServerTicketsGeneratedEvent }
  | { type: 'caller_mode_changed'; data: ServerCallerModeChangedEvent }
  | { type: 'caller_changed'; data: ServerCallerChangedEvent }
  | { type: 'card_selected'; data: ServerCardSelectedEvent }
  | { type: 'card_deselected'; data: ServerCardDeselectedEvent }
  | { type: 'marking_mode_changed'; data: ServerMarkingModeChangedEvent };

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid CellValue
 */
export function isCellValue(value: unknown): value is CellValue {
  return CellValueSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid Card
 */
export function isCard(value: unknown): value is Card {
  return CardSchema.safeParse(value).success;
}

/**
 * @deprecated Use isCard instead
 */
export function isMiniBoard(value: unknown): value is MiniBoard {
  return CardSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid Ticket
 */
export function isTicket(value: unknown): value is Ticket {
  return TicketSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid Player
 */
export function isPlayer(value: unknown): value is Player {
  return PlayerSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid Room
 */
export function isRoom(value: unknown): value is Room {
  return RoomSchema.safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid WinResult
 */
export function isWinResult(value: unknown): value is WinResult {
  return WinResultSchema.safeParse(value).success;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Partial room for creation (before all fields are set)
 */
export type RoomCreateInput = Omit<Room, 'id' | 'players' | 'createdAt'> & {
  hostName: string;
};

/**
 * Player join input (before player is created)
 */
export type PlayerJoinInput = {
  name: string;
  roomId: string;
};

/**
 * Serializable room (for sending over network)
 * Converts Date to string
 */
export type SerializableRoom = Omit<Room, 'createdAt'> & {
  createdAt: string;
};

/**
 * Convert Room to SerializableRoom
 */
export function serializeRoom(room: Room): SerializableRoom {
  return {
    ...room,
    createdAt: room.createdAt.toISOString()
  };
}

/**
 * Convert SerializableRoom to Room
 */
export function deserializeRoom(room: SerializableRoom): Room {
  return {
    ...room,
    createdAt: new Date(room.createdAt)
  };
}
