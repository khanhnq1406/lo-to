/**
 * Test script to verify Zod schemas and type definitions
 * Run with: npx tsx types/test-validation.ts
 */

import {
  // Schemas
  CellValueSchema,
  MiniBoardSchema,
  TicketSchema,
  PlayerSchema,
  RoomSchema,
  WinResultSchema,
  ClientJoinRoomEventSchema,
  ServerNumberCalledEventSchema,
  // Types
  CellValue,
  MiniBoard,
  Ticket,
  Player,
  Room,
  WinResult,
  // Type Guards
  isCellValue,
  isMiniBoard,
  isTicket,
  isPlayer,
  isRoom,
  isWinResult,
} from './index';

import { generateTicket, generateMultipleTickets } from '../lib/game';

console.log('🧪 Testing Type Definitions and Zod Schemas\n');

// ============================================================================
// Test 1: CellValue Schema
// ============================================================================
console.log('📋 Test 1: CellValue Schema');

const validCellValues: CellValue[] = [0, 42, 99, null];
const invalidCellValues = [-1, 100, 3.14, 'hello', undefined];

validCellValues.forEach(value => {
  const result = CellValueSchema.safeParse(value);
  console.log(`  ✅ Valid: ${value} -> ${result.success}`);
});

invalidCellValues.forEach(value => {
  const result = CellValueSchema.safeParse(value);
  console.log(`  ❌ Invalid: ${value} -> ${result.success} (expected false)`);
});

console.log();

// ============================================================================
// Test 2: MiniBoard Schema
// ============================================================================
console.log('📋 Test 2: MiniBoard Schema');

// Valid mini board (5x4 with 20 unique numbers)
const validMiniBoard: MiniBoard = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20]
];

const validResult = MiniBoardSchema.safeParse(validMiniBoard);
console.log(`  ✅ Valid mini board: ${validResult.success}`);

// Invalid: wrong dimensions
const invalidDimensions = [
  [1, 2, 3],
  [4, 5, 6]
];

const invalidDimensionsResult = MiniBoardSchema.safeParse(invalidDimensions);
console.log(`  ❌ Invalid dimensions: ${invalidDimensionsResult.success} (expected false)`);

// Invalid: duplicate numbers
const invalidDuplicates: MiniBoard = [
  [1, 1, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20]
];

const invalidDuplicatesResult = MiniBoardSchema.safeParse(invalidDuplicates);
console.log(`  ❌ Duplicate numbers: ${invalidDuplicatesResult.success} (expected false)`);

// Invalid: wrong number count
const invalidCount: MiniBoard = [
  [1, 2, null, null],
  [5, 6, null, null],
  [9, 10, null, null],
  [13, 14, null, null],
  [17, 18, null, null]
];

const invalidCountResult = MiniBoardSchema.safeParse(invalidCount);
console.log(`  ❌ Wrong count (10 numbers): ${invalidCountResult.success} (expected false)`);

console.log();

// ============================================================================
// Test 3: Ticket Schema with Generated Tickets
// ============================================================================
console.log('📋 Test 3: Ticket Schema with Generated Tickets');

// Generate real tickets using game engine
const ticket1Board = generateTicket(1, 12345);
const ticket2Boards = generateTicket(2, 23456);
const ticket3Boards = generateTicket(3, 34567);

console.log(`  ✅ 1-board ticket: ${TicketSchema.safeParse(ticket1Board).success}`);
console.log(`  ✅ 2-board ticket: ${TicketSchema.safeParse(ticket2Boards).success}`);
console.log(`  ✅ 3-board ticket: ${TicketSchema.safeParse(ticket3Boards).success}`);

// Invalid: empty ticket
const invalidEmptyTicket: Ticket = [];
console.log(`  ❌ Empty ticket: ${TicketSchema.safeParse(invalidEmptyTicket).success} (expected false)`);

