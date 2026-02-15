# Component Architecture

## Component Hierarchy

```
TicketDisplay                          # Container (all player cards)
├── Statistics Header                  # Total cards, progress
├── Win Indicator (optional)           # Shows if any row complete
└── Grid of Cards
    └── CardGrid (×N)                  # Single card (repeated)
        ├── CardHeader                 # Card title & status
        │   ├── Card Title ("Phiếu dò 1")
        │   └── Progress or Win Badge
        ├── Card Container (Paper)     # 3×9 grid container
        │   ├── Paper Background
        │   ├── Texture Overlay
        │   └── Grid of Cells
        │       └── NumberCell (×27)   # Individual cell (repeated)
        │           ├── Number (1-90) or Blank (null)
        │           ├── Background (white/green/gold)
        │           ├── Border
        │           ├── Checkmark (if marked)
        │           ├── Pulse (if called)
        │           └── Sparkle (if winning)
        └── Decorative Border
```

## Data Flow

```
Zustand Store
   ↓
Game Page Component
   ↓ (props)
TicketDisplay
   ↓ cards: Card[], calledNumbers: Set<number>
CardGrid (for each card)
   ↓ card: Card, calledNumbers: Set<number>
NumberCell (for each cell)
   ↓ value: CellValue, isCalled: boolean
[Rendered Cell]
```

## State Management

### Store State (Zustand)

```tsx
// Global state (read from store)
- cards: Card[]              // Player's cards
- calledHistory: number[]    // All called numbers
- currentNumber: number      // Most recent number
- winner: WinResult | null   // Winner info
```

### Local State (Component)

```tsx
// CardGrid local state
- markedCells: Set<string>   // Manually marked cells

// TicketDisplay computed state
- statistics                 // Total/called counts
- hasCompleteRow            // Any row complete?
```

### Props (Parent to Child)

```tsx
// Passed down through component tree
-cards - // Card data
  calledNumbers - // Set of called numbers
  onCellClick - // User interaction handler
  winningCardIndex - // Highlight winning card
  winningRow; // Highlight winning row
```

## Component Responsibilities

### TicketDisplay

**Responsibilities:**

- Display multiple cards in responsive grid
- Show overall statistics
- Handle empty state (no cards)
- Detect complete rows across all cards
- Coordinate card layout

**Does NOT:**

- Manage game logic
- Call numbers
- Generate cards
- Validate wins

### CardGrid

**Responsibilities:**

- Display single 3×9 card
- Apply traditional paper styling
- Track manual marking (local state)
- Calculate card-specific statistics
- Handle cell click events

**Does NOT:**

- Know about other cards
- Call numbers
- Determine if game is won
- Generate card data

### NumberCell

**Responsibilities:**

- Display single number or blank
- Show visual state (called/marked/winning)
- Animate state changes
- Handle user click
- Provide accessibility

**Does NOT:**

- Know about card structure
- Track which numbers are called
- Determine if row is complete
- Manage mark state

### CardHeader

**Responsibilities:**

- Display card title (Vietnamese)
- Show progress or win status
- Animate win celebration

**Does NOT:**

- Know about cell states
- Calculate statistics
- Handle interactions

## File Dependencies

```
TicketDisplay.tsx
├── imports Card type from @/types
├── imports CardGrid from ./CardGrid
├── imports framer-motion
└── uses Tailwind classes

CardGrid.tsx
├── imports Card, CellValue from @/types
├── imports NumberCell from ./NumberCell
├── imports CardHeader from ./CardHeader
└── uses useState, useMemo, useCallback

NumberCell.tsx
├── imports CellValue from @/types
├── imports framer-motion
└── uses Tailwind classes

CardHeader.tsx
├── imports framer-motion
└── uses Tailwind classes

index.ts
└── re-exports all components
```

## External Dependencies

```
React (19.0.0)
├── useState      # Local state (CardGrid marking)
├── useMemo       # Performance (statistics, win detection)
├── useCallback   # Performance (click handlers)
└── memo          # Performance (prevent rerenders)

Framer Motion (11.15.0)
├── motion.*      # Animated elements
├── AnimatePresence # Conditional animations
└── variants      # Animation presets

Tailwind CSS (3.4.17)
├── Layout        # grid, flex, responsive
├── Colors        # loto-green, paper, gold
├── Spacing       # p-*, m-*, gap-*
├── Typography    # font-bold, text-*
└── Custom        # shadow-loto-ticket, etc.

TypeScript (5.7.2)
├── Type safety   # Card, CellValue, etc.
├── Props         # Interface definitions
└── Inference     # Automatic types
```

## Performance Optimization

### Memoization Strategy

```tsx
// Component level
const NumberCell = memo(...)      // Prevent rerenders
const CardGrid = memo(...)        // Prevent rerenders
const TicketDisplay = memo(...)   // Prevent rerenders

// Hook level
const stats = useMemo(...)        // Cache calculations
const hasWin = useMemo(...)       // Cache win detection
const onClick = useCallback(...)  // Cache handlers
```

