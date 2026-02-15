# Win Detection and Celebration System

Complete guide to implementing automatic win detection and celebration UI in the Vietnamese Lô Tô game.

## Overview

The win detection system consists of three main parts:

1. **`/lib/winDetection.ts`** - Pure functions for detecting wins on cards
2. **`/hooks/useWinDetection.ts`** - React hook for automatic win detection
3. **`/components/game/WinModal.tsx`** - Celebration modal with confetti and sound

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Game Room Page                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useSocket() - Provides socket connection            │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useWinDetection(socket) - Monitors for wins         │   │
│  │    - Watches calledHistory changes                    │   │
│  │    - Uses detectWin() to check cards                  │   │
│  │    - Auto-emits claim_win when detected               │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server validates win and broadcasts game_finished    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WinModal - Shows celebration                         │   │
│  │    - Confetti animation                               │   │
│  │    - Win sound effect                                 │   │
│  │    - Display winner info                              │   │
│  │    - Play Again button (host)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## File 1: `/lib/winDetection.ts`

Pure functions for win detection logic.

### Core Functions

#### `detectWin(cards, calledNumbers)`
Checks all player's cards for wins and returns the first win found.

```typescript
const cards = [card1, card2, card3];
const calledNumbers = new Set([1, 5, 12, 23, 34]);

const win = detectWin(cards, calledNumbers);
if (win) {
  console.log(`Won on card ${win.cardIndex}, row ${win.rowIndex}`);
}
```

Returns `CardWinResult | null`:
```typescript
{
  cardIndex: 0,      // Index in player's tickets array
  rowIndex: 1,       // Row index (0-2)
  type: 'row',       // Win type
  card: Card,        // The actual winning card
  winningNumbers: [1, 5, 12, 23, 34]  // Numbers that won
}
```

#### `detectAllWins(cards, calledNumbers)`
Returns ALL wins across all cards (useful for displaying multiple wins).

#### `numbersNeededToWin(card, calledNumbers)`
Returns how close a card is to winning (useful for "almost there" indicators).

```typescript
const needed = numbersNeededToWin(card, calledNumbers);
if (needed === 1) {
  console.log('Only 1 number away from winning!');
}
```

#### `getClosestRow(card, calledNumbers)`
Gets which row is closest to winning.

```typescript
const closest = getClosestRow(card, calledNumbers);
// { rowIndex: 1, numbersNeeded: 2 }
```

## File 2: `/hooks/useWinDetection.ts`

React hook for automatic win detection.

### Features

- ✅ Monitors `calledHistory` from Zustand store
- ✅ Checks player's cards after each number
- ✅ Auto-emits `claim_win` when detected
- ✅ Prevents duplicate claims
- ✅ Only active during 'playing' state
- ✅ Resets on game state changes

### Usage

```typescript
import { useWinDetection } from '@/hooks/useWinDetection';
import { useSocket } from '@/hooks/useSocket';

function GameRoomPage() {
  const socket = useSocket();

  // Hook automatically monitors and claims wins
  const { hasWon, winResult, claiming } = useWinDetection(
    socket.connected ? socket : undefined
  );

  useEffect(() => {
    if (hasWon) {
      console.log('You won!', winResult);
    }
  }, [hasWon, winResult]);

  return (
    <div>
      {claiming && <p>Claiming win...</p>}
      {/* Your game UI */}
    </div>
  );
}
```

### How It Works

1. Watches `calledHistory` in Zustand store
2. When numbers change during 'playing' state:
   - Gets current player's cards
   - Calls `detectWin(cards, calledNumbers)`
   - If win detected, emits `claim_win` to server
3. Server validates and broadcasts `game_finished`
4. Store updates with winner info
5. `WinModal` displays celebration

### Duplicate Prevention

The hook uses a `useRef` to track if a claim has been made:

```typescript
const claimedRef = useRef(false);

// Skip if already claimed
if (claimedRef.current) {
  return;
}

// Mark as claimed
claimedRef.current = true;
```

## File 3: `/components/game/WinModal.tsx`

Celebration modal with confetti and sound.

### Features

- ✅ Confetti animation using `canvas-confetti`
- ✅ Triumphant chord sound using Web Audio API
- ✅ Traditional Vietnamese styling
- ✅ Framer Motion animations
- ✅ Shows winner name and win type
- ✅ Displays winning row numbers
- ✅ "Chơi Lại" button for host
- ✅ Backdrop overlay

