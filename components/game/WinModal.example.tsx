/**
 * Win Modal - Example Usage
 * Demonstrates how to integrate win detection and celebration in a game room
 */

'use client';

import { useEffect } from 'react';
import { WinModal } from './WinModal';
import { useWinDetection } from '@/hooks/useWinDetection';
import { useSocket } from '@/providers/SocketProvider';
import { useGameStore } from '@/store/useGameStore';

/**
 * Example 1: Basic Integration
 * Minimal setup with automatic win detection
 */
export function BasicWinDetectionExample() {
  // Connect to Socket.io server
  const socket = useSocket();

  // Automatic win detection (monitors game state and auto-claims)
  const { hasWon, winResult, claiming } = useWinDetection(
    socket.connected ? socket : undefined
  );

  // Get winner from game state
  const winner = useGameStore(state => state.room?.winner);
  const isHost = useGameStore(state => state.isHost());
  const soundEnabled = useGameStore(state => state.soundEnabled);

  // Handle play again (host only)
  const handlePlayAgain = () => {
    if (!isHost) return;

    // In real implementation, emit reset_game event to server
    console.log('Starting new game...');
    // socket.emit('reset_game', { roomId: socket.roomId });
  };

  return (
    <div>
      {/* Your game UI */}
      <div className="p-4">
        <h1>Game Room</h1>
        {claiming && <p>Checking for win...</p>}
        {hasWon && <p>You won! Claiming victory...</p>}
      </div>

      {/* Win celebration modal */}
      <WinModal
        winner={winner}
        isHost={isHost}
        soundEnabled={soundEnabled}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}

/**
 * Example 2: Advanced Integration
 * Shows winning card and additional features
 */
export function AdvancedWinDetectionExample() {
  const socket = useSocket();
  const { hasWon, winResult } = useWinDetection(
    socket.connected ? socket : undefined
  );

  const winner = useGameStore(state => state.room?.winner);
  const isHost = useGameStore(state => state.isHost());
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const currentPlayer = useGameStore(state => state.getCurrentPlayer());

  // Get the actual winning card for display
  const winningCard = winner && winner.cardIndex !== undefined && currentPlayer
    ? currentPlayer.tickets[winner.cardIndex]
    : undefined;

  // Log when win detected
  useEffect(() => {
    if (hasWon && winResult) {
      console.log('Win detected!', {
        cardIndex: winResult.cardIndex,
        rowIndex: winResult.rowIndex,
        winningNumbers: winResult.winningNumbers,
      });
    }
  }, [hasWon, winResult]);

  const handlePlayAgain = () => {
    if (!isHost) return;

    // Reset game on server
    socket.emit('reset_game', {
      roomId: useGameStore.getState().room?.id,
    });

    // Clear local winner state
    useGameStore.getState().setWinner(null);
    useGameStore.getState().setGameState('waiting');
  };

  return (
    <div>
      {/* Your game UI */}
      <div className="p-4">
        <h1>Advanced Game Room</h1>

        {/* Win status indicator */}
        {hasWon && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            You have a winning card! Card #{winResult?.cardIndex + 1}, Row #{winResult?.rowIndex + 1}
          </div>
        )}
      </div>

      {/* Win celebration modal with card display */}
      <WinModal
        winner={winner}
        isHost={isHost}
        soundEnabled={soundEnabled}
        winningCard={winningCard}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}

/**
 * Example 3: Manual Win Detection
 * Without auto-claim (for testing or custom flows)
 */
export function ManualWinDetectionExample() {
  const socket = useSocket();

  const winner = useGameStore(state => state.room?.winner);
  const isHost = useGameStore(state => state.isHost());
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const currentPlayer = useGameStore(state => state.getCurrentPlayer());
  const calledHistory = useGameStore(state => state.room?.calledHistory || []);

  // Manual win check
  const checkForWin = () => {
    if (!currentPlayer || !currentPlayer.tickets) return;

    const calledNumbers = new Set(calledHistory);

    // Import detectWin function
    // const { detectWin } = require('@/lib/winDetection');
    // const win = detectWin(currentPlayer.tickets, calledNumbers);

    // if (win) {
    //   console.log('Win detected!', win);
    //   // Manually emit claim
    //   socket.emit('claim_win', {
    //     roomId: useGameStore.getState().room?.id,
    //     ticketIndex: win.cardIndex,
    //     boardIndex: 0,
    //     type: win.type,
    //   });
    // }
  };

  return (
    <div>
      <div className="p-4">
        <h1>Manual Win Detection</h1>

        {/* Manual check button */}
        <button
          onClick={checkForWin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check for Win
        </button>
      </div>

      <WinModal
        winner={winner}
        isHost={isHost}
        soundEnabled={soundEnabled}
        onPlayAgain={() => console.log('Play again')}
      />
    </div>
  );
}

/**
 * Example 4: Testing Win Modal
 * Mock winner data for UI testing
 */
export function WinModalTestExample() {
  const mockWinner = {
    playerId: 'player-123',
    playerName: 'Nguyễn Văn A',
    cardIndex: 0,
    rowIndex: 1,
    type: 'row' as const,
    ticketIndex: 0,
    boardIndex: 0,
    rowIndices: [1],
  };

  const mockCard = [
    [1, null, 23, null, 45, null, 67, null, 89],
    [null, 12, null, 34, null, 56, null, 78, null],
    [5, null, 25, null, 49, null, 69, null, 90],
  ];

  return (
    <div className="p-4">
      <h1>Win Modal Test</h1>
      <p>Mock winner data displayed below:</p>

      <WinModal
        winner={mockWinner}
        isHost={true}
        soundEnabled={true}
        winningCard={mockCard}
        onPlayAgain={() => console.log('Play again clicked')}
      />
    </div>
  );
}

/**
 * Example 5: Complete Game Room Integration
 * Full example with all features
 */
export function CompleteGameRoomExample() {
  const socket = useSocket();

  // Automatic win detection
  useWinDetection(socket.connected ? socket : undefined);

  // Game state
  const room = useGameStore(state => state.room);
  const winner = room?.winner;
  const isHost = useGameStore(state => state.isHost());
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const currentPlayer = useGameStore(state => state.getCurrentPlayer());
  const gameState = room?.gameState;

  // Get winning card
  const winningCard = winner && winner.cardIndex !== undefined && currentPlayer
    ? currentPlayer.tickets[winner.cardIndex]
    : undefined;

  // Handle play again
  const handlePlayAgain = () => {
    if (!isHost || !room) return;

    // Reset game state
    socket.emit('reset_game', { roomId: room.id });
  };

  // Handle start game
  const handleStartGame = () => {
    if (!isHost) return;
    socket.startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-amber-900">
          Lô Tô - Room {room?.id}
        </h1>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4">
        {/* Game state indicator */}
        <div className="mb-4">
          <span className="text-lg font-medium">
            Game State: <span className="capitalize">{gameState}</span>
          </span>
        </div>

        {/* Start game button (waiting state, host only) */}
        {gameState === 'waiting' && isHost && (
          <button
            onClick={handleStartGame}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600"
          >
            Start Game
          </button>
        )}

        {/* Player cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {currentPlayer?.tickets.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold mb-2">Card #{index + 1}</h3>
              {/* Render card grid here */}
              <div className="text-sm text-gray-500">
                {card.length} rows
              </div>
            </div>
          ))}
        </div>

        {/* Caller panel */}
        {gameState === 'playing' && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Current Number</h2>
            <div className="text-6xl font-bold text-center text-amber-600">
              {room?.currentNumber || '-'}
            </div>
          </div>
        )}
      </main>

      {/* Win celebration modal */}
      <WinModal
        winner={winner}
        isHost={isHost}
        soundEnabled={soundEnabled}
        winningCard={winningCard}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}

/**
 * Default export for easy testing
 */
export default CompleteGameRoomExample;
