# Player Components - Quick Reference

## Files Created

1. **PlayerCard.tsx** - Individual player display component
2. **PlayerList.tsx** - List all players in room
3. **RoomInfo.tsx** - Room ID and information display
4. **ShareButton.tsx** - Copy room URL to clipboard
5. **PLAYER_COMPONENTS.md** - Comprehensive documentation
6. **PlayerComponents.example.tsx** - Usage examples

## Quick Start

### Import

```typescript
import {
  PlayerCard,
  PlayerList,
  RoomInfo,
  ShareButton,
} from '@/components/game';
```

### Basic Usage

#### PlayerList (Simplest - Auto-connects to store)
```tsx
<PlayerList />
```

#### RoomInfo
```tsx
<RoomInfo
  roomId={room.id}
  playerCount={players.length}
  gameState={room.gameState}
  createdAt={room.createdAt}
/>
```

#### ShareButton
```tsx
<ShareButton roomId={roomId} />
```

### Complete Sidebar Example

```tsx
import { RoomInfo, PlayerList } from '@/components/game';
import { useRoom, usePlayers } from '@/store/useGameStore';

export function RoomSidebar() {
  const room = useRoom();
  const players = usePlayers();

  if (!room) return null;

  return (
    <aside className="w-80 bg-white p-6 space-y-6">
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

## Key Features

### PlayerCard
- Shows player name, badges (host/caller), connection status, card count
- Kick button for host (can't kick self)
- "Bạn" indicator for current user
- Traditional Vietnamese styling

### PlayerList
- Auto-fetches data from Zustand store
- Animated entrance/exit
- Empty state with helpful message
- Host help text
- Kick confirmation dialog

### RoomInfo
- Large room ID display
- Player count (X/16)
- Game state indicator with colors
- Relative time display
- Integrated share button
- Responsive grid layout

### ShareButton
- Copy room URL to clipboard
- Success animation (Copy → Check icon)
- Toast notification
- Auto-reset after 2 seconds
- Error handling

## Store Hooks

```typescript
import {
  usePlayers,         // Get all players
  useCurrentPlayerId, // Get current player ID
  useIsHost,          // Check if host
  useRoomId,          // Get room ID
  useGameState,       // Get game state
  useRoom,            // Get entire room
} from '@/store/useGameStore';
```

## Socket Actions

```typescript
import { useSocket } from '@/hooks/useSocket';

const { kickPlayer } = useSocket();
kickPlayer(playerId); // Emits 'kick_player' event
```

## Icons Used (Lucide React)

- `Crown` - Host badge
- `Mic` - Caller badge
- `Wifi` / `WifiOff` - Connection status
- `UserX` - Kick button
- `Users` - Player list header
- `Copy` / `Check` - Share button
- `Clock` - Created time
- `Trophy` - Game finished

## Color Palette

```css
--loto-green: #2e7d32;
--loto-green-dark: #1b5e20;
--loto-gold: #ffd700;
--loto-gold-dark: #ff8f00;
--loto-gold-light: #ffeb3b;
--paper: #fffef5;
--paper-dark: #faf8ef;
```

## Responsive Breakpoints

- Mobile: < 640px (stacked)
- Tablet: 640px - 1024px (2 columns)
- Desktop: 1024px+ (3 columns)

## Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Semantic HTML
- ✅ Color contrast compliance

## Testing Checklist

- [ ] PlayerCard renders correctly
- [ ] Host badge appears for host
- [ ] Caller badge appears for caller
- [ ] Connection status shows correctly
- [ ] Kick button only visible to host
- [ ] Kick button not visible for current user
- [ ] PlayerList updates when players join/leave
- [ ] RoomInfo displays correct information
- [ ] ShareButton copies URL successfully
- [ ] Toast appears and disappears
- [ ] All animations work smoothly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Screen readers work correctly

## Common Issues

### Players not showing
```typescript
// Check store
const players = usePlayers();
console.log('Players:', players);
```

### Kick not working
```typescript
// Check socket connection
const { connected } = useSocket();
console.log('Connected:', connected);
```

### ShareButton not copying
```typescript
// Clipboard API requires HTTPS
console.log('Protocol:', window.location.protocol);
```

## File Structure

```
components/game/
├── PlayerCard.tsx              # Individual player display
├── PlayerList.tsx              # List of all players
├── RoomInfo.tsx                # Room information display
├── ShareButton.tsx             # Share room URL button
├── PLAYER_COMPONENTS.md        # Full documentation
├── PLAYER_COMPONENTS_SUMMARY.md # This file
├── PlayerComponents.example.tsx # Usage examples
└── index.ts                    # Exports
```

## Next Steps

1. Import components in your game room page
2. Add `<PlayerList />` to your sidebar
3. Add `<RoomInfo />` to your header
4. Test kick functionality as host
5. Test share button
6. Verify responsive design on mobile

## Support

For detailed documentation, see `PLAYER_COMPONENTS.md`
For usage examples, see `PlayerComponents.example.tsx`
