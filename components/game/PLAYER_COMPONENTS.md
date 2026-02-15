# Player List and Room Info Components

Documentation for player list and room information components for the Vietnamese Lô Tô game.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Usage Examples](#usage-examples)
4. [Integration](#integration)
5. [Styling](#styling)
6. [Accessibility](#accessibility)

---

## Overview

This document describes four interconnected components that handle player management and room information display:

- **PlayerCard** - Individual player display with badges and kick functionality
- **PlayerList** - List of all players in the room
- **RoomInfo** - Room ID, stats, and share functionality
- **ShareButton** - Copy room URL to clipboard with feedback

### Key Features

- **Store Integration**: Uses Zustand hooks (`usePlayers`, `useRoomId`, `useGameState`)
- **Socket Integration**: Uses `useSocket()` for kick action
- **Traditional Vietnamese Styling**: Consistent with game theme
- **Responsive Design**: Mobile-first, adapts to all screen sizes
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Animations**: Smooth Framer Motion animations

---

## Components

### 1. PlayerCard

Individual player display component showing player information and controls.

#### Props

```typescript
interface PlayerCardProps {
  player: Player;              // Player information
  isCurrentUserHost: boolean;  // Is the current user the host?
  isCurrentUser: boolean;      // Is this the current user's card?
  onKick?: (playerId: string) => void; // Callback for kick action
}
```

#### Features

- Player name display
- Host badge (crown icon)
- Caller badge (microphone icon)
- Connection status (Wifi/WifiOff icon with colors)
- Card count display
- Kick button (host only, cannot kick self)
- "Bạn" (You) indicator for current user
- Responsive layout

#### Visual States

- **Current User**: Gold gradient background with border
- **Other Players**: White background with green border
- **Disconnected**: 60% opacity
- **Host Badge**: Gold background with crown icon
- **Caller Badge**: Green background with microphone icon

---

### 2. PlayerList

Container component that displays all players using PlayerCard components.

#### Props

```typescript
interface PlayerListProps {
  className?: string;  // Optional className for styling
}
```

#### Features

- Automatic data fetching from Zustand store
- Player count badge
- Empty state with helpful message
- Staggered entrance animations
- Exit animations when players leave
- Host help text
- Kick confirmation dialog
- Screen reader announcements

#### Store Hooks Used

```typescript
const players = usePlayers();           // Array of all players
const currentPlayerId = useCurrentPlayerId(); // Current player's ID
const isHost = useIsHost();            // Is current user host?
```

#### Socket Actions Used

```typescript
const { kickPlayer } = useSocket();
```

---

### 3. RoomInfo

Displays room information including ID, player count, game state, and share button.

#### Props

```typescript
interface RoomInfoProps {
  roomId: string;        // Unique room ID
  playerCount: number;   // Current number of players
  maxPlayers?: number;   // Maximum players (default: 16)
  gameState: GameState;  // 'waiting' | 'playing' | 'finished'
  createdAt: Date;       // Room creation timestamp
}
```

#### Features

- Large, prominent room ID display
- Player count indicator (X/16)
- Game state badge with colors:
  - **Waiting**: Yellow
  - **Playing**: Green with pulse animation
  - **Finished**: Gray
- Relative time display ("2 phút trước")
- Integrated share button
- Responsive grid layout
- Decorative gradient overlay

#### Helper Functions

```typescript
formatRelativeTime(date: Date): string
getGameStateInfo(state: GameState): { text: string; color: string; bgColor: string }
```

---

### 4. ShareButton

Copy room URL to clipboard with visual feedback and toast notification.

#### Props

```typescript
interface ShareButtonProps {
  roomId: string;       // Room ID to share
  baseUrl?: string;     // Optional custom URL base
  className?: string;   // Optional className
}
```

#### Features

- Copy to clipboard using Clipboard API
- Icon animation (Copy → Check)
- Button state change on success
- Toast notification with auto-dismiss
- Error handling
- 2-second success state
- 3-second toast display
- Responsive sizing

#### URL Format

```
{baseUrl}/room/{roomId}
```

Default baseUrl: `window.location.origin`

---

## Usage Examples

### Basic PlayerList Usage

```tsx
import { PlayerList } from '@/components/game';

export default function GameRoom() {
  return (
    <div className="container mx-auto p-4">
      <PlayerList />
    </div>
  );
}
```

### RoomInfo with Store Integration

```tsx
import { RoomInfo } from '@/components/game';
import { useRoom, usePlayers } from '@/store/useGameStore';

export default function RoomHeader() {
  const room = useRoom();
  const players = usePlayers();

  if (!room) return null;

  return (
    <RoomInfo
      roomId={room.id}
      playerCount={players.length}
      maxPlayers={16}
      gameState={room.gameState}
      createdAt={room.createdAt}
    />
  );
}
```

### Standalone ShareButton

```tsx
import { ShareButton } from '@/components/game';

export default function RoomActions({ roomId }: { roomId: string }) {
  return (
    <div className="flex gap-2">
      <ShareButton roomId={roomId} />
      <button>Other Action</button>
    </div>
  );
}
```

### PlayerCard Direct Usage

```tsx
import { PlayerCard } from '@/components/game';
import { useSocket } from '@/hooks/useSocket';
import { useIsHost, useCurrentPlayerId } from '@/store/useGameStore';

export default function CustomPlayerDisplay({ player }: { player: Player }) {
  const { kickPlayer } = useSocket();
  const isHost = useIsHost();
  const currentPlayerId = useCurrentPlayerId();

  return (
    <PlayerCard
      player={player}
      isCurrentUserHost={isHost}
      isCurrentUser={player.id === currentPlayerId}
      onKick={kickPlayer}
    />
  );
}
```

### Complete Room Sidebar

```tsx
import { RoomInfo, PlayerList } from '@/components/game';
import { useRoom, usePlayers } from '@/store/useGameStore';

export default function RoomSidebar() {
  const room = useRoom();
  const players = usePlayers();

  if (!room) return null;

  return (
    <aside className="w-80 bg-white p-4 space-y-6">
      <RoomInfo
        roomId={room.id}
        playerCount={players.length}
        gameState={room.gameState}
        createdAt={room.createdAt}
      />
      <PlayerList />
    </aside>
  );
}
```

---

## Integration

### Store Integration

These components integrate with the Zustand store using selector hooks:

```typescript
// From @/store/useGameStore
import {
  usePlayers,        // Get all players
  useCurrentPlayerId, // Get current player ID
  useIsHost,         // Check if current user is host
  useRoomId,         // Get room ID
  useGameState,      // Get game state
  useRoom,           // Get entire room object
} from '@/store/useGameStore';
```

### Socket Integration

Kick action integrates with the Socket.io client:

```typescript
// From @/hooks/useSocket
import { useSocket } from '@/hooks/useSocket';

const { kickPlayer } = useSocket();

// Usage
kickPlayer(playerId); // Emits 'kick_player' event to server
```

### Type Integration

Uses types from the main types file:

```typescript
// From @/types
import type {
  Player,     // Player information
  GameState,  // Game state enum
  Room,       // Room object
} from '@/types';
```

---

## Styling

### Color Scheme

Components use the Vietnamese Lô Tô color palette:

```css
/* Primary Colors */
--loto-green: #2e7d32;      /* Main green */
--loto-green-dark: #1b5e20;  /* Dark green */
--loto-gold: #ffd700;        /* Gold */
--loto-gold-dark: #ff8f00;   /* Dark gold */
--loto-gold-light: #ffeb3b;  /* Light gold */

/* Paper Colors */
--paper: #fffef5;            /* Light cream */
--paper-dark: #faf8ef;       /* Darker cream */
```

### Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Component-Specific Classes

#### PlayerCard
- Border: 2px
- Padding: 12px (p-3)
- Border radius: 8px (rounded-lg)
- Hover effects on non-current users

#### PlayerList
- Gap between cards: 8px (space-y-2)
- Stagger delay: 0.05s per item

#### RoomInfo
- Gradient background
- 2px border
- Large shadow (shadow-lg)
- Grid layout: 1 column mobile, 3 columns desktop

#### ShareButton
- Height: 40px (py-2)
- Padding: 16px horizontal (px-4)
- Active scale: 0.95

---

## Accessibility

### ARIA Labels

All components include proper ARIA labels:

```tsx
// PlayerCard
<div role="article" aria-label={`Player ${player.name}`}>
  <div aria-label={player.connected ? 'Connected' : 'Disconnected'}>
  <span role="status" aria-label="Host">
  <button aria-label={`Kick ${player.name}`}>
</div>

// PlayerList
<div role="region" aria-label="Player list">
<div className="sr-only" aria-live="polite">
  {players.length} người chơi trong phòng
</div>

// RoomInfo
<div role="region" aria-label="Room information">
<div role="text" aria-label={`Room ID: ${roomId}`}>

// ShareButton
<button aria-label={copied ? 'Đã sao chép link phòng' : 'Sao chép link phòng'}>
<div role="status" aria-live="polite">
```

### Keyboard Navigation

All interactive elements support keyboard navigation:

- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Escape**: Close dialogs/confirmations

### Focus Management

```tsx
// ShareButton
focus:outline-none focus:ring-2 focus:ring-loto-green focus:ring-offset-2

// PlayerCard kick button
focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
```

### Screen Reader Support

- Live regions for dynamic content
- Hidden text for context (sr-only class)
- Semantic HTML (article, aside, region)
- Descriptive labels for all icons

---

## Animation Details

### Framer Motion Variants

#### PlayerList Container
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};
```

#### PlayerList Items
```typescript
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};
```

#### ShareButton Icon
```typescript
// Copy → Check animation
initial={{ scale: 0, rotate: -180 }}
animate={{ scale: 1, rotate: 0 }}
exit={{ scale: 0, rotate: 180 }}
transition={{ type: 'spring', stiffness: 400, damping: 20 }}
```

#### Toast Notification
```typescript
initial={{ opacity: 0, y: 50, scale: 0.8 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.8 }}
```

---

## Testing Recommendations

### Unit Tests

```typescript
// PlayerCard.test.tsx
- Renders player name correctly
- Shows host badge when isHost=true
- Shows caller badge when isCaller=true
- Shows connection status correctly
- Kick button only visible to host (not for current user)
- Calls onKick when kick button clicked

// PlayerList.test.tsx
- Renders empty state when no players
- Renders correct number of PlayerCards
- Shows player count badge
- Calls kickPlayer from useSocket
- Shows confirmation dialog before kick

// RoomInfo.test.tsx
- Displays room ID correctly
- Shows correct player count
- Formats relative time correctly
- Shows correct game state with colors
- Integrates ShareButton

// ShareButton.test.tsx
- Copies URL to clipboard
- Shows success state after copy
- Displays toast notification
- Resets state after 2 seconds
- Handles clipboard errors gracefully
```

### Integration Tests

```typescript
// Test with actual Zustand store
- PlayerList updates when players join/leave
- RoomInfo updates when game state changes
- Kick action removes player from store
- ShareButton generates correct room URL

// Test with Socket.io mock
- Kick emits correct socket event
- Socket connection status reflects in UI
```

### E2E Tests

```typescript
// User flows
- Host can kick other players
- Host cannot kick themselves
- Non-host cannot see kick buttons
- Share button copies correct URL
- Toast appears and disappears correctly
- Disconnected players show as offline
```

---

## Troubleshooting

### Common Issues

#### 1. Players not appearing
```typescript
// Check store hook
const players = usePlayers();
console.log('Players:', players);

// Verify room exists
const room = useRoom();
console.log('Room:', room);
```

#### 2. Kick button not working
```typescript
// Verify socket connection
const { connected, kickPlayer } = useSocket();
console.log('Connected:', connected);

// Check host status
const isHost = useIsHost();
console.log('Is host:', isHost);
```

#### 3. ShareButton not copying
```typescript
// Check clipboard API availability
if (!navigator.clipboard) {
  console.error('Clipboard API not available');
}

// Check for HTTPS (required for clipboard)
console.log('Protocol:', window.location.protocol);
```

#### 4. Relative time not updating
```typescript
// Add interval to refresh time
useEffect(() => {
  const interval = setInterval(() => {
    // Force re-render
  }, 60000); // Update every minute
  return () => clearInterval(interval);
}, []);
```

---

## Future Enhancements

Potential improvements for future versions:

1. **Player Roles**: Add more granular roles (moderator, spectator)
2. **Player Search**: Filter/search in large player lists
3. **Player Actions Menu**: Dropdown with more actions (promote, mute, etc.)
4. **Customizable Max Players**: Allow host to set max players
5. **Player Avatars**: Add profile pictures or generated avatars
6. **Player Stats**: Show win/loss record, games played
7. **Persistent Share Links**: Generate shareable QR codes
8. **Social Share**: Share to Facebook, WhatsApp, etc.
9. **Player Notes**: Allow host to add notes about players
10. **Batch Actions**: Select multiple players for bulk actions

---

## References

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Socket.io Client API](https://socket.io/docs/v4/client-api/)
- [WAI-ARIA Best Practices](https://www.w3.org/WAI/ARIA/apg/)