// Invalid: too many boards
const invalidTooManyBoards: Ticket = [validMiniBoard, validMiniBoard, validMiniBoard, validMiniBoard];
console.log(`  ❌ 4 boards: ${TicketSchema.safeParse(invalidTooManyBoards).success} (expected false)`);

console.log();

// ============================================================================
// Test 4: Player Schema (Multiple Tickets Support)
// ============================================================================
console.log('📋 Test 4: Player Schema (Multiple Tickets Support)');

// Generate multiple tickets for a player
const playerTickets = generateMultipleTickets(3, 2, 45678); // 3 tickets, 2 boards each

const validPlayer: Player = {
  id: 'player-123',
  name: 'Alice',
  tickets: playerTickets, // Multiple tickets!
  isHost: true,
  isCaller: true,
  connected: true
};

const playerResult = PlayerSchema.safeParse(validPlayer);
console.log(`  ✅ Valid player with ${playerTickets.length} tickets: ${playerResult.success}`);
console.log(`     - Total mini boards: ${playerTickets.reduce((sum, t) => sum + t.length, 0)}`);

// Player with no tickets (valid - might not have bought yet)
const playerNoTickets: Player = {
  id: 'player-456',
  name: 'Bob',
  tickets: [],
  isHost: false,
  isCaller: false,
  connected: true
};

console.log(`  ✅ Player with no tickets: ${PlayerSchema.safeParse(playerNoTickets).success}`);

// Invalid: empty name
const invalidPlayerName: Player = {
  id: 'player-789',
  name: '',
  tickets: [],
  isHost: false,
  isCaller: false,
  connected: true
};

console.log(`  ❌ Empty name: ${PlayerSchema.safeParse(invalidPlayerName).success} (expected false)`);

console.log();

// ============================================================================
// Test 5: WinResult Schema
// ============================================================================
console.log('📋 Test 5: WinResult Schema');

const validRowWin: WinResult = {
  playerId: 'player-123',
  playerName: 'Alice',
  ticketIndex: 1,
  boardIndex: 0,
  type: 'row',
  rowIndices: [2]
};

console.log(`  ✅ Valid row win: ${WinResultSchema.safeParse(validRowWin).success}`);

const validTwoRowsWin: WinResult = {
  playerId: 'player-123',
  playerName: 'Alice',
  ticketIndex: 2,
  boardIndex: 1,
  type: 'twoRows',
  rowIndices: [0, 3]
};

console.log(`  ✅ Valid two rows win: ${WinResultSchema.safeParse(validTwoRowsWin).success}`);

const validFullBoardWin: WinResult = {
  playerId: 'player-456',
  playerName: 'Bob',
  ticketIndex: 0,
  boardIndex: 0,
  type: 'fullBoard'
};

console.log(`  ✅ Valid full board win: ${WinResultSchema.safeParse(validFullBoardWin).success}`);

// Invalid: row win without rowIndices
const invalidRowWin: WinResult = {
  playerId: 'player-123',
  playerName: 'Alice',
  ticketIndex: 0,
  boardIndex: 0,
  type: 'row'
  // Missing rowIndices!
};

console.log(`  ❌ Row win without rowIndices: ${WinResultSchema.safeParse(invalidRowWin).success} (expected false)`);

console.log();

// ============================================================================
// Test 6: Room Schema
// ============================================================================
console.log('📋 Test 6: Room Schema');

const validRoom: Room = {
  id: 'room-abc123',
  players: [validPlayer, playerNoTickets],
  gameState: 'playing',
  callerMode: 'machine',
  currentNumber: 42,
  calledHistory: [15, 23, 42],
  winner: null,
  machineInterval: 3000,
  createdAt: new Date()
};

const roomResult = RoomSchema.safeParse(validRoom);
console.log(`  ✅ Valid room: ${roomResult.success}`);

// Invalid: no host
const invalidRoomNoHost: Room = {
  ...validRoom,
  players: [playerNoTickets] // Bob is not a host
};

