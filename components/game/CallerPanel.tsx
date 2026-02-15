/**
 * CallerPanel Component - Main caller control panel
 *
 * Combines all caller-related components into a unified panel:
 * - CurrentNumber: Large animated current number display
 * - CallerControls: Game control buttons (host/caller only)
 * - CalledHistory: 1-90 number grid showing history
 *
 * Features:
 * - Integrates with Socket.io via useSocket() hook
 * - Reads state from Zustand store
 * - Traditional green/gold color scheme
 * - Responsive layout (stacked on mobile, side-by-side on desktop)
 * - Sound effect on number call (Web Audio API beep)
 * - Host/caller permission checks
 * - Automatic game state management
 */

"use client";

import { memo, useCallback, useEffect, useRef, useMemo } from "react";
import { useSocket } from "@/providers/SocketProvider";
import {
  useGameStore,
  useGameState,
  useCalledHistory,
  useCurrentNumber,
  useIsHost,
  useIsCaller,
  useCallerMode,
  useMachineInterval,
  useSoundEnabled,
} from "@/store/useGameStore";
import { CurrentNumber } from "./CurrentNumber";
import { CallerControls } from "./CallerControls";
import { CalledHistory } from "./CalledHistory";
import { motion } from "framer-motion";

// ============================================================================
// PROPS
// ============================================================================

interface CallerPanelProps {
  /** Optional className for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CallerPanel = memo(function CallerPanel({
  className = "",
}: CallerPanelProps) {
  // Socket actions
  const { startGame, callNumber, changeCallerMode, changeCaller } = useSocket();

  // Store state
  const gameState = useGameState();
  const calledHistory = useCalledHistory();
  const currentNumber = useCurrentNumber();
  const isHost = useIsHost();
  const isCaller = useIsCaller();
  const callerMode = useCallerMode();
  const machineInterval = useMachineInterval();
  const soundEnabled = useSoundEnabled();
  const reset = useGameStore((state) => state.reset);
  const room = useGameStore((state) => state.room);

  // Compute remaining numbers with useMemo to avoid infinite loops
  const remainingNumbers = useMemo(() => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    return allNumbers.filter((num) => !calledHistory.includes(num));
  }, [calledHistory]);

  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined" && soundEnabled) {
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, [soundEnabled]);

  // Play beep sound when number is called
  const playBeep = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configure sound
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime); // 800Hz beep
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      // Play
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing beep:", error);
    }
  }, [soundEnabled]);

  // Play sound when current number changes
  useEffect(() => {
    if (currentNumber !== null) {
      playBeep();
    }
  }, [currentNumber, playBeep]);

  // Handle start game
  const handleStartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Handle call number (manual mode)
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

  // Handle reset game
  const handleResetGame = useCallback(() => {
    // Confirm before reset
    if (
      confirm("Bạn có chắc muốn đặt lại trò chơi? Mọi tiến trình sẽ bị mất.")
    ) {
      reset();
      // Note: Server-side reset would be better, but not implemented yet
      // For now, just reset client state
    }
  }, [reset]);

  // Handle change caller mode
  const handleChangeCallerMode = useCallback(
    (mode: "machine" | "manual") => {
      changeCallerMode(mode);
    },
    [changeCallerMode],
  );

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`
        w-full
        space-y-4 sm:space-y-6
        ${className}
      `}
    >
      {/* Top section: Current Number + Controls */}
      <div className="grid grid-cols-1 lg:flex lg:flex-col gap-4 sm:gap-6 lg:gap-8">
        {/* Current Number - Takes 3 columns on desktop */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <CurrentNumber
            currentNumber={currentNumber}
            hideNumber={callerMode === "manual" && !isCaller}
            showGenerateButton={
              isCaller && callerMode === "manual" && gameState === "playing"
            }
            onGenerateNumber={handleCallNumber}
            className="h-64 sm:h-80 lg:h-[28rem]"
          />
        </motion.div>

        {/* Controls - Takes 2 columns on desktop */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <CallerControls
            gameState={gameState}
            callerMode={callerMode}
            machineInterval={machineInterval}
            isHost={isHost}
            isCaller={isCaller}
            players={room?.players || []}
            onStartGame={handleStartGame}
            onCallNumber={handleCallNumber}
            onResetGame={handleResetGame}
            onChangeCallerMode={handleChangeCallerMode}
            onChangeCaller={changeCaller}
          />
        </motion.div>
      </div>

      {/* Bottom section: Called History */}
      <motion.div variants={itemVariants}>
        <CalledHistory
          calledNumbers={calledHistory}
          currentNumber={currentNumber}
          hideHistory={callerMode === "manual" && !isCaller}
        />
      </motion.div>

      {/* Info banner (only show when not host/caller) */}
      {!isHost && !isCaller && (
        <motion.div
          variants={itemVariants}
          className="
            p-4
            bg-paper-dark
            border-2 border-loto-green/30
            rounded-lg
            text-center
          "
        >
          <p className="text-sm text-gray-600">
            Bạn đang xem bảng gọi số. Chỉ chủ phòng và người gọi số mới có thể
            điều khiển trò chơi.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
});
