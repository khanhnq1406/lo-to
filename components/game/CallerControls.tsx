/**
 * CallerControls Component - Game control buttons for host/caller
 *
 * Features:
 * - Start game button (host only, waiting state)
 * - Call number button (caller only, manual mode, playing state)
 * - Pause/Resume machine mode (host only, playing state)
 * - Reset game button (host only, any state)
 * - Change caller mode selector (host only)
 * - Machine interval selector (1-60 seconds)
 * - Host/caller permission checks
 * - Responsive button layout
 * - Accessibility support
 */

"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { CallerMode, GameState, Player } from "@/types";
import { useGameStore, useSoundMode, useSpeechRate } from "@/store/useGameStore";

// ============================================================================
// PROPS
// ============================================================================

interface CallerControlsProps {
  /** Current game state */
  gameState: GameState;

  /** Current caller mode */
  callerMode: CallerMode;

  /** Current machine interval in milliseconds */
  machineInterval: number;

  /** Is machine mode paused? */
  machinePaused: boolean;

  /** Is current user the host? */
  isHost: boolean;

  /** Is current user the caller? */
  isCaller: boolean;

  /** All players in the room */
  players: Player[];

  /** Show current number to all players */
  showCurrentNumber?: boolean;

  /** Show called history to all players */
  showHistory?: boolean;

  /** Callback when start game clicked */
  onStartGame: () => void;

  /** Callback when call number clicked (manual mode) */
  onCallNumber: () => void;

  /** Callback when reset game clicked */
  onResetGame: () => void;

  /** Callback when caller mode changed */
  onChangeCallerMode: (mode: CallerMode, interval?: number) => void;

  /** Callback when caller changed */
  onChangeCaller: (targetPlayerId: string) => void;

  /** Callback when visibility settings changed */
  onChangeVisibilitySettings?: (
    showCurrentNumber?: boolean,
    showHistory?: boolean,
  ) => void;

  /** Callback when pause machine clicked */
  onPauseMachine?: () => void;

  /** Callback when resume machine clicked */
  onResumeMachine?: () => void;

