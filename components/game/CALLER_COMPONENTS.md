# Caller Panel Components

Complete caller panel and history display components for Vietnamese Lô Tô game (1-90 numbers).

## Overview

This module provides four main components for managing and displaying the number calling functionality:

1. **CallerPanel** - Main container combining all caller features
2. **CurrentNumber** - Large animated display of current number
3. **CalledHistory** - 1-90 number grid showing call history
4. **CallerControls** - Game control buttons (host/caller only)

## Components

### 1. CallerPanel

Main caller control panel that combines all sub-components into a unified interface.

**File:** `CallerPanel.tsx`

**Features:**
- Integrates with Socket.io via `useSocket()` hook
- Reads state from Zustand store automatically
- Responsive layout (stacked mobile, side-by-side desktop)
- Sound effects on number call (Web Audio API)
- Host/caller permission checks
- Automatic game state management

**Props:**
```typescript
interface CallerPanelProps {
  className?: string;  // Optional container className
}
```

**Usage:**
```tsx
import { CallerPanel } from '@/components/game/CallerPanel';

export default function GamePage() {
  return (
    <div className="p-6">
      <CallerPanel />
    </div>
  );
}
```

**Layout:**
- **Top Section:** Current number (2 cols) + Controls (1 col)
- **Bottom Section:** Called history (full width)
- **Mobile:** Vertical stack

---

### 2. CurrentNumber

Large animated display showing the current called number.

**File:** `CurrentNumber.tsx`

**Features:**
- Large, bold number display (1-90)
- Framer Motion animations (scale + fade + rotate)
- Pulse animation for current number
- Gold gradient styling
- "Chờ số..." placeholder when no number
- Decorative corner accents
- Responsive sizing (7xl to 12rem text)

**Props:**
```typescript
interface CurrentNumberProps {
  currentNumber: number | null;  // 1-90, null if none called
  className?: string;             // Optional container className
}
```

**Usage:**
```tsx
import { CurrentNumber } from '@/components/game/CurrentNumber';
import { useCurrentNumber } from '@/store/useGameStore';

export function NumberDisplay() {
  const currentNumber = useCurrentNumber();

  return (
    <CurrentNumber
      currentNumber={currentNumber}
      className="h-96"
    />
  );
}
```

**Styling:**
- Background: Paper gradient with green border
- Number: Gold gradient with text shadow
- Animation: Scale pulse + rotating ring
- Accessibility: `role="status"` + `aria-live="polite"`

---

### 3. CalledHistory

10×9 grid displaying all numbers 1-90 with call status.

**File:** `CalledHistory.tsx`

**Features:**
- 10 columns × 9 rows = 90 cells (authentic format)
- Called numbers: Green highlight
- Uncalled numbers: Gray/disabled
- Current number: Gold highlight with pulse
- Progress bar showing completion
- Statistics (called/remaining counts)
- Smooth animations on state changes
- Responsive grid spacing

**Props:**
```typescript
interface CalledHistoryProps {
  calledNumbers: number[];      // Array of called numbers (1-90)
  currentNumber: number | null;  // Current number for special highlight
  className?: string;             // Optional container className
}
```

**Usage:**
```tsx
import { CalledHistory } from '@/components/game/CalledHistory';
import { useCalledHistory, useCurrentNumber } from '@/store/useGameStore';

export function HistoryBoard() {
  const calledHistory = useCalledHistory();
  const currentNumber = useCurrentNumber();

  return (
    <CalledHistory
      calledNumbers={calledHistory}
      currentNumber={currentNumber}
    />
  );
}
```

**Cell States:**
- **Uncalled:** Gray background, gray text
- **Called:** Green background, white text
- **Current:** Gold background, green text, pulse animation

---

### 4. CallerControls

Game control buttons with host/caller permissions.

**File:** `CallerControls.tsx`

**Features:**
- Start game button (host only, waiting state)
- Call number button (caller only, manual mode)
- Pause/Resume machine mode (host only)
- Reset game button (host only)
- Caller mode selector (machine/manual)
- Machine interval slider (1-60 seconds)
- Permission-based UI visibility
- Status indicator with live state

