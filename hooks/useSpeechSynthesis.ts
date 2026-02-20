import { useState, useEffect, useCallback } from "react";

// Global flag to track if speech has been initialized with user gesture
// This needs to be shared across all hook instances
let globalHasUserGesture = false;

export function useSpeechSynthesis() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Initialize and load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Initialize on user gesture
  const initialize = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    console.log("[useSpeechSynthesis] Initializing speech synthesis");

    // Dummy utterance to "unlock" speech on Safari
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);

    // Update global state
    globalHasUserGesture = true;
    setIsInitialized(true);
  }, []);

  // Speak function with Safari fixes
  const speak = useCallback(
    (
      text: string,
      lang: string = "vi-VN",
      requireUserGesture: boolean = true,
    ) => {
      if (!("speechSynthesis" in window)) {
        console.warn("[useSpeechSynthesis] speechSynthesis not supported");
        return false;
      }

      // Check if user gesture is required and available (use global state)
      if (requireUserGesture && !globalHasUserGesture) {
        console.warn(
          "[useSpeechSynthesis] Speech requires user gesture. Call initialize() first from a user action.",
        );
        return false;
      }

      console.log(
        "[useSpeechSynthesis] Speaking:",
        text,
        "Lang:",
        lang,
        "Voices available:",
        voices.length,
        "Has user gesture:",
        globalHasUserGesture,
      );

      // Check if paused (Safari bug)
      if (window.speechSynthesis.paused) {
        console.log("[useSpeechSynthesis] Speech was paused, resuming");
        window.speechSynthesis.resume();
      }

      // Cancel ongoing speech
      window.speechSynthesis.cancel();

      // Use setTimeout to avoid cancel() interfering with speak()
      // This is a known Chrome/Safari quirk
      setTimeout(() => {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.2;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to select Vietnamese voice
        const viVoice = voices.find((v) => v.lang.startsWith("vi"));
        if (viVoice) {
          console.log(
            "[useSpeechSynthesis] Using Vietnamese voice:",
            viVoice.name,
          );
          utterance.voice = viVoice;
        } else {
          console.log(
            "[useSpeechSynthesis] No Vietnamese voice found, using default",
          );
        }

        // Add event handlers for debugging
        utterance.onstart = () =>
          console.log("[useSpeechSynthesis] Speech started");
        utterance.onend = () =>
          console.log("[useSpeechSynthesis] Speech ended");
        utterance.onerror = (event) =>
          console.error("[useSpeechSynthesis] Speech error:", event);

        // Speak
        window.speechSynthesis.speak(utterance);
        console.log(
          "[useSpeechSynthesis] speak() called, speaking:",
          window.speechSynthesis.speaking,
          "pending:",
          window.speechSynthesis.pending,
        );
      }, 100);

      return true;
    },
    [voices],
  );

  return {
    speak,
    initialize,
    isInitialized,
    hasUserGesture: globalHasUserGesture, // Return global state
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
  };
}
