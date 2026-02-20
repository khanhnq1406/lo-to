/**
 * useNumberSound - Hook to play sound when numbers are called
 * Supports voice (TTS), beep, and silent modes
 */

import { useEffect, useCallback, useRef } from "react";
import {
  useCurrentNumber,
  useSoundMode,
  useSoundEnabled,
} from "@/store/useGameStore";

export function useNumberSound() {
  const currentNumber = useCurrentNumber();
  const soundMode = useSoundMode();
  const soundEnabled = useSoundEnabled();
  const audioContextRef = useRef<AudioContext | null>(null);

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
  const playVoice = useCallback(
    (number: number) => {
      if (typeof window === "undefined") return;

      try {
        // Check if speech synthesis is supported
        if (!("speechSynthesis" in window)) {
          console.warn("Speech synthesis not supported, falling back to beep");
          playBeep();
          return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Wait a tiny bit for cancel to complete (Chrome quirk)
        setTimeout(() => {
          // Create utterance
          const utterance = new SpeechSynthesisUtterance(number.toString());

          // Configure Vietnamese voice
          utterance.lang = "vi-VN";
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Add error handler
          utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            playBeep();
          };

          // Speak the number
          window.speechSynthesis.speak(utterance);
        }, 50);
      } catch (error) {
        console.error("Error playing voice:", error);
        // Fallback to beep on error
        playBeep();
      }
    },
    [playBeep],
  );

  // Play sound based on mode when current number changes
  useEffect(() => {
    if (currentNumber === null) return;

    // Check sound mode (independent of soundEnabled for backward compatibility)
    if (soundMode === "voice") {
      playVoice(currentNumber);
    } else if (soundMode === "beep") {
      // Only check soundEnabled for beep mode
      if (soundEnabled) {
        playBeep();
      }
    }
    // Silent mode: do nothing
  }, [currentNumber, soundEnabled, soundMode, playVoice, playBeep]);
}
