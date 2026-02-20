/**
 * JoinRoomNameModal Component - Modal for entering name when joining via link
 *
 * Features:
 * - Input field for player name
 * - Validation (1-50 characters)
 * - Join button
 * - Traditional Vietnamese styling
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Animations with Framer Motion
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogIn } from 'lucide-react';

// ============================================================================
// PROPS
// ============================================================================

interface JoinRoomNameModalProps {
  /** Is the modal open? */
  isOpen: boolean;

  /** Room ID being joined */
  roomId: string;

  /** Callback when join is confirmed with name */
  onJoin: (playerName: string) => void;

  /** Error message to display */
  errorMessage?: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function JoinRoomNameModal({
  isOpen,
  roomId,
  onJoin,
  errorMessage,
}: JoinRoomNameModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Update local error when external error changes
  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  // Handle name validation
  const validateName = useCallback((name: string): string | null => {
    if (!name.trim()) {
      return 'Tên không được để trống';
    }
    if (name.trim().length < 1) {
      return 'Tên phải có ít nhất 1 ký tự';
    }
    if (name.length > 50) {
      return 'Tên không được quá 50 ký tự';
    }
    return null;
  }, []);

  // Handle join
  const handleJoin = useCallback(() => {
    const trimmedName = playerName.trim();
    const validationError = validateName(trimmedName);

    if (validationError) {
      setError(validationError);
      return;
    }

    onJoin(trimmedName);
  }, [playerName, validateName, onJoin]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleJoin();
      }
    },
    [handleJoin]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-room-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-paper rounded-xl border-2 border-loto-green shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center p-6 border-b-2 border-loto-green/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-loto-green/10 border-2 border-loto-green">
                  <LogIn className="w-6 h-6 text-loto-green" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="join-room-title"
                    className="text-xl font-bold text-gray-800"
                  >
                    Tham gia phòng
                  </h2>
                  <p className="text-sm text-gray-600">Mã phòng: {roomId}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="player-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tên của bạn
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <input
                    id="player-name"
                    type="text"
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tên của bạn"
                    maxLength={50}
                    autoFocus
                    className={`
                      w-full pl-11 pr-4 py-3 rounded-lg border-2 transition-colors
                      focus:outline-none focus:ring-2 focus:ring-loto-green focus:ring-offset-2
                      ${
                        error
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 bg-white hover:border-loto-green/50'
                      }
                    `}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'name-error' : undefined}
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id="name-error"
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                  >
                    {error}
                  </motion.p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {playerName.length}/50 ký tự
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-blue-800">
                    Tên của bạn sẽ hiển thị cho những người chơi khác trong phòng.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center p-6 border-t-2 border-loto-green/20 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleJoin}
                className="
                  w-full px-6 py-3 rounded-lg font-bold text-lg
                  text-white bg-loto-green border-2 border-loto-green
                  hover:bg-loto-green/90 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-loto-green focus:ring-offset-2
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-95
                "
                disabled={!playerName.trim()}
              >
                Tham gia phòng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
