/**
 * Player Components Usage Examples
 *
 * This file demonstrates various ways to use the player list and room info components.
 * These are complete, working examples that can be copied into your application.
 */

'use client';

import {
  PlayerCard,
  PlayerList,
  RoomInfo,
  ShareButton,
} from '@/components/game';
import {
  useRoom,
  usePlayers,
  useCurrentPlayerId,
  useIsHost,
  useGameState,
  useRoomId,
} from '@/store/useGameStore';
import { useSocket } from '@/providers/SocketProvider';
import type { Player } from '@/types';

// ============================================================================
// EXAMPLE 1: Complete Room Sidebar
// ============================================================================

/**
 * Full sidebar with room info and player list
 * Use this in your game room layout
 */
export function RoomSidebar() {
  const room = useRoom();
  const players = usePlayers();

  if (!room) {
    return (
      <aside className="w-80 bg-white p-4 rounded-xl shadow-lg">
        <p className="text-center text-gray-500">Đang tải thông tin phòng...</p>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-80 bg-white p-4 lg:p-6 rounded-xl shadow-lg space-y-6">
      {/* Room information */}
      <RoomInfo
        roomId={room.id}
        playerCount={players.length}
        maxPlayers={16}
        gameState={room.gameState}
        createdAt={room.createdAt}
      />

      {/* Player list */}
      <PlayerList />
    </aside>
  );
}

// ============================================================================
// EXAMPLE 2: Compact Room Header
// ============================================================================

/**
 * Compact header showing room ID and share button
 * Use this for mobile layouts or minimal designs
 */
export function CompactRoomHeader() {
  const roomId = useRoomId();
  const players = usePlayers();
  const gameState = useGameState();

  if (!roomId) return null;

  return (
    <header className="bg-paper border-b-2 border-loto-green p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Room ID */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-gray-600">Phòng</p>
            <p className="text-2xl font-black text-loto-gold-dark font-mono">
              {roomId}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">{players.length} người</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full" />
            <span
              className={`font-semibold ${
                gameState === 'playing'
                  ? 'text-green-600'
                  : gameState === 'finished'
                  ? 'text-gray-600'
                  : 'text-yellow-600'
              }`}
            >
              {gameState === 'playing'
                ? 'Đang chơi'
                : gameState === 'finished'
                ? 'Kết thúc'
                : 'Chờ'}
            </span>
          </div>
        </div>

        {/* Share button */}
        <ShareButton roomId={roomId} />
      </div>
    </header>
  );
}

// ============================================================================
// EXAMPLE 3: Player Grid View
// ============================================================================

/**
 * Display players in a grid instead of list
 * Good for large screens or dashboard views
 */
export function PlayerGrid() {
  const players = usePlayers();
  const currentPlayerId = useCurrentPlayerId();
  const isHost = useIsHost();
  const { kickPlayer } = useSocket();

  const handleKick = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn đuổi ${player.name} khỏi phòng?`
    );
    if (confirmed) {
      kickPlayer(playerId);
    }
  };

  if (players.length === 0) {
    return <p className="text-center text-gray-500">Chưa có người chơi</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isCurrentUserHost={isHost}
          isCurrentUser={player.id === currentPlayerId}
          onKick={handleKick}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Minimal Player Count Badge
// ============================================================================

/**
 * Simple badge showing player count
 * Use in navigation or headers
 */
export function PlayerCountBadge() {
  const players = usePlayers();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-loto-green text-white rounded-full">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <span className="font-bold">{players.length}</span>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Custom Player Card with Actions
// ============================================================================

/**
 * Extended player card with custom actions
 * Shows how to add your own functionality
 */
export function ExtendedPlayerCard({ player }: { player: Player }) {
  const currentPlayerId = useCurrentPlayerId();
  const isHost = useIsHost();
  const { kickPlayer } = useSocket();
  const isCurrentUser = player.id === currentPlayerId;

  const handlePromote = () => {
    // Custom action: Promote player to caller
    console.log('Promoting player to caller:', player.id);
    // Implement your logic here
  };

  const handleViewCards = () => {
    // Custom action: View player's cards (if permitted)
    console.log('Viewing cards for player:', player.id);
    // Implement your logic here
  };

  return (
    <div className="relative">
      <PlayerCard
        player={player}
        isCurrentUserHost={isHost}
        isCurrentUser={isCurrentUser}
        onKick={kickPlayer}
      />

      {/* Custom actions */}
      {isHost && !isCurrentUser && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={handlePromote}
            className="flex-1 px-3 py-1.5 text-sm font-semibold text-loto-green border border-loto-green rounded-lg hover:bg-loto-green hover:text-white transition-colors"
          >
            Chỉ định gọi số
          </button>
          <button
            onClick={handleViewCards}
            className="flex-1 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Xem thẻ
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Mobile Bottom Sheet with Players
// ============================================================================

/**
 * Mobile-friendly bottom sheet showing players
 * Can be toggled on/off
 */
export function MobilePlayerSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const players = usePlayers();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            Người chơi ({players.length})
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Player list */}
        <div className="p-4">
          <PlayerList />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// EXAMPLE 7: Room Info Card (No Share Button)
// ============================================================================

/**
 * Room info without share button
 * Use when you want to place the share button elsewhere
 */
export function RoomInfoCard() {
  const room = useRoom();
  const players = usePlayers();

  if (!room) return null;

  return (
    <div className="bg-paper p-4 rounded-lg border-2 border-loto-green">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-600 mb-1">Mã phòng</p>
          <p className="text-xl font-bold text-loto-gold-dark">{room.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Người chơi</p>
          <p className="text-xl font-bold text-loto-green">{players.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
          <p className="text-xl font-bold text-gray-800">
            {room.gameState === 'playing'
              ? '🎮'
              : room.gameState === 'finished'
              ? '🏆'
              : '⏳'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Complete Game Room Layout
// ============================================================================

/**
 * Full game room layout with all components
 * This is a complete example you can use as-is
 */
export function GameRoomLayout() {
  const room = useRoom();

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Đang tải phòng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CompactRoomHeader />

      {/* Main content */}
      <div className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Game area */}
          <main className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Trò chơi Lô Tô
            </h2>
            {/* Your game components go here */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Game board goes here</p>
            </div>
          </main>

          {/* Sidebar */}
          <RoomSidebar />
        </div>
      </div>
    </div>
  );
}