**Props:**
```typescript
interface CallerControlsProps {
  gameState: GameState;                // 'waiting' | 'playing' | 'finished'
  callerMode: CallerMode;               // 'machine' | 'manual'
  machineInterval: number;              // Milliseconds between calls
  isHost: boolean;                      // Is current user host?
  isCaller: boolean;                    // Is current user caller?
  onStartGame: () => void;              // Start game callback
  onCallNumber: () => void;             // Call number callback
  onResetGame: () => void;              // Reset game callback
  onChangeCallerMode: (mode: CallerMode, interval?: number) => void;
  className?: string;
}
```

**Usage:**
```tsx
import { CallerControls } from '@/components/game/CallerControls';
import { useSocket } from '@/hooks/useSocket';
import { useGameState, useCallerMode, useIsHost, useIsCaller } from '@/store/useGameStore';

export function ControlPanel() {
  const { startGame, callNumber } = useSocket();
  const gameState = useGameState();
  const callerMode = useCallerMode();
  const isHost = useIsHost();
  const isCaller = useIsCaller();

  return (
    <CallerControls
      gameState={gameState}
      callerMode={callerMode}
      machineInterval={3000}
      isHost={isHost}
      isCaller={isCaller}
      onStartGame={startGame}
      onCallNumber={() => callNumber(42)}
      onResetGame={() => console.log('Reset')}
      onChangeCallerMode={(mode, interval) => console.log(mode, interval)}
    />
  );
}
```

**Button Variants:**
- **Primary:** Green gradient (start game, main actions)
- **Secondary:** Gold gradient (call number)
- **Danger:** Red gradient (reset game)

---

## Integration Guide

### Socket.io Integration

The components automatically integrate with Socket.io through the `useSocket()` hook:

```tsx
import { useSocket } from '@/hooks/useSocket';

const {
  startGame,      // Start the game
  callNumber,     // Call a specific number
  changeCallerMode, // Change machine/manual mode
} = useSocket();
```

**Server Events Handled:**
- `number_called` - Updates current number and history
- `game_started` - Changes state to playing
- `game_finished` - Changes state to finished
- `room_update` - Updates all room state

### Zustand Store Integration

All state comes from the Zustand store using optimized selectors:

```tsx
import {
  useGameState,        // 'waiting' | 'playing' | 'finished'
  useCurrentNumber,    // Current number (1-90) or null
  useCalledHistory,    // Array of called numbers
  useIsHost,           // Is current user host?
  useIsCaller,         // Is current user caller?
  useCallerMode,       // 'machine' | 'manual'
  useMachineInterval,  // Milliseconds between calls
  useRemainingNumbers, // Array of uncalled numbers
  useSoundEnabled,     // Sound effects enabled?
} from '@/store/useGameStore';
```

### Sound Effects

The CallerPanel component plays a beep sound when numbers are called:

- Uses Web Audio API for optimal performance
- Respects `soundEnabled` setting from store
- 800Hz sine wave, 0.3s duration
- Automatically initialized and cleaned up

**Manual Sound Control:**
```tsx
const soundEnabled = useSoundEnabled();
const setSoundEnabled = useGameStore(state => state.setSoundEnabled);

// Toggle sound
setSoundEnabled(!soundEnabled);
```

## Styling & Theming

### Color Scheme (Traditional Vietnamese)

```css
/* Defined in tailwind.config.ts */
--loto-green: #2D5016        /* Dark green */
--loto-green-light: #4A7C2C  /* Light green */
--loto-gold: #FFD700         /* Gold */
--loto-gold-light: #FFE44D   /* Light gold */
--loto-gold-dark: #D4AF37    /* Dark gold */
--loto-red: #C41E3A          /* Red */
--paper: #FBF9F4             /* Off-white paper */
--paper-dark: #F5F2EA        /* Dark paper */
```

### Custom Animations

```css
/* Defined in tailwind.config.ts */
animate-pulse-slow   /* 3s pulse for current number */
shadow-loto-ticket   /* Paper ticket shadow */
shadow-loto-ball     /* 3D ball shadow */
shadow-loto-button   /* Button shadow */
```

