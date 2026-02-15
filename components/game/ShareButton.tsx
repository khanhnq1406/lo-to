/**
 * ShareButton Component - Copy Room URL to Clipboard
 *
 * Provides a button to copy the room URL to clipboard with:
 * - Copy icon with smooth animation
 * - Success feedback (check icon + visual state)
 * - Toast/feedback notification
 * - Accessible button with ARIA labels
 *
 * Features:
 * - Traditional Vietnamese styling
 * - Automatic feedback reset after 2 seconds
 * - Error handling for clipboard API
 * - Success animation
 * - Responsive design
 */

'use client';

import { memo, useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// PROPS
// ============================================================================

interface ShareButtonProps {
  /** Room ID to share */
  roomId: string;

  /** Optional custom URL base (defaults to window.location.origin) */
  baseUrl?: string;

  /** Optional className for styling */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ShareButton = memo(function ShareButton({
  roomId,
  baseUrl,
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  /**
   * Handle copy to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      // Build room URL
      const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      const roomUrl = `${base}/room/${roomId}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(roomUrl);

      // Show success state
      setCopied(true);
      setShowToast(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Could show error toast here if needed
    }
  }, [roomId, baseUrl]);

  return (
    <>
      {/* Copy button */}
      <motion.button
        onClick={handleCopy}
        disabled={copied}
        className={`
          relative inline-flex items-center gap-2 px-4 py-2 rounded-lg
          font-semibold text-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-loto-green focus:ring-offset-2
          ${copied
            ? 'bg-green-500 text-white cursor-default'
            : 'bg-loto-green text-white hover:bg-loto-green-dark active:scale-95'
          }
          ${className}
        `}
        whileTap={!copied ? { scale: 0.95 } : {}}
        aria-label={copied ? 'Đã sao chép link phòng' : 'Sao chép link phòng'}
        title={copied ? 'Đã sao chép!' : 'Sao chép link phòng để chia sẻ'}
      >
        {/* Icon with animation */}
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check className="w-4 h-4" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text */}
        <span>{copied ? 'Đã sao chép!' : 'Chia sẻ phòng'}</span>
      </motion.button>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-4 right-4 z-50 pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-xl border-2 border-green-500">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500 rounded-full">
                <Check className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Đã sao chép link phòng!
                </p>
                <p className="text-sm text-gray-600">
                  Gửi link cho bạn bè để tham gia
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
