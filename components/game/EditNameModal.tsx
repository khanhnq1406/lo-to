/**
 * EditNameModal Component - Modal for editing player name
 *
 * Features:
 * - Input field for new name
 * - Validation (1-50 characters)
 * - Confirm and Cancel buttons
 * - Traditional Vietnamese styling
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Animations with Framer Motion
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';

// ============================================================================
// PROPS
// ============================================================================

interface EditNameModalProps {
  /** Is the modal open? */
  isOpen: boolean;

  /** Current player name */
  currentName: string;

  /** Callback when name is confirmed */
  onConfirm: (newName: string) => void;

  /** Callback when modal is closed */
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EditNameModal({
  isOpen,
  currentName,
  onConfirm,
  onClose,
}: EditNameModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError(null);
    }
  }, [isOpen, currentName]);

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

  // Handle confirm
  const handleConfirm = useCallback(() => {
    const trimmedName = newName.trim();
    const validationError = validateName(trimmedName);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (trimmedName === currentName) {
      // Name hasn't changed, just close
      onClose();
      return;
    }

    onConfirm(trimmedName);
    onClose();
  }, [newName, currentName, validateName, onConfirm, onClose]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [handleConfirm, onClose]
  );

  // Backdrop click handler
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
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
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-name-title"
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
            <div className="flex items-center justify-between p-6 border-b-2 border-loto-green/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-loto-green/10 border-2 border-loto-green">
                  <User className="w-5 h-5 text-loto-green" aria-hidden="true" />
                </div>
                <h2
                  id="edit-name-title"
                  className="text-xl font-bold text-gray-800"
                >
                  Đổi tên
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-loto-green focus:ring-offset-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="player-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Tên mới
                </label>
                <input
                  id="player-name"
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tên của bạn"
                  maxLength={50}
                  autoFocus
                  className={`
                    w-full px-4 py-3 rounded-lg border-2 transition-colors
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
                  {newName.length}/50 ký tự
                </p>
              </div>

              {/* Current name */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Tên hiện tại:</p>
                <p className="font-semibold text-gray-800">{currentName}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-loto-green/20 bg-gray-50 rounded-b-xl">
              <button
                onClick={onClose}
                className="
                  px-4 py-2 rounded-lg font-semibold
                  text-gray-700 bg-white border-2 border-gray-300
                  hover:bg-gray-50 hover:border-gray-400
                  focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                  transition-colors
                "
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="
                  px-4 py-2 rounded-lg font-semibold
                  text-white bg-loto-green border-2 border-loto-green
                  hover:bg-loto-green/90 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-loto-green focus:ring-offset-2
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                disabled={!newName.trim() || newName.trim() === currentName}
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
