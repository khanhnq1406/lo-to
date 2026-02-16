/**
 * Room Game Page - Vietnamese Lô Tô Game Room
 * Dynamic route page for game rooms with responsive layout
 *
 * FEATURES:
 * - Auto-join room on page load using URL param
 * - Desktop layout: Split panel (60% caller, 40% player info)
 * - Mobile layout: Sticky top + expandable bottom sheet
 * - Real-time Socket.io synchronization
 * - Error handling and loading states
 * - Redirect to home if not connected
 * - Full game functionality (calling, marking, winning)
 *
 * LAYOUT:
 * Desktop (lg+):
 *   - Left (60%): CallerPanel with CurrentNumber, CalledHistory, Controls
 *   - Right (40%): TicketDisplay, PlayerList, RoomInfo
 *
 * Mobile:
 *   - Top (sticky): CurrentNumber
 *   - Middle (scrollable): TicketDisplay
 *   - Bottom (expandable sheet): CalledHistory, PlayerList, Controls
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, LogOut, AlertCircle } from "lucide-react";
import { useSocket } from "@/providers/SocketProvider";
import {
  useGameStore,
  useRoom,
  usePlayers,
  usePlayerCards,
  useGameState,
  useCalledHistory,
  useCurrentNumber,
  useIsHost,
  useIsCaller,
  useCallerMode,
  useMachineInterval,
  useError,
  useSelectedCards,
} from "@/store/useGameStore";
import { CurrentNumber } from "@/components/game/CurrentNumber";
import { CalledHistory } from "@/components/game/CalledHistory";
import { CardSelector } from "@/components/game/CardSelector";
import { SelectedCardsDisplay } from "@/components/game/SelectedCardsDisplay";
import { PlayerList } from "@/components/game/PlayerList";
import { RoomInfo } from "@/components/game/RoomInfo";
import { CallerControls } from "@/components/game/CallerControls";
import { useCardSelection } from "@/hooks/useCardSelection";
import { cn } from "@/lib/utils";
import { cachePlayerName, cleanPlayerNameCache } from "@/lib/session-storage";

// ============================================================================
// COMPONENT
// ============================================================================

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  // Socket connection and actions
  const {
    connected,
    connecting,
    joinRoom,
    leaveRoom,
    startGame,
    callNumber,
    changeCallerMode,
    changeCaller,
    changeMarkingMode,
    resetGame,
  } = useSocket();

  // Store state
  const room = useRoom();
  const players = usePlayers();
  const playerCards = usePlayerCards();
  const gameState = useGameState();
  const calledHistory = useCalledHistory();
  const currentNumber = useCurrentNumber();
  const isHost = useIsHost();
  const isCaller = useIsCaller();
  const callerMode = useCallerMode();
  const machineInterval = useMachineInterval();
  const error = useError();
  const reset = useGameStore((state) => state.reset);
  const currentPlayerId = useGameStore((state) => state.currentPlayerId);
  const selectedCards = useSelectedCards();

  // Get current player from players array to avoid infinite loop
  const currentPlayer = players.find((p) => p.id === currentPlayerId) || null;

  // Debug logging for card selector visibility
  if (typeof window !== "undefined") {
    console.log("[CardSelector Debug]", {
      gameState,
      currentPlayerId,
      playerIdsInRoom: players.map((p) => p.id),
      hasCurrentPlayer: !!currentPlayer,
      playersCount: players.length,
    });
  }

  // Card selection hook
  const { selectCard, deselectCard } = useCardSelection();

  // Convert called history to Set
  const calledNumbersSet = new Set(calledHistory);

  // Memoize remaining numbers to prevent infinite re-renders
  // Only recompute when calledHistory length changes
  const remainingNumbers = useMemo(() => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    return allNumbers.filter((num) => !calledHistory.includes(num));
  }, [calledHistory]);

  // Local UI state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // ===========================
  // CACHE PLAYER NAMES
  // ===========================

  useEffect(() => {
    // Cache all player names for quick lookup after page refresh
    players.forEach((player) => {
      cachePlayerName(player.id, player.name);
    });

    // Clean expired cache entries periodically
    cleanPlayerNameCache();
  }, [players]);

  // ===========================
  // AUTO-JOIN ON MOUNT
  // ===========================

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Wait for connection
    if (!connected || connecting) return;

    // Check if already in room
    if (room?.id === roomId) {
      setHasJoined(true);
      return;
    }

    // Check if already tried to join
    if (hasJoined) return;

    // Get player name from localStorage or generate default
    const storedName = localStorage.getItem("loto-player-name");
    const playerName =
      storedName || `Player_${Math.random().toString(36).substring(2, 6)}`;

    console.log("[RoomPage] Auto-joining room:", { roomId, playerName });

    try {
      // Join the room (cardCount = 0, cards will be selected later)
      joinRoom(roomId.toUpperCase(), playerName, 0);
      setHasJoined(true);

      // Store for future use
      localStorage.setItem("loto-player-name", playerName);
    } catch (err) {
      console.error("[RoomPage] Failed to join room:", err);
      setJoinError("Không thể tham gia phòng. Vui lòng thử lại.");
    }
  }, [connected, connecting, room?.id, roomId, hasJoined, joinRoom]);

  // ===========================
  // REDIRECT IF NOT CONNECTED
  // ===========================

  useEffect(() => {
    // Wait a bit before redirecting to allow connection
    if (!connected && !connecting && hasJoined) {
      const timeout = setTimeout(() => {
        console.log("[RoomPage] Not connected, redirecting to home");
        router.push("/");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [connected, connecting, hasJoined, router]);

  // ===========================
  // HANDLE ROOM NOT FOUND
  // ===========================

  useEffect(() => {
    // If we've tried to join but error indicates room not found
    if (error && error.toLowerCase().includes("not found")) {
      setJoinError("Phòng không tồn tại. Vui lòng kiểm tra lại mã phòng.");

      const timeout = setTimeout(() => {
        router.push("/");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [error, router]);

  // ===========================
  // HANDLERS
  // ===========================

  const handleLeaveRoom = useCallback(() => {
    const confirmed = window.confirm("Bạn có chắc muốn rời khỏi phòng?");
    if (confirmed) {
      leaveRoom();
      reset();
      router.push("/");
    }
  }, [leaveRoom, reset, router]);

  const handleStartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleCallNumber = useCallback(() => {
    if (remainingNumbers.length === 0) {
      console.warn("No remaining numbers to call");
      return;
    }

    // Pick random number from remaining
    const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
    const number = remainingNumbers[randomIndex];

    callNumber(number);
  }, [callNumber, remainingNumbers]);

  const handleResetGame = useCallback(() => {
    if (
      confirm("Bạn có chắc muốn đặt lại trò chơi? Mọi tiến trình sẽ bị mất.")
    ) {
      resetGame();
    }
  }, [resetGame]);

  const handleChangeCallerMode = useCallback(
    (mode: "machine" | "manual", _interval?: number) => {
      changeCallerMode(mode);
    },
    [changeCallerMode],
  );

  // ===========================
  // LOADING STATE
  // ===========================

  if (connecting || !connected || !hasJoined || !room) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block p-8 bg-white rounded-xl border-2 border-loto-green shadow-lg">
            {joinError ? (
              <>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Lỗi kết nối
                </h2>
                <p className="text-gray-600">{joinError}</p>
                <p className="text-sm text-gray-500 mt-4">
                  Đang chuyển về trang chủ...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 border-4 border-loto-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {connecting ? "Đang kết nối..." : "Đang tham gia phòng..."}
                </h2>
                <p className="text-gray-600">Mã phòng: {roomId}</p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ===========================
  // ERROR STATE
  // ===========================

  if (error && !room) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block p-8 bg-white rounded-xl border-2 border-red-500 shadow-lg max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Không thể tham gia phòng
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-loto-green text-white font-bold rounded-lg hover:bg-loto-green-light transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===========================
  // MAIN LAYOUT
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper via-paper to-paper-dark overflow-y-auto">
      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md"
          >
            <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave room button (fixed top-right) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleLeaveRoom}
        className="fixed top-20 left-6 z-40 p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
        aria-label="Rời phòng"
      >
        <LogOut className="w-6 h-6" />
      </motion.button>

      {/* DESKTOP LAYOUT (lg+) */}
      <div className="hidden lg:block lg:min-h-screen">
        {/* Fixed Top: Current Number - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-30 bg-paper shadow-md"
        >
          <div className="px-8 py-3">
            <CurrentNumber
              currentNumber={currentNumber}
              hideNumber={callerMode === "manual" && !isCaller}
              showGenerateButton={
                isCaller && callerMode === "manual" && gameState === "playing"
              }
              onGenerateNumber={handleCallNumber}
              className="h-32 lg:h-52"
              collapsible={true}
              defaultCollapsed={true}
            />
          </div>
        </motion.div>

        {/* Main Content - Grid with top padding */}
        <div className="grid lg:grid-cols-[30%_70%] lg:gap-8 lg:px-8 lg:pt-20 lg:pb-6">
          {/* Left Panel: Caller Controls & History */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col gap-6 z-0"
          >
            {/* Caller Controls */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-loto-green shadow-lg">
              <CallerControls
                gameState={gameState}
                callerMode={callerMode}
                machineInterval={machineInterval}
                isHost={isHost}
                isCaller={isCaller}
                players={players}
                onStartGame={handleStartGame}
                onCallNumber={handleCallNumber}
                onResetGame={handleResetGame}
                onChangeCallerMode={handleChangeCallerMode}
                onChangeCaller={changeCaller}
              />
            </div>

            {/* Called History */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-loto-green shadow-lg">
              <CalledHistory
                calledNumbers={calledHistory}
                currentNumber={currentNumber}
                hideHistory={callerMode === "manual" && !isCaller}
              />
            </div>
          </motion.div>

          {/* Right Panel: Player Info - Fixed sidebar with internal scroll */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex flex-col gap-6 z-10"
          >
            {/* Room Info - Fixed at top */}
            <div className="flex-shrink-0">
              <RoomInfo
                roomId={room.id}
                playerCount={players.length}
                gameState={gameState}
                createdAt={room.createdAt}
              />
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {/* Card Selector (only show during waiting state) */}
              {(() => {
                const shouldShow =
                  gameState === "waiting" && currentPlayerId && currentPlayer;
                console.log("[CardSelector Desktop] Debug:", {
                  gameState,
                  currentPlayerId,
                  hasCurrentPlayer: !!currentPlayer,
                  shouldShow,
                  players: players.length,
                });
                return shouldShow ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-loto-blue shadow-lg transition-all duration-300 hover:shadow-xl">
                    <CardSelector
                      selectedCards={selectedCards}
                      currentPlayerId={currentPlayerId}
                      players={players}
                      gameStarted={gameState !== "waiting"}
                      onSelectCard={selectCard}
                      onDeselectCard={deselectCard}
                    />
                  </div>
                ) : null;
              })()}

              {/* Selected Cards Display - Show card images */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-loto-green shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl">
                <div className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-loto-green/5 to-transparent">
                  <h3 className="text-xl font-bold text-gray-800">
                    Phiếu dò của bạn
                  </h3>
                </div>
                <div className="p-6">
                  <SelectedCardsDisplay
                    selectedCards={selectedCards}
                    currentPlayerId={currentPlayerId || ""}
                    calledNumbers={calledNumbersSet}
                    cards={playerCards}
                    onChangeMarkingMode={changeMarkingMode}
                  />
                </div>
              </div>

              {/* Player List */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border-2 border-loto-green shadow-lg transition-all duration-300 hover:shadow-xl">
                <PlayerList />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Top: Current Number (Fixed) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-30 bg-paper shadow-lg"
        >
          <div className="p-4">
            <CurrentNumber
              currentNumber={currentNumber}
              hideNumber={callerMode === "manual" && !isCaller}
              showGenerateButton={
                isCaller && callerMode === "manual" && gameState === "playing"
              }
              onGenerateNumber={handleCallNumber}
              className="h-40"
              collapsible={true}
            />
          </div>
        </motion.div>

        {/* Middle: Scrollable Content */}
        <div
          className={cn(
            "flex-1 pt-24 pb-32",
            !isSheetOpen && "overflow-y-auto",
          )}
        >
          <div className="p-4 space-y-4">
            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RoomInfo
                roomId={room.id}
                playerCount={players.length}
                gameState={gameState}
                createdAt={room.createdAt}
              />
            </motion.div>

            {/* Card Selector (only show during waiting state) */}
            {gameState === "waiting" && currentPlayerId && currentPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-white rounded-xl p-4 border-2 border-loto-green shadow-lg"
              >
                <CardSelector
                  selectedCards={selectedCards}
                  currentPlayerId={currentPlayerId}
                  players={players}
                  gameStarted={gameState !== "waiting"}
                  onSelectCard={selectCard}
                  onDeselectCard={deselectCard}
                />
              </motion.div>
            )}

            {/* Selected Cards Display - Show card images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 border-2 border-loto-green shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Phiếu dò của bạn
              </h3>
              <SelectedCardsDisplay
                selectedCards={selectedCards}
                currentPlayerId={currentPlayerId || ""}
                calledNumbers={calledNumbersSet}
                cards={playerCards}
                onChangeMarkingMode={changeMarkingMode}
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom: Expandable Sheet */}
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <AnimatePresence>
            {isSheetOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSheetOpen(false)}
                className="fixed inset-0 bg-black/50 pointer-events-auto"
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={false}
            animate={{
              y: isSheetOpen ? 0 : "calc(100% - 70px)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative bg-white rounded-t-3xl shadow-2xl overflow-hidden pointer-events-auto",
              "border-t-4 border-loto-green",
              "h-screen flex flex-col",
            )}
          >
            {/* Sheet Handle */}
            <button
              onClick={() => setIsSheetOpen(!isSheetOpen)}
              className="w-full p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
              aria-label={
                isSheetOpen ? "Đóng bảng điều khiển" : "Mở bảng điều khiển"
              }
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-2 text-gray-700">
                {isSheetOpen ? (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    <span className="font-semibold">Đóng</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-5 h-5" />
                    <span className="font-semibold">Lịch sử & Điều khiển</span>
                  </>
                )}
              </div>
            </button>

            {/* Sheet Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6 pb-8">
                {/* Called History */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Lịch sử gọi số
                  </h3>
                  <CalledHistory
                    calledNumbers={calledHistory}
                    currentNumber={currentNumber}
                    hideHistory={callerMode === "manual" && !isCaller}
                  />
                </div>

                {/* Caller Controls (if host/caller) */}
                {(isHost || isCaller) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">
                      Điều khiển
                    </h3>
                    <CallerControls
                      gameState={gameState}
                      callerMode={callerMode}
                      machineInterval={machineInterval}
                      isHost={isHost}
                      isCaller={isCaller}
                      players={players}
                      onStartGame={handleStartGame}
                      onCallNumber={handleCallNumber}
                      onResetGame={handleResetGame}
                      onChangeCallerMode={handleChangeCallerMode}
                      onChangeCaller={changeCaller}
                    />
                  </div>
                )}

                {/* Player List */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Người chơi
                  </h3>
                  <PlayerList />
                </div>

                {/* Info banner for non-hosts */}
                {!isHost && !isCaller && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Chỉ chủ phòng và người gọi số mới có thể điều khiển trò
                        chơi.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
