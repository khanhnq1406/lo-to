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
  useSoundMode,
} from "@/store/useGameStore";
import { CurrentNumber } from "./CurrentNumber";
import { CallerControls } from "./CallerControls";
import { CalledHistory } from "./CalledHistory";
import { motion } from "framer-motion";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

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
  const { startGame, callNumber, changeCallerMode, changeCaller, pauseMachine, resumeMachine } = useSocket();

  // Store state
  const gameState = useGameState();
  const calledHistory = useCalledHistory();
  const currentNumber = useCurrentNumber();
  const isHost = useIsHost();
  const isCaller = useIsCaller();
  const callerMode = useCallerMode();
  const machineInterval = useMachineInterval();
  const soundEnabled = useSoundEnabled();
  const soundMode = useSoundMode();
  const reset = useGameStore((state) => state.reset);
  const room = useGameStore((state) => state.room);
  const machinePaused = useGameStore((state) => state.room?.machinePaused ?? false);

  // Compute remaining numbers with useMemo to avoid infinite loops
  const remainingNumbers = useMemo(() => {
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    return allNumbers.filter((num) => !calledHistory.includes(num));
  }, [calledHistory]);

  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);

  // Speech synthesis hook
  const { speak, initialize, hasUserGesture, isSupported: isSpeechSupported } = useSpeechSynthesis();

  // Initialize audio context for beep mode
  useEffect(() => {
    if (typeof window !== "undefined" && soundEnabled && soundMode === "beep") {
      audioContextRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, [soundEnabled, soundMode]);

  // Play beep sound
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

  // Play voice announcement using Web Speech API
  const playVoice = useCallback((number: number) => {
    console.log("[CallerPanel] playVoice called with number:", number, "isSpeechSupported:", isSpeechSupported);

    if (!isSpeechSupported) {
      console.warn("[CallerPanel] Speech synthesis not supported, falling back to beep");
      playBeep();
      return;
    }

    const success = speak(number.toString(), 'vi-VN');
    if (!success) {
      // Fallback to beep on error
      console.warn("[CallerPanel] speak() returned false, falling back to beep");
      playBeep();
    }
  }, [speak, isSpeechSupported, playBeep]);

  // Play sound based on mode when current number changes
  useEffect(() => {
    console.log("[CallerPanel] useEffect triggered - currentNumber:", currentNumber, "soundMode:", soundMode, "soundEnabled:", soundEnabled, "hasUserGesture:", hasUserGesture);

    if (currentNumber === null) return;

    // Only play voice if we have user gesture (prevents "not-allowed" error)
    if (soundMode === "voice" && hasUserGesture) {
      console.log("[CallerPanel] Calling playVoice for number:", currentNumber);
      playVoice(currentNumber);
    } else if (soundMode === "voice" && !hasUserGesture) {
      console.warn("[CallerPanel] Cannot play voice without user gesture. User needs to click 'Start Game' or 'Call Number' first.");
    } else if (soundMode === "beep") {
      // Only check soundEnabled for beep mode
      if (soundEnabled) {
        console.log("[CallerPanel] Playing beep");
        playBeep();
      }
    } else {
      console.log("[CallerPanel] Sound mode is silent or unrecognized:", soundMode);
    }
    // Silent mode: do nothing
  }, [currentNumber, soundEnabled, soundMode, playVoice, playBeep, hasUserGesture]);

  // Handle start game
  const handleStartGame = useCallback(() => {
    // Initialize speech synthesis on user gesture (Safari requirement)
    initialize();
    startGame();
  }, [initialize, startGame]);

  // Handle call number (manual mode)
  const handleCallNumber = useCallback(() => {
    if (remainingNumbers.length === 0) {
      console.warn("No remaining numbers to call");
      return;
    }

    // Initialize speech if not already done (ensures we have user gesture)
    if (!hasUserGesture) {
      initialize();
    }

    // Pick random number from remaining
    const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
    const number = remainingNumbers[randomIndex];

    // Call number via socket
    callNumber(number);

    // Trigger speech immediately (still in user gesture context for Safari)
    if (soundMode === 'voice' && isSpeechSupported) {
      speak(number.toString(), 'vi-VN', false); // false = don't require user gesture check since we're in handler
    } else if (soundMode === 'beep') {
      playBeep();
    }
  }, [callNumber, remainingNumbers, soundMode, speak, isSpeechSupported, playBeep, hasUserGesture, initialize]);

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
            collapsible={true}
          />
        </motion.div>

        {/* Controls - Takes 2 columns on desktop */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <CallerControls
            gameState={gameState}
            callerMode={callerMode}
            machineInterval={machineInterval}
            machinePaused={machinePaused}
            isHost={isHost}
            isCaller={isCaller}
            players={room?.players || []}
            onStartGame={handleStartGame}
            onCallNumber={handleCallNumber}
            onResetGame={handleResetGame}
            onChangeCallerMode={handleChangeCallerMode}
            onChangeCaller={changeCaller}
            onPauseMachine={pauseMachine}
            onResumeMachine={resumeMachine}
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