### Usage

```tsx
import { WinModal } from '@/components/game';
import { useGameStore } from '@/store/useGameStore';

function GameRoomPage() {
  const winner = useGameStore(state => state.room?.winner);
  const isHost = useGameStore(state => state.isHost());
  const soundEnabled = useGameStore(state => state.soundEnabled);

  const handlePlayAgain = () => {
    // Reset game logic
    console.log('Starting new game...');
  };

  return (
    <div>
      {/* Your game UI */}

      <WinModal
        winner={winner}
        isHost={isHost}
        soundEnabled={soundEnabled}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
```

### Props

```typescript
interface WinModalProps {
  winner: WinResult | null;      // Winner info from server
  isHost: boolean;                // Is current player host?
  onPlayAgain?: () => void;       // Play Again handler (host only)
  winningCard?: Card;             // Optional: card to display
  soundEnabled?: boolean;         // Enable/disable sound
}
```

### Confetti Configuration

The modal uses `canvas-confetti` with custom colors:

```typescript
confetti({
  particleCount: 50,
  spread: 360,
  startVelocity: 30,
  origin: { x: 0.2, y: 0.5 },
  colors: ['#D4AF37', '#FFD700', '#FFA500', '#FF6347', '#DC143C']
});
```

Colors chosen for Vietnamese festive feel (gold, orange, red).

### Win Sound

Uses Web Audio API to generate a triumphant chord:

```typescript
// C major 7th chord: C4, E4, G4, B4
const frequencies = [261.63, 329.63, 392.0, 493.88];

// ADSR envelope for natural sound
gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);  // Attack
gainNode.gain.linearRampToValueAtTime(0.07, now + 0.1);  // Decay
gainNode.gain.setValueAtTime(0.07, now + 0.5);           // Sustain
gainNode.gain.linearRampToValueAtTime(0, now + 0.8);     // Release
```

## Integration Example

Complete integration in a game room page:

```tsx
'use client';

import { useSocket } from '@/hooks/useSocket';
import { useWinDetection } from '@/hooks/useWinDetection';
import { WinModal } from '@/components/game';
import { useGameStore } from '@/store/useGameStore';

export default function GameRoomPage() {
  // Socket connection
  const socket = useSocket();

  // Automatic win detection
  const { hasWon, winResult } = useWinDetection(
    socket.connected ? socket : undefined
  );

  // Get game state
  const winner = useGameStore(state => state.room?.winner);
  const isHost = useGameStore(state => state.isHost());
  const soundEnabled = useGameStore(state => state.soundEnabled);
  const currentPlayer = useGameStore(state => state.getCurrentPlayer());

  // Play again handler (host only)
  const handlePlayAgain = () => {
    if (!isHost) return;

    // Emit reset game event to server
    socket.emit('reset_game', {
      roomId: socket.roomId
    });
  };

  // Get winning card for display
  const winningCard = winner && winResult
    ? currentPlayer?.tickets[winResult.cardIndex]
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      {/* Your game UI components */}
      <div>
        {/* Player cards */}
        {/* Caller panel */}
        {/* Called history */}
      </div>

      {/* Win celebration modal */}
      <WinModal
        winner={winner}
        isHost={isHost}
        soundEnabled={soundEnabled}
        winningCard={winningCard}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
```

## Server-Side Validation

The server MUST validate all win claims:

```typescript
socket.on('claim_win', ({ roomId, ticketIndex, boardIndex, type }) => {
  const room = rooms.get(roomId);
  const player = room.players.find(p => p.id === socket.id);

  // Validate win
  const isValid = checkPlayerWin(
    player.tickets,
    new Set(room.calledHistory)
  );

  if (isValid) {
    // Broadcast winner to all players
    io.to(roomId).emit('game_finished', {
      winner: {
        playerId: player.id,
        playerName: player.name,
        cardIndex: ticketIndex,
        rowIndex: isValid.rowIndices[0],
        type: 'row'
      }
    });

    // Update room state
    room.gameState = 'finished';
    room.winner = winner;
  } else {
    // Invalid claim
    socket.emit('error', {
      message: 'Invalid win claim'
    });
  }
});
```

## Styling

