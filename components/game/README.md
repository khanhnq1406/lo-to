# Vietnamese Lô Tô Game - Ticket Display Components

This directory contains React components for displaying authentic Vietnamese Lô Tô cards with traditional paper design.

## Overview

The ticket display system consists of 4 main components that work together to create an authentic Vietnamese Lô Tô experience:

1. **TicketDisplay** - Container for displaying multiple cards
2. **CardGrid** - Single card component (3×9 grid)
3. **NumberCell** - Individual cell component
4. **CardHeader** - Card title and status

## Authentic Vietnamese Lô Tô Format

The components follow the authentic Vietnamese Lô Tô format:

- **Card structure**: 3 rows × 9 columns = 27 cells
- **Numbers per card**: 15 numbers (1-90) + 12 blank cells
- **Numbers per row**: 5 numbers + 4 blanks
- **Column constraints**: Col 0 = 1-9, Col 1 = 10-19, ..., Col 8 = 80-90
- **Win condition**: Complete any horizontal row (5 numbers)

## Components

### TicketDisplay

Container component that displays all cards owned by a player.

**Props:**

```tsx
interface TicketDisplayProps {
  cards: Card[]; // Array of cards (each card is 3×9)
  calledNumbers: Set<number>; // Set of called numbers (1-90)
  onCellClick?: (cardIndex: number, row: number, col: number) => void;
  winningCardIndex?: number; // Index of winning card
  winningRow?: number; // Winning row index (0-2)
}
```

**Features:**

- Responsive grid layout (3 cards per row on desktop, 2 on tablet, 1 on mobile)
- Statistics header showing total cards and called numbers
- Empty state when no cards
- Win detection indicator
- Helpful tips for players

**Usage:**

```tsx
import { TicketDisplay } from "@/components/game";
import { usePlayerCards, useCalledHistory } from "@/store/useGameStore";

export default function GamePage() {
  const cards = usePlayerCards();
  const calledHistory = useCalledHistory();
  const calledNumbers = new Set(calledHistory);

  return (
    <TicketDisplay
      cards={cards}
      calledNumbers={calledNumbers}
      onCellClick={(cardIndex, row, col) => {
        console.log(`Clicked card ${cardIndex}, row ${row}, col ${col}`);
      }}
    />
  );
}
```

### CardGrid

Displays a single Vietnamese Lô Tô card with traditional paper style.

**Props:**

```tsx
interface CardGridProps {
  card: Card; // Card data (3×9 grid)
  calledNumbers: Set<number>; // Set of called numbers
  cardIndex: number; // Card index in player's array
  onCellClick?: (row: number, col: number) => void;
  isWinning?: boolean; // Is this card winning?
  winningRow?: number; // Winning row index (0-2)
}
```

**Features:**

