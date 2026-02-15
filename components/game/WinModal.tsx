/**
 * Win Modal Component
 * Celebration modal displayed when a player wins
 *
 * FEATURES:
 * - Shows winner name and win details
 * - Confetti animation using canvas-confetti
 * - Win sound effect using Web Audio API
 * - Traditional Vietnamese styling
 * - Framer Motion animations
 * - "Chơi Lại" (Play Again) button for host
 * - Displays winning card and row
 * - Backdrop overlay
 *
 * USAGE:
 * ```tsx
 * <WinModal
 *   winner={winner}
 *   isHost={isHost}
 *   onPlayAgain={handlePlayAgain}
 * />
 * ```
 */

"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { WinResult, Card } from "@/types";
import { Trophy, Sparkles, RefreshCw } from "lucide-react";

/**
 * Component props
 */
export interface WinModalProps {
  /** Winner information (null if no winner) */
  winner: WinResult | null;

  /** Is current player the host? */
  isHost: boolean;

  /** Callback when Play Again button clicked (host only) */
  onPlayAgain?: () => void;

  /** The winning card (optional, for display) */
  winningCard?: Card;

  /** Sound enabled flag */
  soundEnabled?: boolean;
}

/**
 * Win Modal Component
 */
export function WinModal({
  winner,
  isHost,
  onPlayAgain,
  winningCard,
  soundEnabled = true,
}: WinModalProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedSoundRef = useRef(false);

  // Play confetti and sound when winner is declared
  useEffect(() => {
    if (!winner) {
      hasPlayedSoundRef.current = false;
      return;
    }

    // Play confetti animation
    playConfetti();

    // Play win sound
    if (soundEnabled && !hasPlayedSoundRef.current) {
      playWinSound();
      hasPlayedSoundRef.current = true;
    }
  }, [winner, soundEnabled]);

  /**
   * Plays confetti animation
   */
  const playConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch confetti from two sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#D4AF37", "#FFD700", "#FFA500", "#FF6347", "#DC143C"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#D4AF37", "#FFD700", "#FFA500", "#FF6347", "#DC143C"],
      });
    }, 250);
  };

  /**
   * Plays win sound using Web Audio API
   * Creates a triumphant chord progression
   */
  const playWinSound = () => {
    try {
      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Define notes for a triumphant chord (C major 7th)
      const frequencies = [261.63, 329.63, 392.0, 493.88]; // C4, E4, G4, B4

      frequencies.forEach((freq, index) => {
        // Create oscillator
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Configure oscillator
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, now);

        // Configure envelope (ADSR)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05); // Attack
        gainNode.gain.linearRampToValueAtTime(0.07, now + 0.1); // Decay
        gainNode.gain.setValueAtTime(0.07, now + 0.5); // Sustain
        gainNode.gain.linearRampToValueAtTime(0, now + 0.8); // Release

        // Start and stop
        oscillator.start(now + index * 0.05);
        oscillator.stop(now + 0.8);
      });

      // Add a final high note for flourish
      const finalOscillator = ctx.createOscillator();
      const finalGain = ctx.createGain();

      finalOscillator.connect(finalGain);
      finalGain.connect(ctx.destination);

      finalOscillator.type = "sine";
      finalOscillator.frequency.setValueAtTime(523.25, now + 0.3); // C5

      finalGain.gain.setValueAtTime(0, now + 0.3);
      finalGain.gain.linearRampToValueAtTime(0.15, now + 0.35);
      finalGain.gain.linearRampToValueAtTime(0, now + 0.9);

      finalOscillator.start(now + 0.3);
      finalOscillator.stop(now + 0.9);
    } catch (error) {
      console.error("[WinModal] Error playing win sound:", error);
    }
  };

  /**
   * Gets display text for win type
   */
  const getWinTypeText = (type: string): string => {
    switch (type) {
      case "row":
        return "Hoàn thành 1 hàng!";
      case "twoRows":
        return "Hoàn thành 2 hàng!";
      case "fourCorners":
        return "Hoàn thành 4 góc!";
      case "fullBoard":
        return "Hoàn thành toàn bộ!";
      default:
        return "Chiến thắng!";
    }
  };

  // Don't render if no winner
  if (!winner) {
    return null;
  }

  return (
    <AnimatePresence>
      {winner && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl border-4 border-amber-400 max-w-md w-full p-8 relative overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-600 rounded-full translate-x-1/2 translate-y-1/2" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Trophy icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <Trophy className="w-20 h-20 text-amber-500 drop-shadow-lg" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-center text-amber-900 mb-2"
                >
                  Chúc Mừng! 🎊
                </motion.h2>

                {/* Winner name */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-semibold text-center text-amber-800 mb-4"
                >
                  {winner.playerName}
                </motion.p>

                {/* Win type */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border-2 border-amber-300"
                >
                  <p className="text-lg font-medium text-center text-amber-900">
                    {getWinTypeText(winner.type)}
                  </p>

                  {/* Card and row info */}
                  {winner.cardIndex !== undefined && (
                    <p className="text-sm text-center text-amber-700 mt-2">
                      Phiếu dò số {winner.cardIndex + 1}
                      {winner.rowIndex !== undefined &&
                        ` - Hàng ${winner.rowIndex + 1}`}
                    </p>
                  )}
                </motion.div>

                {/* Winning card display (if provided) */}
                {winningCard && winner.rowIndex !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/60 rounded-lg p-3 mb-6 border border-amber-200"
                  >
                    <p className="text-xs font-medium text-amber-800 mb-2 text-center">
                      Hàng chiến thắng:
                    </p>
                    <div className="flex justify-center gap-2">
                      {winningCard[winner.rowIndex]?.map(
                        (cell, idx) =>
                          cell !== null && (
                            <div
                              key={idx}
                              className="w-10 h-10 bg-amber-400 text-amber-900 font-bold rounded flex items-center justify-center text-sm shadow-md"
                            >
                              {cell}
                            </div>
                          ),
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Play Again button (host only) */}
                {isHost && onPlayAgain && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={onPlayAgain}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Chơi Lại
                  </motion.button>
                )}

                {/* Non-host message */}
                {!isHost && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center text-sm text-amber-700 italic"
                  >
                    Chờ chủ phòng bắt đầu ván mới...
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Default export
 */
export default WinModal;
