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
import { useSpeechSynthesis } from "./useSpeechSynthesis";

export function useNumberSound() {
  const currentNumber = useCurrentNumber();
  const soundMode = useSoundMode();
  const soundEnabled = useSoundEnabled();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Speech synthesis hook
  const { speak, hasUserGesture, isSupported: isSpeechSupported } = useSpeechSynthesis();

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
      if (!isSpeechSupported) {
        console.warn("Speech synthesis not supported, falling back to beep");
        playBeep();
        return;
      }

      const success = speak(number.toString(), 'vi-VN');
      if (!success) {
        // Fallback to beep on error
        playBeep();
      }
    },
    [speak, isSpeechSupported, playBeep],
  );

  // Play sound based on mode when current number changes
  useEffect(() => {
    if (currentNumber === null) return;

    // Check sound mode (independent of soundEnabled for backward compatibility)
    if (soundMode === "voice") {
      // Only play voice if we have user gesture (prevents "not-allowed" error)
      if (hasUserGesture) {
        playVoice(currentNumber);
      } else {
        console.warn("[useNumberSound] Cannot play voice without user gesture. User needs to interact with the page first.");
      }
    } else if (soundMode === "beep") {
      // Only check soundEnabled for beep mode
      if (soundEnabled) {
        playBeep();
      }
    }
    // Silent mode: do nothing
  }, [currentNumber, soundEnabled, soundMode, playVoice, playBeep, hasUserGesture]);
}