- Traditional paper background (#FBF9F4)
- Dark green borders (#2D5016)
- 3×9 grid layout
- Manual marking support
- Card statistics in header
- Paper texture overlay
- Decorative bottom border

**Styling:**

- Off-white paper gradient background
- Green decorative borders
- Shadow effect for depth
- Rounded corners
- Responsive padding

### NumberCell

Individual cell component displaying a number or blank.

**Props:**

```tsx
interface NumberCellProps {
  value: CellValue; // Number (1-90) or null (blank)
  isCalled: boolean; // Is number called?
  isMarked: boolean; // Is manually marked?
  onClick?: () => void; // Click handler
  isWinning?: boolean; // Is part of winning row?
  row?: number; // Row index (for accessibility)
  col?: number; // Col index (for accessibility)
}
```

**Visual States:**

- **Normal**: White background, black border
- **Blank**: Green background, no number
- **Called**: Yellow/gold highlight with pulse animation
- **Marked**: Green background with checkmark overlay
- **Winning**: Gold gradient with sparkle animation

**Animations:**

- Initial appearance: Fade in + scale
- Number called: Pulse animation
- Manual mark: Stamp/press effect
- Winning: Celebration animation with sparkle

**Accessibility:**

- ARIA labels for screen readers
- Keyboard navigation support (Enter/Space)
- Touch-friendly (min 44px on mobile)
- Clear state announcements

### CardHeader

Header component displaying card title and status.

**Props:**

```tsx
interface CardHeaderProps {
  cardIndex: number; // Card index (0-based)
  isWinning?: boolean; // Is winning card?
  winningRow?: number; // Winning row (0-2)
  totalNumbers?: number; // Total numbers on card (default: 15)
  calledNumbers?: number; // Called numbers on card
}
```

**Features:**

- Card title (Vietnamese: "Phiếu dò 1", "Phiếu dò 2", etc.)
- Progress indicator (called/total)
- Win status badge with animation
- Compact design

## Design System

### Colors (Tailwind)

```tsx
// Traditional Vietnamese Lô Tô colors
bg - paper; // #FBF9F4 - Off-white paper
bg - paper - dark; // #F5F2EA - Darker paper shade
border - loto - green; // #2D5016 - Dark green borders
text - loto - green; // #2D5016 - Green text
bg - loto - gold; // #FFD700 - Called number highlight
bg - loto - green - light; // #4A7C2C - Marked cell background
```

### Typography

- Font: Bold for numbers (`font-bold`)
- Sizes: Responsive (sm: 14px, md: 16px, lg: 20px)
- Color: Dark green for numbers

### Shadows

```tsx
shadow - loto - ticket; // Paper card shadow
```

### Responsive Breakpoints

- **Mobile (< 640px)**: 1 card per row, stacked
- **Tablet (640px - 1024px)**: 2 cards per row
- **Desktop (> 1024px)**: 3 cards per row

## Usage Examples

### Basic Usage with Zustand Store

```tsx
"use client";

import { TicketDisplay } from "@/components/game";
import { usePlayerCards, useCalledHistory } from "@/store/useGameStore";

export default function GamePage() {
  const cards = usePlayerCards();
  const calledHistory = useCalledHistory();
  const calledNumbers = new Set(calledHistory);

  const handleCellClick = (cardIndex: number, row: number, col: number) => {
    console.log(`Manual mark: Card ${cardIndex}, Row ${row}, Col ${col}`);
    // Implement manual marking logic here
  };

  return (
    <div className="p-4">
      <TicketDisplay
        cards={cards}
        calledNumbers={calledNumbers}
        onCellClick={handleCellClick}
      />
    </div>
  );
}
```

### With Win Detection

```tsx
"use client";

import { TicketDisplay } from "@/components/game";
import { usePlayerCards, useCalledHistory } from "@/store/useGameStore";
import { checkRowWin } from "@/lib/game";
import { useMemo } from "react";

export default function GamePage() {
  const cards = usePlayerCards();
  const calledHistory = useCalledHistory();
  const calledNumbers = useMemo(() => new Set(calledHistory), [calledHistory]);

  // Check for winning cards
  const winningInfo = useMemo(() => {
    for (let i = 0; i < cards.length; i++) {
      const winningRows = checkRowWin(cards[i], calledNumbers);
      if (winningRows.length > 0) {
        return { cardIndex: i, rowIndex: winningRows[0] };
      }
    }
    return null;
  }, [cards, calledNumbers]);

  return (
    <div className="p-4">
      <TicketDisplay
        cards={cards}
        calledNumbers={calledNumbers}
        winningCardIndex={winningInfo?.cardIndex}
        winningRow={winningInfo?.rowIndex}
      />
    </div>
  );
}
```

### Standalone CardGrid

```tsx
import { CardGrid } from "@/components/game";
import type { Card } from "@/types";

const sampleCard: Card = [
  [5, null, null, 32, null, 56, null, 71, null],
  [null, 12, 23, null, 45, null, 67, null, 89],
  [8, null, 28, null, null, 58, null, null, 90],
];

export function SingleCardDisplay() {
  const calledNumbers = new Set([5, 12, 23, 45, 56]);

  return (
    <CardGrid
      card={sampleCard}
      calledNumbers={calledNumbers}
      cardIndex={0}
      onCellClick={(row, col) => {
        console.log(`Clicked: Row ${row}, Col ${col}`);
      }}
    />
  );
}
```

## Performance Optimization

### Memoization

All components use `React.memo` to prevent unnecessary re-renders:

```tsx
export const NumberCell = memo(function NumberCell({ ... }) { ... });
export const CardGrid = memo(function CardGrid({ ... }) { ... });
export const TicketDisplay = memo(function TicketDisplay({ ... }) { ... });
```

### Optimized Selectors

Use specific selectors from the store to avoid re-renders:

```tsx
// Good - Only re-renders when cards change
const cards = usePlayerCards();

// Bad - Re-renders on any store change
const store = useGameStore();
const cards = store.getPlayerCards();
```

### Set for Called Numbers

Always use `Set` for called numbers for O(1) lookup:

```tsx
// Good
const calledNumbers = new Set(calledHistory);

// Bad - O(n) lookup on every check
const calledNumbers = calledHistory;
```

## Animation Details

### Framer Motion Variants

All animations use Framer Motion with optimized variants:

```tsx
// Cell appearance
initial: { scale: 0, opacity: 0 }
enter: { scale: 1, opacity: 1 }

// Number called
called: { scale: [1, 1.15, 1] }

// Manual mark
marked: { scale: [1, 0.9, 1] }

// Winning
winning: {
  scale: [1, 1.1, 1],
  rotate: [0, -2, 2, 0]
}
```

### Performance Tips

- Animations use GPU-accelerated properties (`transform`, `opacity`)
- Spring animations use optimized `stiffness` and `damping`
- Continuous animations use `repeat: Infinity` sparingly

## Accessibility

### ARIA Support

- Grid role on card container
- Button role on clickable cells
- Gridcell role on non-clickable cells
- Descriptive labels for all cells

### Keyboard Navigation

- Tab navigation between cells
- Enter/Space to mark cells
- Focus indicators
- Skip links for screen readers

### Screen Reader Support

Example ARIA labels:

- "Number 5 - called, marked"
- "Blank cell at row 1, column 2"
- "Number 45"

## Testing

### Manual Testing Checklist

- [ ] Cards display correctly in 3×9 format
- [ ] Numbers are in correct column ranges
- [ ] Blank cells show green background
- [ ] Called numbers show yellow highlight
- [ ] Manual marking works (click to toggle)
- [ ] Responsive layout works (mobile/tablet/desktop)
- [ ] Animations are smooth
- [ ] Win detection highlights correct row
- [ ] Empty state shows when no cards
- [ ] Statistics update correctly

### Responsive Testing

Test on multiple screen sizes:

- iPhone SE (375px)
- iPad (768px)
- Desktop (1920px)

## Troubleshooting

### Cards not displaying

Check that:

1. Cards are in correct format (3×9 array)
2. calledNumbers is a Set, not an array
3. Card data is not null/undefined

### Numbers not highlighting

Check that:

1. calledNumbers Set contains the numbers
2. Numbers are in range 1-90
3. Store is updating correctly

### Animations not working

Check that:

1. framer-motion is installed
2. Components are client-side ('use client')
3. No CSS conflicts with transform/opacity

### Performance issues

If experiencing lag:

1. Ensure components are memoized
2. Use specific store selectors
3. Limit number of cards displayed
4. Check for unnecessary re-renders with React DevTools

## Future Enhancements

Potential improvements:

- [ ] Sound effects on number call
- [ ] Confetti animation on win
- [ ] Card flip animation when generated
- [ ] Print-friendly card layout
- [ ] Export cards as images
- [ ] Card comparison view
- [ ] Heat map showing called numbers
- [ ] Multiple card selection for batch operations

## License

Part of the Vietnamese Lô Tô multiplayer game project.