### Responsive Breakpoints

```
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
```

## Accessibility

All components follow accessibility best practices:

### Semantic HTML
- Proper heading hierarchy
- `role` attributes (region, status, gridcell)
- `aria-label` for icons and actions

### Live Regions
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {/* Current number updates announced to screen readers */}
</div>
```

### Keyboard Navigation
- All buttons are keyboard accessible
- Focus indicators visible
- Tab order logical

### Screen Readers
- Descriptive labels on all interactive elements
- Status updates announced automatically
- Grid cells labeled with number and state

## Performance Optimization

### React.memo
All components use `React.memo` to prevent unnecessary re-renders:

```tsx
export const CallerPanel = memo(function CallerPanel({ ... }) {
  // Component implementation
});
```

### Optimized Selectors
Use specific Zustand selectors to subscribe only to needed state:

```tsx
// Good - Only re-renders when currentNumber changes
const currentNumber = useCurrentNumber();

// Bad - Re-renders on any store change
const store = useGameStore();
const currentNumber = store.room?.currentNumber;
```

### Set Operations
CalledHistory uses Set for O(1) lookup performance:

```tsx
const calledSet = useMemo(
  () => new Set(calledNumbers),
  [calledNumbers]
);
const isCalled = calledSet.has(number); // O(1)
```

## Example Layouts

### Full Panel (Recommended)
```tsx
<CallerPanel />
```

### Custom Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <CurrentNumber currentNumber={42} className="h-96" />
  </div>
  <div>
    <CallerControls {...controlProps} />
  </div>
  <div className="lg:col-span-3">
    <CalledHistory calledNumbers={[1,2,3]} currentNumber={3} />
  </div>
</div>
```

### Viewer Display (No Controls)
```tsx
<div className="space-y-6">
  <CurrentNumber currentNumber={42} className="h-64" />
  <CalledHistory calledNumbers={history} currentNumber={42} />
</div>
```

### Mobile Optimized
```tsx
<div className="min-h-screen bg-gray-50">
  <header className="sticky top-0 z-10 bg-loto-green text-paper p-4">
    <h1 className="text-xl font-bold">Lô Tô - Bảng gọi số</h1>
  </header>
  <main className="p-4">
    <CallerPanel />
  </main>
</div>
```

## Testing

### Unit Tests Example
```tsx
import { render, screen } from '@testing-library/react';
import { CurrentNumber } from './CurrentNumber';

test('displays current number', () => {
  render(<CurrentNumber currentNumber={42} />);
  expect(screen.getByText('42')).toBeInTheDocument();
});

test('displays waiting state', () => {
  render(<CurrentNumber currentNumber={null} />);
  expect(screen.getByText('Chờ số...')).toBeInTheDocument();
});
```

### Integration Tests Example
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CallerPanel } from './CallerPanel';

test('host can start game', () => {
  const { container } = render(<CallerPanel />);
  const startButton = screen.getByText('Bắt đầu chơi');
  fireEvent.click(startButton);
  // Assert game started
});
```

## Troubleshooting

### Number not updating
- Check Socket.io connection: `useSocket().connected`
- Verify `number_called` event is received
- Check Zustand store state with React DevTools

### Sound not playing
- Check `soundEnabled` setting in store
- Verify browser Audio API support
- Check browser autoplay policies (user interaction required)

### Controls not visible
- Verify `isHost` or `isCaller` flags
- Check game state (some controls hidden in certain states)
- Ensure Socket.io connection established

### Layout issues on mobile
- Use responsive classes: `h-64 sm:h-80 lg:h-96`
- Test at different breakpoints
- Check container padding/margins

## Related Files

- **Types:** `/types/index.ts` - TypeScript definitions
- **Store:** `/store/useGameStore.ts` - Zustand state
- **Socket:** `/hooks/useSocket.ts` - Socket.io integration
- **Examples:** `CallerPanel.example.tsx` - Usage examples
- **Config:** `/tailwind.config.ts` - Styling configuration

## License

Part of Vietnamese Lô Tô Game project.
