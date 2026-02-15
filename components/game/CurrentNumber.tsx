/**
 * CurrentNumber Component - Large animated display of current called number
 *
 * Features:
 * - Large, bold number display (1-90)
 * - Framer Motion entrance animations (scale + fade)
 * - Traditional Vietnamese styling with green/gold colors
 * - Shows "Chờ số..." placeholder when no number called
 * - Pulse animation for current number
 * - Responsive sizing
 */

"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// PROPS
// ============================================================================

interface CurrentNumberProps {
  /** Current number being called (1-90), null if none called yet */
  currentNumber: number | null;

  /** Hide the number (for manual mode where caller reads it) */
  hideNumber?: boolean;

  /** Show generate button for caller in manual mode */
  showGenerateButton?: boolean;

  /** Callback when generate button clicked */
  onGenerateNumber?: () => void;

  /** Optional className for container */
  className?: string;

  /** Allow user to collapse/expand the component */
  collapsible?: boolean;

  /** Initial collapsed state (if collapsible) */
  defaultCollapsed?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CurrentNumber = memo(function CurrentNumber({
  currentNumber,
  hideNumber = false,
  showGenerateButton = false,
  onGenerateNumber,
  className = "",
  collapsible = false,
  defaultCollapsed = true,
}: CurrentNumberProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div
      className={`
        relative
        flex items-center justify-center
        bg-gradient-to-br from-paper via-paper-dark to-paper-darker
        border-4 border-loto-green
        shadow-loto-ticket
        overflow-hidden
        transition-all duration-300
        ${isCollapsed ? "h-12 rounded-lg" : `rounded-2xl ${className}`}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Toggle button (if collapsible) */}
      {collapsible && (
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            absolute top-2 right-2 z-20
            ${isCollapsed ? "w-6 h-6" : "w-8 h-8"}
            flex items-center justify-center
            bg-loto-green/20 hover:bg-loto-green/30
            border-2 border-loto-green
            rounded-lg
            transition-all
          `}
          aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          <motion.svg
            className={`${isCollapsed ? "w-4 h-4" : "w-5 h-5"} text-loto-green`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </motion.button>
      )}

      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Number display */}
      {!isCollapsed && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {currentNumber !== null ? (
              <motion.div
                key={currentNumber}
                initial={{ scale: 0, opacity: 0, rotateY: -180 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotateY: 0,
                }}
                exit={{ scale: 0, opacity: 0, rotateY: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="flex flex-col items-center justify-center w-full"
              >
                {hideNumber ? (
                  <>
                    {/* Hidden number indicator */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                      text-6xl sm:text-7xl md:text-8xl lg:text-9xl
                      font-extrabold
                      text-transparent
                      bg-clip-text
                      bg-gradient-to-br from-loto-gold via-loto-gold-light to-loto-gold-dark
                      drop-shadow-lg
                    "
                    >
                      ?
                    </motion.div>

                    {/* Label */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="
                      mt-1 sm:mt-2
                      text-base sm:text-lg md:text-xl
                      font-bold
                      text-loto-green
                      tracking-wider
                      text-center
                    "
                    >
                      CHỜ NGƯỜI GỌI CÔNG BỐ
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Number */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                      text-6xl sm:text-7xl md:text-8xl lg:text-9xl
                      font-extrabold
                      text-transparent
                      bg-clip-text
                      bg-gradient-to-br from-loto-gold via-loto-gold-light to-loto-gold-dark
                      drop-shadow-lg
                    "
                      style={{
                        textShadow: "2px 2px 4px rgba(45, 80, 22, 0.3)",
                      }}
                    >
                      {currentNumber}
                    </motion.div>

                    {/* Label */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="
                      mt-1 sm:mt-2
                      text-base sm:text-lg md:text-xl
                      font-bold
                      text-loto-green
                      tracking-wider
                    "
                    >
                      SỐ HIỆN TẠI
                    </motion.div>

                    {/* Generate button for caller */}
                    {showGenerateButton && onGenerateNumber && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={onGenerateNumber}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="
                        mt-3 sm:mt-4
                        px-4 py-2 sm:px-6 sm:py-3
                        bg-gradient-to-br from-loto-green to-loto-green-light
                        text-paper
                        font-bold text-sm sm:text-base
                        rounded-lg
                        shadow-loto-button
                        hover:from-loto-green-light hover:to-loto-green
                        transition-all
                        flex items-center gap-2
                      "
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
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
                        Gọi số mới
                      </motion.button>
                    )}
                  </>
                )}

                {/* Pulse ring animation */}
                <motion.div
                  className="
                  absolute
                  inset-0
                  border-4 border-loto-gold
                  rounded-2xl
                  pointer-events-none
                "
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                  duration: 0.3,
                }}
                className="flex flex-col items-center justify-center h-full"
              >
                {/* Waiting icon */}
                <motion.svg
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 text-loto-green/50 mb-2 sm:mb-3 md:mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </motion.svg>

                {/* Waiting text */}
                <motion.div
                  className="
                  text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                  font-bold
                  text-loto-green
                "
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Chờ số...
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="
                  mt-1 sm:mt-2 md:mt-4
                  text-sm sm:text-base md:text-lg lg:text-xl
                  text-loto-green/70
                  text-center
                "
                >
                  Đang chờ bắt đầu
                </motion.div>

                {/* Generate button for caller - show even when no number called */}
                {showGenerateButton && onGenerateNumber && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={onGenerateNumber}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                    mt-3 sm:mt-4
                    px-4 py-2 sm:px-6 sm:py-3
                    bg-gradient-to-br from-loto-green to-loto-green-light
                    text-paper
                    font-bold text-sm sm:text-base
                    rounded-lg
                    shadow-loto-button
                    hover:from-loto-green-light hover:to-loto-green
                    transition-all
                    flex items-center gap-2
                  "
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                    Gọi số mới
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Collapsed state - show compact version */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-10 w-full h-full flex items-center justify-between px-3"
        >
          <div className="flex items-center gap-2">
            {currentNumber !== null ? (
              <>
                <div
                  className="
                  text-xl font-extrabold
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-br from-loto-gold via-loto-gold-light to-loto-gold-dark
                "
                >
                  {hideNumber ? "?" : currentNumber}
                </div>
                <div className="text-xs font-bold text-loto-green">
                  {hideNumber ? "Chờ công bố" : "Số hiện tại"}
                </div>
              </>
            ) : (
              <div className="text-xs font-bold text-loto-green/70">
                Chờ số...
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-loto-gold rounded-tl-lg" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-loto-gold rounded-tr-lg" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-loto-gold rounded-bl-lg" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-loto-gold rounded-br-lg" />
    </div>
  );
});
