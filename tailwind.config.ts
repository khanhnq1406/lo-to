import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vietnamese Lô Tô traditional colors
        paper: {
          DEFAULT: "#FBF9F4", // Off-white paper color
          dark: "#F5F2EA",
          darker: "#EBE7DC",
        },
        loto: {
          green: {
            DEFAULT: "#2D5016", // Traditional dark green
            light: "#4A7C2C",
            border: "#1F3810",
          },
          red: {
            DEFAULT: "#C41E3A", // Traditional Vietnamese red
            light: "#E63946",
            dark: "#A01626",
          },
          gold: {
            DEFAULT: "#FFD700",
            light: "#FFE44D",
            dark: "#D4AF37",
          },
          blue: {
            DEFAULT: "#1E3A8A",
            light: "#3B82F6",
            dark: "#1E40AF",
          },
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        vietnam: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "ball-bounce": "ballBounce 0.6s ease-out",
        "ticket-flip": "ticketFlip 0.8s ease-in-out",
        "number-pop": "numberPop 0.4s ease-out",
        "confetti": "confetti 3s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        ballBounce: {
          "0%": { transform: "translateY(-100px) scale(0)", opacity: "0" },
          "50%": { transform: "translateY(0) scale(1.1)", opacity: "1" },
          "70%": { transform: "translateY(-20px) scale(0.95)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        ticketFlip: {
          "0%": { transform: "perspective(400px) rotateY(0)" },
          "100%": { transform: "perspective(400px) rotateY(360deg)" },
        },
        numberPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
      },
      boxShadow: {
        "loto-ticket": "0 4px 6px rgba(45, 80, 22, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        "loto-ball": "0 10px 25px rgba(0, 0, 0, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.1)",
        "loto-button": "0 2px 8px rgba(45, 80, 22, 0.3)",
      },
      borderWidth: {
        "3": "3px",
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};

export default config;
