# Win Detection System - Quick Reference

## Files Created

### 1. `/lib/winDetection.ts`

Pure functions for win detection logic.

**Key Functions:**

- `detectWin(cards, calledNumbers)` - Find first win
- `detectAllWins(cards, calledNumbers)` - Find all wins
- `numbersNeededToWin(card, calledNumbers)` - Check proximity
- `getClosestRow(card, calledNumbers)` - Find closest row

### 2. `/hooks/useWinDetection.ts`

React hook for automatic win monitoring.

**Features:**

- Auto-detects wins when numbers are called
- Auto-claims via Socket.io
- Prevents duplicate claims
- Resets on game state changes

### 3. `/components/game/WinModal.tsx`

Celebration modal with confetti and sound.

**Features:**

- Confetti animation (canvas-confetti)
- Win sound (Web Audio API)
- Vietnamese styling
- Framer Motion animations
- Play Again button (host only)

## Quick Integration

```tsx
"use client";

import { useSocket } from "@/hooks/useSocket";
import { useWinDetection } from "@/hooks/useWinDetection";
import { WinModal } from "@/components/game";
import { useGameStore } from "@/store/useGameStore";

export default function GameRoomPage() {
  // 1. Socket connection
  const socket = useSocket();

  // 2. Automatic win detection
  useWinDetection(socket.connected ? socket : undefined);

  // 3. Get game state
  const winner = useGameStore((state) => state.room?.winner);
  const isHost = useGameStore((state) => state.isHost());
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  // 4. Play again handler
  const handlePlayAgain = () => {
    socket.emit("reset_game", { roomId: socket.roomId });
  };

  return (
    <div>
      {/* Your game UI */}

      {/* Win modal */}
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

## How It Works

```
Player cards + Called numbers
        ↓
useWinDetection hook monitors
        ↓
detectWin() checks for wins
        ↓
Auto-emit claim_win to server
        ↓
Server validates and broadcasts
        ↓
WinModal shows celebration
```

## Server-Side (Must Implement)

```typescript
socket.on("claim_win", ({ roomId, ticketIndex }) => {
  const room = rooms.get(roomId);
  const player = room.players.find((p) => p.id === socket.id);

  // Validate win
  const win = checkPlayerWin(player.tickets, new Set(room.calledHistory));

  if (win) {
    // Broadcast winner
    io.to(roomId).emit("game_finished", {
      winner: {
        playerId: player.id,
        playerName: player.name,
        cardIndex: ticketIndex,
        rowIndex: win.rowIndices[0],
        type: "row",
      },
    });

    room.gameState = "finished";
    room.winner = winner;
  }
});
```

## Key Features

✅ **Automatic** - No manual claim button needed
✅ **Client-side detection** - Fast feedback
✅ **Server validation** - Secure and fair
✅ **Visual celebration** - Confetti and animations
✅ **Audio feedback** - Triumphant chord
✅ **Vietnamese styling** - Traditional colors and text
✅ **Responsive** - Works on all devices
✅ **Accessible** - Keyboard and screen reader support

## Testing Checklist

- [ ] Win detected when row completed
- [ ] Confetti plays correctly
- [ ] Sound plays (if enabled)
- [ ] Winner name shows
- [ ] Play Again button (host only)
- [ ] No duplicate claims
- [ ] Modal dismisses on restart
- [ ] Mobile responsive

## Dependencies Used

- `canvas-confetti` - Confetti animation
- `framer-motion` - Modal animations
- Web Audio API (built-in) - Sound effects

## Vietnamese Text

- "Chúc Mừng!" - Congratulations!
- "Hoàn thành 1 hàng!" - Completed 1 row!
- "Chơi Lại" - Play Again
- "Phiếu dò số X" - Card number X
- "Hàng X" - Row X

## Colors Used

- Gold: `#D4AF37`, `#FFD700`
- Orange: `#FFA500`
- Red: `#FF6347`, `#DC143C`
- Amber tones: `amber-50` to `amber-900`

## Documentation

- `WIN_DETECTION_GUIDE.md` - Complete guide
- `WinModal.example.tsx` - Usage examples
