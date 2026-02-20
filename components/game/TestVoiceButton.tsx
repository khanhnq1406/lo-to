/**
 * TestVoiceButton - Debug component to test Vietnamese TTS
 * This component helps debug Web Speech API issues
 *
 * Usage: Import and add to any page for debugging
 * <TestVoiceButton />
 */

"use client";

import { useState, useEffect } from "react";
import { useSoundMode, useCurrentNumber, useSoundEnabled } from "@/store/useGameStore";

export function TestVoiceButton() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(false);

  // Get current game state
  const soundMode = useSoundMode();
  const currentNumber = useCurrentNumber();
  const soundEnabled = useSoundEnabled();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check support
    if ("speechSynthesis" in window) {
      setSupported(true);

      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        console.log("Available voices:", availableVoices);
      };

      // Load immediately
      loadVoices();

      // Also listen for voice change event (some browsers load async)
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const testVoice = () => {
    if (!supported) {
      alert("Speech Synthesis not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance("1");
      utterance.lang = "vi-VN";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => console.log("Speech started");
      utterance.onend = () => console.log("Speech ended");
      utterance.onerror = (e) => console.error("Speech error:", e);

      console.log("Testing voice with number: 1");
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const viVoices = voices.filter((v) => v.lang.startsWith("vi"));

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border-2 border-loto-green rounded-lg shadow-lg z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">Voice Test & Debug</h3>

      {/* Test Button */}
      <button
        onClick={testVoice}
        className="px-4 py-2 bg-loto-green text-white rounded mb-2 w-full text-sm"
      >
        Test Voice (1)
      </button>

      {/* Game State */}
      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <p className="font-semibold text-xs mb-1">Current Game State:</p>
        <div className="text-xs text-gray-700">
          <p>Sound Mode: <span className="font-bold">{soundMode}</span></p>
          <p>Sound Enabled: <span className="font-bold">{soundEnabled ? "✅" : "❌"}</span></p>
          <p>Current Number: <span className="font-bold">{currentNumber ?? "None"}</span></p>
        </div>
      </div>

      {/* Voice Info */}
      <div className="text-xs text-gray-600">
        <p>Supported: {supported ? "✅" : "❌"}</p>
        <p>Total voices: {voices.length}</p>
        <p>Vietnamese: {viVoices.length}</p>
        {viVoices.length > 0 && (
          <div className="mt-2 max-h-24 overflow-auto">
            <p className="font-semibold">VI Voices:</p>
            {viVoices.map((v, i) => (
              <p key={i} className="text-xs">
                {v.name} ({v.lang})
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