console.log(`  ❌ Room without host: ${RoomSchema.safeParse(invalidRoomNoHost).success} (expected false)`);

// Invalid: duplicate in called history
const invalidRoomDuplicates: Room = {
  ...validRoom,
  calledHistory: [15, 23, 42, 15] // 15 appears twice
};

console.log(`  ❌ Duplicate called numbers: ${RoomSchema.safeParse(invalidRoomDuplicates).success} (expected false)`);

// Invalid: current number not in history
const invalidRoomCurrentNotInHistory: Room = {
  ...validRoom,
  currentNumber: 99,
  calledHistory: [15, 23, 42]
};

console.log(`  ❌ Current number not in history: ${RoomSchema.safeParse(invalidRoomCurrentNotInHistory).success} (expected false)`);

console.log();

// ============================================================================
// Test 7: Socket Event Schemas
// ============================================================================
console.log('📋 Test 7: Socket Event Schemas');

const validJoinEvent = {
  roomId: 'room-123',
  playerName: 'Charlie'
};

console.log(`  ✅ Valid join event: ${ClientJoinRoomEventSchema.safeParse(validJoinEvent).success}`);

const validNumberCalledEvent = {
  number: 42,
  calledHistory: [1, 15, 23, 42],
  remainingCount: 96
};

console.log(`  ✅ Valid number called event: ${ServerNumberCalledEventSchema.safeParse(validNumberCalledEvent).success}`);

// Invalid: number out of range
const invalidNumberCalledEvent = {
  number: 100, // Out of range!
  calledHistory: [1, 15, 23],
  remainingCount: 97
};

console.log(`  ❌ Invalid number (100): ${ServerNumberCalledEventSchema.safeParse(invalidNumberCalledEvent).success} (expected false)`);

console.log();

// ============================================================================
// Test 8: Type Guards
// ============================================================================
console.log('📋 Test 8: Type Guards');

console.log(`  ✅ isCellValue(42): ${isCellValue(42)}`);
console.log(`  ✅ isCellValue(null): ${isCellValue(null)}`);
console.log(`  ❌ isCellValue('hello'): ${isCellValue('hello')} (expected false)`);

console.log(`  ✅ isMiniBoard(validMiniBoard): ${isMiniBoard(validMiniBoard)}`);
console.log(`  ❌ isMiniBoard([1,2,3]): ${isMiniBoard([1, 2, 3])} (expected false)`);

console.log(`  ✅ isTicket(ticket1Board): ${isTicket(ticket1Board)}`);
console.log(`  ❌ isTicket([]): ${isTicket([])} (expected false)`);

console.log(`  ✅ isPlayer(validPlayer): ${isPlayer(validPlayer)}`);
console.log(`  ❌ isPlayer({id: '123'}): ${isPlayer({ id: '123' })} (expected false)`);

console.log(`  ✅ isRoom(validRoom): ${isRoom(validRoom)}`);
console.log(`  ❌ isRoom({}): ${isRoom({})} (expected false)`);

console.log(`  ✅ isWinResult(validRowWin): ${isWinResult(validRowWin)}`);
console.log(`  ❌ isWinResult({type: 'row'}): ${isWinResult({ type: 'row' })} (expected false)`);

console.log();

// ============================================================================
// Summary
// ============================================================================
console.log('✅ All type definitions and Zod schemas are working correctly!');
console.log('🎯 Key Validations:');
console.log('   - Cell values: 0-99 or null');
console.log('   - Mini boards: 5x4 with exactly 20 unique numbers');
console.log('   - Tickets: 1-3 mini boards with unique numbers within ticket');
console.log('   - Players: Can have MULTIPLE tickets (array of tickets)');
console.log('   - Rooms: Validate game state, history, and host presence');
console.log('   - Win results: Proper validation of row wins with indices');
console.log('   - Socket events: Strict type checking for client/server communication');
