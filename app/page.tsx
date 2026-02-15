/**
 * Home Page - Vietnamese Lô Tô Game
 * Landing page with room creation and join functionality
 *
 * FEATURES:
 * - Hero section with traditional Vietnamese styling
 * - Create new room form with validation
 * - Join existing room form
 * - Game instructions (collapsible)
 * - Dark mode toggle
 * - Responsive layout (mobile-first)
 * - Framer Motion page transitions
 * - Form validation with Zod
 * - Loading states during room operations
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useSocket } from '@/providers/SocketProvider';
import { useGameStore } from '@/store/useGameStore';
import { Sun, Moon, ChevronDown, ChevronUp, Users, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createRoomSchema = z.object({
  playerName: z
    .string()
    .min(1, 'Tên người chơi không được để trống')
    .max(20, 'Tên người chơi tối đa 20 ký tự')
    .trim(),
});

const joinRoomSchema = z.object({
  roomId: z
    .string()
    .length(6, 'Mã phòng phải có 6 ký tự')
    .regex(/^[A-Za-z0-9]+$/, 'Mã phòng chỉ chứa chữ và số'),
  playerName: z
    .string()
    .min(1, 'Tên người chơi không được để trống')
    .max(20, 'Tên người chơi tối đa 20 ký tự')
    .trim(),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;
type JoinRoomForm = z.infer<typeof joinRoomSchema>;

// ============================================================================
// HOME PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const router = useRouter();
  const { connected, connecting, createRoom, joinRoom } = useSocket();
  const room = useGameStore((state) => state.room);
  const darkMode = useGameStore((state) => state.darkMode);
  const toggleDarkMode = useGameStore((state) => state.toggleDarkMode);
  const error = useGameStore((state) => state.error);

  // Form state
  const [createForm, setCreateForm] = useState<CreateRoomForm>({
    playerName: '',
  });
  const [joinForm, setJoinForm] = useState<JoinRoomForm>({
    roomId: '',
    playerName: '',
  });

  // UI state
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [joinErrors, setJoinErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Redirect to room when joined
  useEffect(() => {
    if (room?.id) {
      router.push(`/room/${room.id}`);
    }
  }, [room?.id, router]);

  // ===========================
  // FORM HANDLERS
  // ===========================

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrors({});

    try {
      // Validate form
      const validated = createRoomSchema.parse(createForm);

      setIsCreating(true);

      // Create room via socket (cardCount = 0, cards will be selected later)
      createRoom(validated.playerName, 0);

      // Room will redirect automatically when created
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setCreateErrors(errors);
      }
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinErrors({});

    try {
      // Validate form
      const validated = joinRoomSchema.parse(joinForm);

      setIsJoining(true);

      // Join room via socket (cardCount = 0, cards will be selected later)
      joinRoom(validated.roomId.toUpperCase(), validated.playerName, 0);

      // Room will redirect automatically when joined
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setJoinErrors(errors);
      }
      setIsJoining(false);
    }
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-paper text-gray-900'
      )}
    >
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className={cn(
            'p-3 rounded-full transition-all duration-300 shadow-lg',
            darkMode
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          )}
          aria-label={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h1
            className={cn(
              'text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-vietnam tracking-tight',
              darkMode
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-loto-red-light to-loto-gold'
                : 'text-loto-green'
            )}
          >
            Lô Tô Việt Nam
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-loto-red font-vietnam font-medium">
            Trò chơi truyền thống Tết Nguyên Đán
          </p>

          {/* Vietnamese Flag Colors Accent */}
          <div className="flex justify-center gap-6 mt-8">
            <div className="w-16 h-4 bg-loto-red rounded-full shadow-lg"></div>
            <div className="w-16 h-4 bg-loto-gold rounded-full shadow-lg"></div>
          </div>
        </motion.div>

        {/* Connection Status */}
        {connecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'text-center py-3 px-4 rounded-lg mb-6',
              darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'
            )}
          >
            Đang kết nối đến máy chủ...
          </motion.div>
        )}

        {!connected && !connecting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'text-center py-3 px-4 rounded-lg mb-6',
              darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
            )}
          >
            Không thể kết nối đến máy chủ. Vui lòng thử lại.
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'text-center py-3 px-4 rounded-lg mb-6',
              darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'
            )}
          >
            {error}
          </motion.div>
        )}

        {/* Forms Section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16 lg:mb-20">
          {/* Create Room Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className={cn(
                'rounded-2xl p-8 shadow-loto-ticket border-3 transition-all duration-300 hover:shadow-xl',
                darkMode
                  ? 'bg-gray-800 border-loto-green-light'
                  : 'bg-white border-loto-green'
              )}
            >
              <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-loto-green flex items-center gap-3">
                <Play size={32} />
                Tạo Phòng Mới
              </h2>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                {/* Player Name */}
                <div>
                  <label
                    htmlFor="create-name"
                    className={cn(
                      'block text-sm font-semibold mb-2',
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    )}
                  >
                    Tên người chơi *
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={createForm.playerName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, playerName: e.target.value })
                    }
                    className={cn(
                      'w-full px-4 py-3 text-lg rounded-lg border-2 transition-all duration-200',
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-loto-green-light'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-loto-green',
                      createErrors.playerName && 'border-red-500'
                    )}
                    placeholder="Nhập tên của bạn"
                    maxLength={20}
                    required
                  />
                  {createErrors.playerName && (
                    <p className="text-red-500 text-sm mt-1">{createErrors.playerName}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!connected || isCreating}
                  className={cn(
                    'w-full py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 shadow-loto-button',
                    !connected || isCreating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-loto-green hover:bg-loto-green-light hover:shadow-xl active:scale-98 cursor-pointer'
                  )}
                >
                  {isCreating ? 'Đang tạo phòng...' : 'Tạo Phòng Mới'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Join Room Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className={cn(
                'rounded-2xl p-8 shadow-loto-ticket border-3 transition-all duration-300 hover:shadow-xl',
                darkMode
                  ? 'bg-gray-800 border-loto-green-light'
                  : 'bg-white border-loto-green'
              )}
            >
              <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-loto-green flex items-center gap-3">
                <Users size={32} />
                Tham Gia Phòng
              </h2>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                {/* Room ID */}
                <div>
                  <label
                    htmlFor="join-room-id"
                    className={cn(
                      'block text-sm font-semibold mb-2',
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    )}
                  >
                    Mã phòng (6 ký tự) *
                  </label>
                  <input
                    id="join-room-id"
                    type="text"
                    value={joinForm.roomId}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, roomId: e.target.value.toUpperCase() })
                    }
                    className={cn(
                      'w-full px-4 py-3 text-lg rounded-lg border-2 transition-all duration-200 uppercase font-mono',
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-loto-green-light'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-loto-green',
                      joinErrors.roomId && 'border-red-500'
                    )}
                    placeholder="ABC123"
                    maxLength={6}
                    required
                  />
                  {joinErrors.roomId && (
                    <p className="text-red-500 text-sm mt-1">{joinErrors.roomId}</p>
                  )}
                </div>

                {/* Player Name */}
                <div>
                  <label
                    htmlFor="join-name"
                    className={cn(
                      'block text-sm font-semibold mb-2',
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    )}
                  >
                    Tên người chơi *
                  </label>
                  <input
                    id="join-name"
                    type="text"
                    value={joinForm.playerName}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, playerName: e.target.value })
                    }
                    className={cn(
                      'w-full px-4 py-3 text-lg rounded-lg border-2 transition-all duration-200',
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-loto-green-light'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-loto-green',
                      joinErrors.playerName && 'border-red-500'
                    )}
                    placeholder="Nhập tên của bạn"
                    maxLength={20}
                    required
                  />
                  {joinErrors.playerName && (
                    <p className="text-red-500 text-sm mt-1">{joinErrors.playerName}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!connected || isJoining}
                  className={cn(
                    'w-full py-4 rounded-lg font-bold text-white text-lg transition-all duration-200 shadow-loto-button',
                    !connected || isJoining
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-loto-blue hover:bg-loto-blue-light hover:shadow-xl active:scale-98 cursor-pointer'
                  )}
                >
                  {isJoining ? 'Đang tham gia...' : 'Tham Gia Phòng'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Instructions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div
            className={cn(
              'rounded-2xl p-8 shadow-loto-ticket border-3 transition-all duration-300 hover:shadow-xl',
              darkMode
                ? 'bg-gray-800 border-loto-green-light'
                : 'bg-white border-loto-green'
            )}
          >
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-loto-green">
                Hướng Dẫn Chơi
              </h2>
              {showInstructions ? (
                <ChevronUp size={28} className="text-loto-green" />
              ) : (
                <ChevronDown size={28} className="text-loto-green" />
              )}
            </button>

            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                <div
                  className={cn(
                    'p-4 rounded-lg',
                    darkMode ? 'bg-gray-700' : 'bg-paper-dark'
                  )}
                >
                  <h3 className="font-bold text-lg mb-2 text-loto-red">
                    1. Cấu trúc vé số
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    • Mỗi vé có 3 hàng × 9 cột = 27 ô<br />
                    • Mỗi vé chứa 15 số (từ 1 đến 90) và 12 ô trống<br />
                    • Mỗi hàng có đúng 5 số và 4 ô trống<br />
                    • Các số được sắp xếp tăng dần trong mỗi cột
                  </p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-lg',
                    darkMode ? 'bg-gray-700' : 'bg-paper-dark'
                  )}
                >
                  <h3 className="font-bold text-lg mb-2 text-loto-red">
                    2. Phân bổ số theo cột
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    • Cột 1: Số 1-9<br />
                    • Cột 2: Số 10-19<br />
                    • Cột 3: Số 20-29<br />
                    • ... và tiếp tục ...<br />
                    • Cột 9: Số 80-90
                  </p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-lg',
                    darkMode ? 'bg-gray-700' : 'bg-paper-dark'
                  )}
                >
                  <h3 className="font-bold text-lg mb-2 text-loto-red">
                    3. Cách chơi
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    • Máy hoặc người điều khiển sẽ gọi số ngẫu nhiên từ 1-90<br />
                    • Đánh dấu số trên vé của bạn khi nó được gọi<br />
                    • Người đầu tiên hoàn thành 1 hàng (5 số) sẽ thắng<br />
                    • Nhấn nút "Thắng" để xác nhận chiến thắng
                  </p>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-lg',
                    darkMode ? 'bg-gray-700' : 'bg-paper-dark'
                  )}
                >
                  <h3 className="font-bold text-lg mb-2 text-loto-red">
                    4. Điều kiện thắng
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    • <strong>Thắng 1 hàng:</strong> Hoàn thành tất cả 5 số trong 1 hàng bất kỳ<br />
                    • Người đầu tiên hoàn thành sẽ là người chiến thắng<br />
                    • Trò chơi kết thúc sau khi có người thắng
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