### Re-render Prevention

```tsx
// Only rerender when these change:
NumberCell: [value, isCalled, isMarked, isWinning];
CardGrid: [card, calledNumbers, isWinning, winningRow];
TicketDisplay: [cards, calledNumbers, winningCardIndex];
```

### Data Structure Choice

```tsx
// Set for O(1) lookups
calledNumbers: Set<number>  // ✅ Fast: calledNumbers.has(5)
calledNumbers: number[]     // ❌ Slow: calledNumbers.includes(5)
```

## Animation Performance

### GPU Acceleration

```tsx
// Use transform and opacity (GPU-accelerated)
transform: scale(1.1)   ✅
transform: rotate(5deg) ✅
opacity: 0.5           ✅

// Avoid layout properties (CPU-intensive)
width: 100px    ❌
height: 100px   ❌
top: 50px       ❌
```

### Animation Types

```tsx
// Spring (realistic physics)
type: "spring";
stiffness: 400;
damping: 25;

// Tween (smooth interpolation)
duration: 0.4;
ease: "easeOut";

// Infinite (continuous)
repeat: Infinity;
ease: "linear";
```

## Accessibility Architecture

### Semantic HTML

```tsx
<div role="grid">              // Card container
  <div role="gridcell">        // Non-interactive cell
  <div role="button">          // Interactive cell
```

### ARIA Labels

```tsx
aria-label="Number 5 - called, marked"
aria-label="Blank cell at row 1, column 2"
aria-pressed={isMarked}
```

### Keyboard Navigation

```tsx
tabIndex={0}                   // Focusable
onKeyDown={(e) => {
  if (e.key === 'Enter') ...   // Activate
  if (e.key === ' ') ...       // Activate
}}
```

## Styling Architecture

### Tailwind Strategy

```tsx
// Responsive modifiers
className = "text-sm sm:text-base md:text-lg lg:text-xl";

// State variants
className = "hover:bg-green active:scale-95";

// Custom utilities
className = "bg-paper border-loto-green shadow-loto-ticket";
```

### Color System

```tsx
// Traditional Vietnamese Lô Tô palette
paper:           #FBF9F4  // Off-white paper
paper-dark:      #F5F2EA  // Darker shade
loto-green:      #2D5016  // Dark green
loto-green-light: #4A7C2C  // Light green
loto-gold:       #FFD700  // Gold highlight
loto-red:        #C41E3A  // Red accent
```

### Component Styling Layers

```
1. Base layout (Tailwind utility classes)
2. State classes (hover, focus, active)
3. Responsive modifiers (sm:, md:, lg:)
4. Custom styles (inline for gradients)
5. Animations (Framer Motion)
```

## Testing Architecture

### Unit Testing (Future)

```tsx
// Test individual components
describe("NumberCell", () => {
  it("displays number correctly");
  it("shows blank cell as green");
  it("highlights called numbers");
  it("marks on click");
});
```

### Integration Testing (Future)

```tsx
// Test component interactions
describe("CardGrid", () => {
  it("renders all 27 cells");
  it("marks cells on click");
  it("detects complete rows");
});
```

### Visual Testing (Manual)

```tsx
// See TEST.md for checklist
- Visual appearance
- Responsive design
- Interactions
- Animations
- States
- Accessibility
```

## Error Handling

### Prop Validation

```tsx
// TypeScript provides compile-time validation
cards: Card[]              // Must be Card array
calledNumbers: Set<number> // Must be Set, not array

// Runtime validation in components
if (!card || card.length !== 3) return null;
if (!row || row.length !== 9) continue;
```

### Null Safety

```tsx
// Optional chaining
const topLeft = card[0]?.[0];

// Null checks
if (value === null) return <BlankCell />;

// Type guards
const rowNumbers = row.filter((cell): cell is number => cell !== null);
```

### Edge Cases

```tsx
// Empty arrays
if (cards.length === 0) return <EmptyState />;

// Invalid data
if (!isCard(card)) return null;

// Out of range
if (number < 1 || number > 90) return;
```

## Future Enhancements

### Planned Features

- [ ] Sound effects on number call
- [ ] Confetti animation on win
- [ ] Card flip animation on generate
- [ ] Print layout for physical cards
- [ ] Export cards as images
- [ ] Multiple card selection
- [ ] Heat map visualization

### Performance Improvements

- [ ] Virtual scrolling for 100+ cards
- [ ] Web Workers for calculations
- [ ] Lazy loading for off-screen cards
- [ ] Progressive enhancement

### Accessibility Improvements

- [ ] High contrast mode
- [ ] Reduced motion mode
- [ ] Voice commands
- [ ] Screen reader optimizations

## Summary

This architecture provides:

- ✅ Clear separation of concerns
- ✅ Unidirectional data flow
- ✅ Performance optimization
- ✅ Accessibility support
- ✅ Type safety
- ✅ Maintainability
- ✅ Scalability
- ✅ Testability

The component tree is shallow (max 3 levels), prop drilling is minimal, and each component has a single, well-defined responsibility.
