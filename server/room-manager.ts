/**
 * Room Manager - In-memory room state management
 * Handles room lifecycle: creation, joining, leaving, cleanup
 */

import {
  Room,
  Player,
  CallerMode,
  RoomSchema,
  PlayerSchema,
} from '../types/index';

export class RoomManager {
  private rooms = new Map<string, Room>();

  /**
   * Create a new room with a host player
   */
  createRoom(
    hostSocketId: string,
    hostName: string,
    callerMode: CallerMode,
    machineInterval: number = 3000
  ): Room {
    const roomId = this.generateRoomId();

    const hostPlayer: Player = {
      id: hostSocketId,
      name: hostName,
      tickets: [],
      isHost: true,
      isCaller: true,
      connected: true,
    };

    const room: Room = {
      id: roomId,
      players: [hostPlayer],
      gameState: 'waiting',
      callerMode,
      currentNumber: null,
      calledHistory: [],
      winner: null,
      machineInterval,
      createdAt: new Date(),
      selectedCards: {},
      manualMarkingMode: true, // Default to manual-mark
    };

    // Validate room before storing
    const validation = RoomSchema.safeParse(room);
    if (!validation.success) {
      throw new Error(`Invalid room structure: ${validation.error.message}`);
    }

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Add a player to an existing room
   */
  joinRoom(roomId: string, socketId: string, playerName: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.gameState !== 'waiting') {
      throw new Error('Cannot join room - game already started');
    }

    // Check if player already exists (reconnection case)
    const existingPlayer = room.players.find((p) => p.id === socketId);
    if (existingPlayer) {
      existingPlayer.connected = true;
      return room;
    }

    // Check for duplicate names
    const nameExists = room.players.some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameExists) {
      throw new Error('Player name already exists in this room');
    }

    const newPlayer: Player = {
      id: socketId,
      name: playerName,
      tickets: [],
      isHost: false,
      isCaller: false,
      connected: true,
    };

    // Validate player before adding
    const validation = PlayerSchema.safeParse(newPlayer);
    if (!validation.success) {
      throw new Error(`Invalid player structure: ${validation.error.message}`);
    }

    room.players.push(newPlayer);
    return room;
  }

  /**
   * Remove a player from a room
   * If host leaves, assign new host to first remaining player
   */
  leaveRoom(roomId: string, socketId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const playerIndex = room.players.findIndex((p) => p.id === socketId);
    if (playerIndex === -1) {
      return room;
    }

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    // If no players left, delete room
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    // If host left, assign new host
    if (wasHost) {
      room.players[0].isHost = true;
      room.players[0].isCaller = true;
    }

    return room;
  }

  /**
   * Mark player as disconnected (don't remove yet - they might reconnect)
   */
  disconnectPlayer(socketId: string): { roomId: string; room: Room } | null {
    for (const [roomId, room] of this.rooms.entries()) {
      const player = room.players.find((p) => p.id === socketId);
      if (player) {
        player.connected = false;
        return { roomId, room };
      }
    }
    return null;
  }

  /**
   * Kick a player from a room (host action)
   */
  kickPlayer(roomId: string, hostSocketId: string, targetPlayerId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const host = room.players.find((p) => p.id === hostSocketId);
    if (!host || !host.isHost) {
      throw new Error('Only host can kick players');
    }

    if (targetPlayerId === hostSocketId) {
      throw new Error('Host cannot kick themselves');
    }

    const playerIndex = room.players.findIndex((p) => p.id === targetPlayerId);
    if (playerIndex === -1) {
      throw new Error('Player not found in room');
    }

    room.players.splice(playerIndex, 1);
    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get all rooms (for admin/debug purposes)
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Check if room exists
   */
  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Get player by socket ID (searches all rooms)
   */
  findPlayer(socketId: string): { room: Room; player: Player } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.id === socketId);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  /**
   * Clean up empty rooms and disconnected players
   * Should be called periodically
   */
  cleanup(_disconnectedTimeout: number = 5 * 60 * 1000): number {
    let cleanedCount = 0;

    for (const [roomId, room] of this.rooms.entries()) {
      // Remove rooms with no connected players
      const hasConnectedPlayers = room.players.some((p) => p.connected);
      if (!hasConnectedPlayers) {
        this.rooms.delete(roomId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Update room state
   */
  updateRoom(roomId: string, updates: Partial<Room>): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    Object.assign(room, updates);
    return room;
  }

  /**
   * Change the caller (host action)
   */
  changeCaller(roomId: string, hostSocketId: string, targetPlayerId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Verify host permission
    const host = room.players.find((p) => p.id === hostSocketId);
    if (!host || !host.isHost) {
      throw new Error('Only host can change the caller');
    }

    // Verify target player exists
    const targetPlayer = room.players.find((p) => p.id === targetPlayerId);
    if (!targetPlayer) {
      throw new Error('Target player not found in room');
    }

    // Find current caller
    const currentCaller = room.players.find((p) => p.isCaller);

    // Remove caller role from current caller
    if (currentCaller) {
      currentCaller.isCaller = false;
    }

    // Assign caller role to target player
    targetPlayer.isCaller = true;

    return room;
  }

  /**
   * Generate unique room ID
   */
  private generateRoomId(): string {
    // Generate short, memorable room codes (6 characters)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId: string;

    do {
      roomId = '';
      for (let i = 0; i < 6; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.rooms.has(roomId));

    return roomId;
  }

  /**
   * Get room count
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Get total player count across all rooms
   */
  getTotalPlayerCount(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.players.filter((p) => p.connected).length;
    }
    return count;
  }
}

// Singleton instance
export const roomManager = new RoomManager();