  /** Optional className for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CallerControls = memo(function CallerControls({
  gameState,
  callerMode,
  machineInterval,
  machinePaused,
  isHost,
  isCaller,
  players,
  showCurrentNumber = true,
  showHistory = true,
  onStartGame,
  onCallNumber,
  onResetGame,
  onChangeCallerMode,
  onChangeCaller,
  onChangeVisibilitySettings,
  onPauseMachine,
  onResumeMachine,
  className = "",
}: CallerControlsProps) {
  const [selectedMode, setSelectedMode] = useState<CallerMode>(callerMode);
  const [selectedInterval, setSelectedInterval] = useState<number>(
    machineInterval / 1000,
  ); // Convert to seconds

  // Get sound mode and speech rate from store
  const soundMode = useSoundMode();
  const setSoundMode = useGameStore((state) => state.setSoundMode);
  const speechRate = useSpeechRate();
  const setSpeechRate = useGameStore((state) => state.setSpeechRate);

  // Sync local state with props when they change
  useEffect(() => {
    setSelectedMode(callerMode);
    setSelectedInterval(machineInterval / 1000);
  }, [callerMode, machineInterval]);

  // Get current caller
  const currentCaller = players.find((p) => p.isCaller);

  // Handle mode change
  const handleModeChange = (mode: CallerMode) => {
    setSelectedMode(mode);
    onChangeCallerMode(mode, selectedInterval * 1000);
  };

  // Handle interval change
  const handleIntervalChange = (seconds: number) => {
    setSelectedInterval(seconds);
    if (selectedMode === "machine") {
      onChangeCallerMode("machine", seconds * 1000);
    }
  };

  // Button component for consistency
  const Button = ({
    onClick,
    disabled,
    variant = "primary",
    children,
    icon,
    className: btnClassName = "",
  }: {
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger";
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
  }) => {
    const variantClasses = {
      primary:
        "bg-gradient-to-br from-loto-green to-loto-green-light text-paper hover:from-loto-green-light hover:to-loto-green",
      secondary:
        "bg-gradient-to-br from-loto-gold to-loto-gold-light text-loto-green hover:from-loto-gold-light hover:to-loto-gold",
      danger:
        "bg-gradient-to-br from-loto-red to-loto-red-light text-white hover:from-loto-red-light hover:to-loto-red",
    };

    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        className={`
          flex items-center justify-center gap-2
          px-6 py-3
          rounded-lg
          font-bold text-base
          shadow-loto-button
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${btnClassName}
        `}
      >
        {icon}
        {children}
      </motion.button>
    );
  };

  return (
    <div
      className={`
        bg-gradient-to-br from-paper via-paper-dark to-paper-darker
        border-3 border-loto-green
        rounded-xl
        shadow-loto-ticket
        p-4 sm:p-6
        space-y-4
        ${className}
      `}
    >
      {/* Caller Selection (Host only, waiting state) */}
      {isHost && gameState === "waiting" && players.length > 1 && (
        <div className="space-y-2">
          <label className="block text-sm font-bold text-loto-green">
            Người gọi số:
          </label>
          <select
            value={currentCaller?.id || ""}
            onChange={(e) => onChangeCaller(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-loto-green/30
              bg-white text-gray-800 font-semibold
              focus:outline-none focus:border-loto-green
              transition-colors"
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} {player.isHost ? "(Chủ phòng)" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 italic">
            Chọn người sẽ gọi số trong trò chơi
          </p>
        </div>
      )}

      {/* Caller Mode Selector (Host only) */}
      {isHost && (
        <div className="space-y-2">
          <label className="block text-sm font-bold text-loto-green">
            Chế độ gọi số:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange("machine")}
              disabled={gameState === "playing"}
              className={`
                flex-1 px-4 py-2 rounded-lg font-semibold text-sm
                transition-all
                ${
                  selectedMode === "machine"
                    ? "bg-loto-green text-paper shadow-md"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }
                ${gameState === "playing" ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Tự động
            </button>
            <button
              onClick={() => handleModeChange("manual")}
              disabled={gameState === "playing"}
              className={`
                flex-1 px-4 py-2 rounded-lg font-semibold text-sm
                transition-all
                ${
                  selectedMode === "manual"
                    ? "bg-loto-green text-paper shadow-md"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }
                ${gameState === "playing" ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Thủ công
            </button>
          </div>
          {gameState === "playing" && (
            <p className="text-xs text-gray-500 italic">
              Không thể đổi chế độ khi đang chơi
            </p>
          )}
        </div>
      )}

      {/* Machine Interval Selector (Host only, machine mode) */}
      {isHost && selectedMode === "machine" && (
        <div className="space-y-2">
          <label className="block text-sm font-bold text-loto-green">
            Thời gian giữa các số: {selectedInterval}s
          </label>
          <input
            type="range"
            min="1"
            max="60"
            value={selectedInterval}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-loto-green
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1s (nhanh)</span>
            <span>60s (chậm)</span>
          </div>
          {gameState === "playing" && (
            <p className="text-xs text-loto-green italic font-semibold">
              ✓ Có thể thay đổi trong khi chơi
            </p>
          )}
        </div>
      )}

      {/* Sound Mode Settings */}
      <div className="space-y-3 pt-2 border-t border-loto-green/20">
        <label className="block text-sm font-bold text-loto-green">
          Âm thanh gọi số:
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSoundMode("voice")}
            className={`
              px-3 py-2 rounded-lg font-semibold text-xs
              transition-all flex flex-col items-center gap-1
              ${
                soundMode === "voice"
                  ? "bg-loto-green text-paper shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }
            `}
          >
            <span className="text-lg">🔊</span>
            <span>Giọng nói</span>
          </button>

          <button
            onClick={() => setSoundMode("beep")}
            className={`
              px-3 py-2 rounded-lg font-semibold text-xs
              transition-all flex flex-col items-center gap-1
              ${
                soundMode === "beep"
                  ? "bg-loto-green text-paper shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }
            `}
          >
            <span className="text-lg">🔔</span>
            <span>Tiếng bíp</span>
          </button>

          <button
            onClick={() => setSoundMode("silent")}
            className={`
              px-3 py-2 rounded-lg font-semibold text-xs
              transition-all flex flex-col items-center gap-1
              ${
                soundMode === "silent"
                  ? "bg-loto-green text-paper shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }
            `}
          >
            <span className="text-lg">🔇</span>
            <span>Im lặng</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 italic">
          Giọng nói: Đọc số bằng tiếng Việt • Tiếng bíp: Âm thanh đơn giản • Im
          lặng: Không có âm thanh
        </p>

        {/* Speech Rate Slider (only show when voice mode is selected) */}
        {soundMode === "voice" && (
          <div className="space-y-2 pt-2">
            <label className="block text-sm font-bold text-loto-green">
              Tốc độ giọng nói: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => {
                const newRate = Number(e.target.value);
                setSpeechRate(newRate);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-loto-green
                [&::-webkit-slider-thumb]:cursor-pointer
              "
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5x (chậm)</span>
              <span>1.0x (bình thường)</span>
              <span>2.0x (nhanh)</span>
            </div>
          </div>
        )}
      </div>

      {/* Visibility Settings (Host only) */}
      {isHost && onChangeVisibilitySettings && (
        <div className="space-y-3 pt-2 border-t border-loto-green/20">
          <label className="block text-sm font-bold text-loto-green">
            Hiển thị cho người chơi:
          </label>

          {/* Show Current Number Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCurrentNumber}
                onChange={(e) =>
                  onChangeVisibilitySettings(e.target.checked, undefined)
                }
                className="w-4 h-4 rounded border-2 border-loto-green
                  text-loto-green focus:ring-2 focus:ring-loto-green/50
                  cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                Hiển thị số hiện tại
              </span>
            </label>
          </div>

          {/* Show History Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHistory}
                onChange={(e) =>
                  onChangeVisibilitySettings(undefined, e.target.checked)
                }
                className="w-4 h-4 rounded border-2 border-loto-green
                  text-loto-green focus:ring-2 focus:ring-loto-green/50
                  cursor-pointer"
              />
              <span className="text-sm text-gray-700">
                Hiển thị lịch sử gọi số
              </span>
            </label>
          </div>

          <p className="text-xs text-gray-500 italic">
            Người gọi số luôn thấy tất cả
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Start Game Button (Host only, waiting state) */}
        {isHost && gameState === "waiting" && (
          <Button
            onClick={onStartGame}
            variant="primary"
            className="w-full"
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Bắt đầu chơi
          </Button>
        )}

        {/* Call Number Button (Caller only, manual mode, playing state) */}
        {isCaller && callerMode === "manual" && gameState === "playing" && (
          <Button
            onClick={onCallNumber}
            variant="secondary"
            className="w-full text-lg"
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
            }
          >
            Gọi số ngẫu nhiên
          </Button>
        )}

        {/* Pause/Resume Machine Button (Host only, machine mode, playing state) */}
        {isHost && callerMode === "machine" && gameState === "playing" && onPauseMachine && onResumeMachine && (
          <Button
            onClick={machinePaused ? onResumeMachine : onPauseMachine}
            variant={machinePaused ? "primary" : "secondary"}
            className="w-full text-lg"
            icon={
              machinePaused ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )
            }
          >
            {machinePaused ? "Tiếp tục gọi số" : "Tạm dừng gọi số"}
          </Button>
        )}

        {/* Reset Game Button (Host only, not waiting) */}
        {isHost && gameState !== "waiting" && (
          <Button
            onClick={onResetGame}
            variant="danger"
            className="w-full"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
          >
            Đặt lại trò chơi
          </Button>
        )}
      </div>

      {/* Status info */}
      <div className="pt-4 border-t border-loto-green/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${gameState === "playing" ? "bg-loto-green animate-pulse" : "bg-gray-400"}`}
            />
            <span className="text-gray-600">
              Trạng thái:{" "}
              <span className="font-semibold text-loto-green">
                {gameState === "waiting"
                  ? "Chờ bắt đầu"
                  : gameState === "playing"
                    ? "Đang chơi"
                    : "Đã kết thúc"}
              </span>
            </span>
          </div>
          {isCaller && (
            <span className="px-2 py-1 bg-loto-gold/20 text-loto-green text-xs font-bold rounded">
              Người gọi số
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
