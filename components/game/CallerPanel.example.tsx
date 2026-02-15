/**
 * CallerPanel Example Usage
 *
 * This file demonstrates how to use the CallerPanel component
 * and its sub-components in various scenarios.
 */

'use client';

import { CallerPanel } from './CallerPanel';
import { CurrentNumber } from './CurrentNumber';
import { CalledHistory } from './CalledHistory';
import { CallerControls } from './CallerControls';

// ============================================================================
// EXAMPLE 1: Full Caller Panel (Main Usage)
// ============================================================================

/**
 * The main CallerPanel component is the primary way to use this functionality.
 * It automatically connects to Socket.io and Zustand store.
 */
export function FullCallerPanelExample() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-loto-green mb-6">
          Bảng gọi số - Lô Tô Việt Nam
        </h1>

        {/* Main caller panel with all features */}
        <CallerPanel />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Individual Components (Custom Layout)
// ============================================================================

/**
 * You can also use individual components for custom layouts.
 * This is useful if you need a different arrangement or want to
 * hide certain parts of the UI.
 */
export function CustomLayoutExample() {
  // Example state (in real usage, get from Zustand store)
  const currentNumber = 42;
  const calledHistory = [5, 12, 23, 34, 42, 56, 67, 78, 89];
  const gameState = 'playing' as const;
  const callerMode = 'manual' as const;
  const machineInterval = 3000;
  const isHost = true;
  const isCaller = true;

  return (
    <div className="p-6 space-y-6">
      {/* Custom layout: Current number on top */}
      <div className="max-w-2xl mx-auto">
        <CurrentNumber
          currentNumber={currentNumber}
          className="h-64"
        />
      </div>

      {/* Two columns below: History and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalledHistory
            calledNumbers={calledHistory}
            currentNumber={currentNumber}
          />
        </div>

        <div>
          <CallerControls
            gameState={gameState}
            callerMode={callerMode}
            machineInterval={machineInterval}
            isHost={isHost}
            isCaller={isCaller}
            onStartGame={() => console.log('Start game')}
            onCallNumber={() => console.log('Call number')}
            onResetGame={() => console.log('Reset game')}
            onChangeCallerMode={(mode, interval) => console.log('Change mode:', mode, interval)}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Current Number Only (Minimal Display)
// ============================================================================

/**
 * Display only the current number for a minimal, focused view.
 * Useful for a secondary display or projection.
 */
export function CurrentNumberOnlyExample() {
  const currentNumber = 88;

  return (
    <div className="min-h-screen bg-gradient-to-br from-loto-green to-loto-green-light flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <CurrentNumber
          currentNumber={currentNumber}
          className="h-96"
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Called History Only (Viewer Display)
// ============================================================================

/**
 * Display only the called history for viewers who don't need controls.
 * Great for displaying on a large screen for all players to see.
 */
export function HistoryViewerExample() {
  const calledHistory = Array.from({ length: 45 }, (_, i) => i + 1);
  const currentNumber = 45;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-loto-green mb-2">
            Lô Tô Việt Nam
          </h1>
          <p className="text-lg text-gray-600">
            Xem lịch sử các số đã gọi
          </p>
        </div>

        <CalledHistory
          calledNumbers={calledHistory}
          currentNumber={currentNumber}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Mobile Layout
// ============================================================================

/**
 * Optimized layout for mobile devices with vertical stacking.
 */
export function MobileLayoutExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-loto-green text-paper p-4 shadow-lg">
        <h1 className="text-xl font-bold text-center">
          Lô Tô - Bảng gọi số
        </h1>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <CallerPanel />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Host Controls Only
// ============================================================================

/**
 * Display only the controls for the host/caller.
 * Useful for a dedicated control panel.
 */
export function HostControlsOnlyExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-paper to-paper-dark flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-loto-green mb-2">
            Bảng điều khiển
          </h1>
          <p className="text-gray-600">Dành cho chủ phòng</p>
        </div>

        <CallerControls
          gameState="waiting"
          callerMode="machine"
          machineInterval={3000}
          isHost={true}
          isCaller={true}
          onStartGame={() => console.log('Start')}
          onCallNumber={() => console.log('Call')}
          onResetGame={() => console.log('Reset')}
          onChangeCallerMode={(mode, interval) => console.log('Mode:', mode, interval)}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Waiting State
// ============================================================================

/**
 * Display when game is in waiting state (no number called yet).
 */
export function WaitingStateExample() {
  return (
    <div className="p-6 space-y-6">
      <CurrentNumber
        currentNumber={null}
        className="h-64"
      />

      <CalledHistory
        calledNumbers={[]}
        currentNumber={null}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Game Finished State
// ============================================================================

/**
 * Display when game is finished (all 90 numbers called).
 */
export function GameFinishedExample() {
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-loto-gold-light to-loto-gold flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-loto-green">
            Trò chơi đã kết thúc!
          </h1>
          <p className="text-xl text-loto-green/80">
            Tất cả 90 số đã được gọi
          </p>
        </div>

        <CalledHistory
          calledNumbers={allNumbers}
          currentNumber={90}
        />
      </div>
    </div>
  );
}

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * INTEGRATION TIPS:
 *
 * 1. Socket.io Integration:
 *    - CallerPanel automatically uses useSocket() hook
 *    - No manual event handling needed
 *    - Socket events are handled internally
 *
 * 2. State Management:
 *    - All state comes from Zustand store
 *    - Use provided selector hooks (useGameState, useCurrentNumber, etc.)
 *    - State updates automatically when server sends events
 *
 * 3. Permissions:
 *    - Host: Can start game, reset, change modes
 *    - Caller: Can call numbers in manual mode
 *    - Regular players: Can only view
 *
 * 4. Responsive Design:
 *    - All components are fully responsive
 *    - Mobile-first design with breakpoints
 *    - Use className prop to customize sizing
 *
 * 5. Accessibility:
 *    - All components have proper ARIA labels
 *    - Keyboard navigation supported
 *    - Screen reader friendly
 *
 * 6. Sound Effects:
 *    - Beep plays when number is called
 *    - Respects soundEnabled setting from store
 *    - Uses Web Audio API for best performance
 *
 * 7. Animations:
 *    - Framer Motion for smooth transitions
 *    - Scale and fade effects on number changes
 *    - Pulse animation for current number
 *
 * 8. Performance:
 *    - All components use React.memo for optimization
 *    - Minimal re-renders with proper state selectors
 *    - Efficient set operations for called numbers
 */
