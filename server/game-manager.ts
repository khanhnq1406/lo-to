/**
 * Game Manager - Game logic orchestration
 * Handles number calling (machine/manual), win detection, and game flow
 */

import {
  Room,
  Card,
  WinResult,
  CallerMode,
} from '../types/index';
import {
  generateMultipleCards,
  getRemainingNumbers,
  randomCallNumber,
  checkPlayerWin,
} from '../lib/game';

export class GameManager {
  private callingIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start game in a room
   * Validates prerequisites and initializes game state
   */
  startGame(room: Room): void {
    if (room.gameState !== 'waiting') {
      throw new Error('Game already started');
    }

    // Check if at least one player has cards
    const playersWithCards = room.players.filter((p) => p.tickets.length > 0);
    if (playersWithCards.length === 0) {
      throw new Error('At least one player must have cards to start the game');
    }

    room.gameState = 'playing';
    room.currentNumber = null;
    room.calledHistory = [];
    room.winner = null;

    // Start auto-calling if in machine mode
    if (room.callerMode === 'machine') {
      this.startMachineCalling(room);
    }
  }

  /**
   * Start machine mode auto-calling
   */
  private startMachineCalling(room: Room): void {
    if (this.callingIntervals.has(room.id)) {
      this.stopMachineCalling(room.id);
    }

    const interval = setInterval(() => {
      try {
        // Check if game is still playing
        if (room.gameState !== 'playing') {
          this.stopMachineCalling(room.id);
          return;
        }

        // Get remaining numbers
        const calledSet = new Set(room.calledHistory);
        const remaining = getRemainingNumbers(calledSet);

        // If no numbers left, stop
        if (remaining.length === 0) {
          this.stopMachineCalling(room.id);
          return;
        }

        // Call a random number
        const number = randomCallNumber(remaining);
        if (number !== null) {
          room.currentNumber = number;
          room.calledHistory.push(number);
        }
      } catch (error) {
        console.error(`Error in machine calling for room ${room.id}:`, error);
        this.stopMachineCalling(room.id);
      }
    }, room.machineInterval);

    this.callingIntervals.set(room.id, interval);
  }

  /**
   * Stop machine mode auto-calling
   */
  stopMachineCalling(roomId: string): void {
    const interval = this.callingIntervals.get(roomId);
    if (interval) {
      clearInterval(interval);
      this.callingIntervals.delete(roomId);
    }
  }

  /**
   * Manually call a number (manual mode)
   */
  callNumber(room: Room, number: number, callerId: string): void {
    if (room.gameState !== 'playing') {
      throw new Error('Game is not in progress');
    }

    if (room.callerMode !== 'manual') {
      throw new Error('Room is not in manual mode');
    }

    // Verify caller has permission
    const caller = room.players.find((p) => p.id === callerId);
    if (!caller || !caller.isCaller) {
      throw new Error('Only the caller can call numbers');
    }

    // Check if number already called
    if (room.calledHistory.includes(number)) {
      throw new Error('Number already called');
    }

    // Check if number is valid (1-90)
    if (number < 1 || number > 90) {
      throw new Error('Number must be between 1 and 90');
    }

    room.currentNumber = number;
    room.calledHistory.push(number);
  }

  /**
   * Validate a win claim
   */
  validateWinClaim(
    room: Room,
    playerId: string,
    ticketIndex: number,
    _boardIndex: number
  ): WinResult | null {
    if (room.gameState !== 'playing') {
      throw new Error('Game is not in progress');
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (ticketIndex < 0 || ticketIndex >= player.tickets.length) {
      throw new Error('Invalid ticket index');
    }

    const card = player.tickets[ticketIndex];
    const calledSet = new Set(room.calledHistory);

    // Check for row win (authentic Vietnamese Lô Tô)
    const winResult = checkPlayerWin([card], calledSet);

    if (!winResult) {
      return null;
    }

    // Add player info to win result
    return {
      playerId: player.id,
      playerName: player.name,
      cardIndex: ticketIndex,
      rowIndex: winResult.rowIndices?.[0],
      type: winResult.type,
      ticketIndex: winResult.ticketIndex,
      boardIndex: winResult.boardIndex,
      rowIndices: winResult.rowIndices,
    };
  }

  /**
   * Declare winner and end game
   */
  declareWinner(room: Room, winResult: WinResult): void {
    room.gameState = 'finished';
    room.winner = winResult;

    // Stop machine calling if active
    if (room.callerMode === 'machine') {
      this.stopMachineCalling(room.id);
    }
  }

  /**
   * Generate cards for a player
   */
  generateTickets(
    room: Room,
    playerId: string,
    cardCount: number
  ): Card[] {
    if (cardCount < 1 || cardCount > 10) {
      throw new Error('Card count must be between 1 and 10');
    }

    if (room.gameState !== 'waiting') {
      throw new Error('Cannot generate cards after game started');
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Generate cards using game engine
    const newCards = generateMultipleCards(cardCount);

    // Replace player's existing cards
    player.tickets = newCards;

    return newCards;
  }

  /**
   * Change caller mode
   */
  changeCallerMode(
    room: Room,
    hostId: string,
    callerMode: CallerMode,
    machineInterval?: number
  ): void {
    // Verify host permission
    const host = room.players.find((p) => p.id === hostId);
    if (!host || !host.isHost) {
      throw new Error('Only host can change caller mode');
    }

    // Allow changing mode only in waiting state
    if (room.gameState !== 'waiting') {
      // If game is playing, only allow changing interval for machine mode
      if (callerMode !== room.callerMode) {
        throw new Error('Cannot change caller mode after game started');
      }

      // Allow changing machine interval while playing
      if (callerMode === 'machine' && machineInterval !== undefined) {
        if (machineInterval < 1000 || machineInterval > 60000) {
          throw new Error('Machine interval must be between 1000ms and 60000ms');
        }
        room.machineInterval = machineInterval;

        // Restart machine calling with new interval
        this.stopMachineCalling(room.id);
        this.startMachineCalling(room);
      }
      return;
    }

    room.callerMode = callerMode;

    if (callerMode === 'machine' && machineInterval !== undefined) {
      if (machineInterval < 1000 || machineInterval > 60000) {
        throw new Error('Machine interval must be between 1000ms and 60000ms');
      }
      room.machineInterval = machineInterval;
    }
  }

  /**
   * Reset game (for replay)
   */
  resetGame(room: Room): void {
    // Stop any active calling
    this.stopMachineCalling(room.id);

    room.gameState = 'waiting';
    room.currentNumber = null;
    room.calledHistory = [];
    room.winner = null;

    // Keep players and their cards
  }

  /**
   * Cleanup all intervals (call on server shutdown)
   */
  cleanup(): void {
    for (const interval of this.callingIntervals.values()) {
      clearInterval(interval);
    }
    this.callingIntervals.clear();
  }

  /**
   * Get active calling intervals count (for debugging)
   */
  getActiveIntervalsCount(): number {
    return this.callingIntervals.size;
  }

  /**
   * Check if room has active calling interval
   */
  hasActiveInterval(roomId: string): boolean {
    return this.callingIntervals.has(roomId);
  }
}

// Singleton instance
export const gameManager = new GameManager();