The modal uses traditional Vietnamese colors and styling:

### Colors
- Gold (`#D4AF37`, `#FFD700`) - Prosperity, celebration
- Orange (`#FFA500`) - Joy, happiness
- Red (`#FF6347`, `#DC143C`) - Good fortune, celebration
- Amber tones - Warmth, tradition

### Typography
- Vietnamese text: "Chúc Mừng!", "Chơi Lại", "Hoàn thành 1 hàng!"
- Large, bold fonts for impact
- Clear hierarchy

### Animations
- Spring animations for playful feel
- Rotating trophy and sparkles
- Smooth backdrop fade
- Scale and slide entrance

## Testing

### Manual Testing Checklist

- [ ] Win detected correctly when row completed
- [ ] Confetti plays on win
- [ ] Sound plays on win (if enabled)
- [ ] Sound doesn't play if disabled
- [ ] Winner name displays correctly
- [ ] Win type displays correctly
- [ ] Winning row numbers display
- [ ] "Chơi Lại" button shows for host
- [ ] Button hidden for non-hosts
- [ ] Multiple wins on same card don't cause duplicate claims
- [ ] Modal closes/resets on game restart
- [ ] Works on mobile devices
- [ ] Accessible (keyboard navigation, screen readers)

### Debug Logging

Enable debug logs in console:

```typescript
// In useWinDetection.ts
console.log('[WinDetection] Win detected:', win);
console.log('[WinDetection] Claiming win:', win);
console.log('[WinDetection] Already claimed, skipping');

// In WinModal.tsx
console.log('[WinModal] Playing confetti for winner:', winner);
console.log('[WinModal] Error playing win sound:', error);
```

## Troubleshooting

### Win not detected
- Check if `calledHistory` is updating in Zustand store
- Verify player has cards in `tickets` array
- Confirm game state is 'playing'
- Check if numbers on card match called numbers

### Duplicate claims
- Verify `claimedRef.current` is being set
- Check if hook is being remounted (should only mount once)
- Ensure socket connection is stable

### Sound not playing
- Check if `soundEnabled` is true
- Verify browser supports Web Audio API
- Check if user has interacted with page (autoplay policy)
- Look for errors in console

### Confetti not showing
- Verify `canvas-confetti` is installed
- Check if modal is rendering
- Ensure z-index is high enough (9999)
- Check for CSS conflicts

## Performance Considerations

### Win Detection
- Uses `Set` for O(1) number lookup
- Early returns to avoid unnecessary checks
- Only runs during 'playing' state
- Memoized with useEffect dependencies

### Modal Rendering
- AnimatePresence for smooth mounting/unmounting
- Lazy confetti initialization
- Audio context created once and reused
- Backdrop uses backdrop-blur for GPU acceleration

### Memory Management
- Audio context persisted in ref (not recreated)
- Confetti interval cleared on unmount
- Event listeners cleaned up

## Accessibility

### Features
- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast colors
- Large touch targets (44x44px minimum)

### Improvements Needed
- [ ] Add ARIA live region for win announcement
- [ ] Escape key to dismiss (if appropriate)
- [ ] Focus management
- [ ] Reduced motion support
- [ ] Screen reader friendly win details

## Future Enhancements

1. **Multiple Win Types**
   - Support "two rows" win
   - Support "four corners" win
   - Support "full board" win

2. **Customization**
   - Different confetti patterns
   - Custom sound effects
   - Theme variations

3. **Statistics**
   - Track win history
   - Show leaderboard
   - Win streaks

4. **Animations**
   - Highlight winning row on card
   - Pulse effect on winning numbers
   - Fireworks animation

5. **Social Features**
   - Share win on social media
   - Save win screenshot
   - Win replay

## Dependencies

Required packages (already installed):

```json
{
  "canvas-confetti": "^1.9.3",
  "framer-motion": "^11.15.0"
}
```

## Summary

The win detection system provides a complete, automated solution for detecting and celebrating wins in the Vietnamese Lô Tô game. It combines:

- **Pure functional logic** for reliable win detection
- **React hooks** for seamless integration
- **Beautiful UI** with confetti and sound
- **Traditional styling** respecting Vietnamese culture
- **Automatic operation** requiring minimal configuration

Players don't need to manually claim wins - the system detects and claims automatically, providing immediate celebration feedback.
