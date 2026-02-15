# Component Testing Guide

## Quick Test

To test the components, you can create a test page:

### 1. Create a test page

Create `/app/test-cards/page.tsx`:

```tsx
import { TicketDisplayExample } from '@/components/game/TicketDisplay.example';

export default function TestCardsPage() {
  return <TicketDisplayExample />;
}
```

### 2. Run the dev server

```bash
npm run dev
```

### 3. Visit the test page

Open your browser to: `http://localhost:3000/test-cards`

## What to Test

### Visual Appearance
- [ ] Cards display in 3×9 grid format
- [ ] Off-white paper background (#FBF9F4)
- [ ] Dark green borders (#2D5016)
- [ ] Numbers are bold and readable
- [ ] Blank cells show green background
- [ ] Paper texture visible

### Responsive Design
- [ ] **Desktop (>1024px)**: 3 cards per row
- [ ] **Tablet (640-1024px)**: 2 cards per row
- [ ] **Mobile (<640px)**: 1 card per row (stacked)
- [ ] Cards scale appropriately
- [ ] Text remains readable at all sizes

### Interactions
- [ ] Click on number cells to mark/unmark
- [ ] Checkmark appears on marked cells
- [ ] Hover effect on cells (desktop)
- [ ] Touch works on mobile (no double-tap)
- [ ] "Call Random Number" button works
- [ ] Called numbers highlight in yellow/gold

### Animations
- [ ] Cards fade in on load
- [ ] Called numbers pulse
- [ ] Marked cells have stamp effect
- [ ] Smooth transitions between states
- [ ] No janky animations
- [ ] 60fps on modern devices

### States
- [ ] Normal cells: white background
- [ ] Blank cells: green background
- [ ] Called cells: yellow highlight
- [ ] Marked cells: green with checkmark
- [ ] Complete row: gold gradient (test by calling all numbers in a row)

### Accessibility
- [ ] Tab navigation works
- [ ] Enter/Space marks cells
- [ ] Screen reader announces states
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] ARIA labels present

### Statistics
- [ ] Total cards count correct
- [ ] Called numbers count updates
- [ ] Progress shows (X/15 per card)
- [ ] Last number displays

### Edge Cases
- [ ] Empty state (no cards) shows correctly
- [ ] Single card works
- [ ] Many cards (10+) work
- [ ] All numbers called (90/90)
- [ ] No numbers called (0/90)

## Manual Testing Scenarios

### Scenario 1: New Game
1. Load page with 3 sample cards
2. Verify all cards show correctly
3. No numbers should be highlighted
4. All progress should show 0/15

### Scenario 2: Calling Numbers
1. Click "Call Random Number"
2. Number should appear in stats
3. Matching cells should highlight yellow
4. Called count should increment
5. Progress bars should update

### Scenario 3: Manual Marking
1. Click on a number cell
2. Green checkmark should appear
3. Click again to unmark
4. Checkmark should disappear
5. Works on any number (called or not)

### Scenario 4: Winning Row
1. Click "Call Random Number" repeatedly
2. When a complete row is called (5 numbers):
   - Row should highlight in gold
   - Win indicator should appear in card header
   - "Complete row detected!" message shows
3. Test continues normally after win

### Scenario 5: Auto-Calling
1. Click "Auto Call"
2. Numbers should be called every 2 seconds
3. UI should update automatically
4. Click "Stop Auto" to pause
5. Can resume with "Auto Call" again

### Scenario 6: Responsive Resize
1. Start at desktop size (>1024px) - see 3 cards per row
2. Resize to tablet (768px) - should show 2 per row
3. Resize to mobile (375px) - should stack vertically
4. All cards should remain readable and functional

### Scenario 7: Many Cards
To test with more cards, modify the example file to have 6-9 cards and verify:
- [ ] Grid layout works with many cards
- [ ] Scrolling is smooth
- [ ] Performance is acceptable
- [ ] No memory issues

## Performance Testing

### Metrics to Check
- [ ] Initial load < 1s
- [ ] Card render < 100ms
- [ ] Number call animation < 500ms
- [ ] No layout shifts (CLS score 0)
- [ ] 60fps during animations
- [ ] Memory usage stable

### Chrome DevTools
1. Open Performance tab
2. Record while calling numbers
3. Check for:
   - Long tasks (>50ms)
   - Layout thrashing
   - Memory leaks
   - Excessive rerenders

### React DevTools
1. Enable "Highlight updates"
2. Call a number
3. Only affected cells should highlight
4. Entire grid should NOT rerender

## Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Known Issues & Limitations

### Current
- None identified

### Future Enhancements
- Sound effects on number call
- Confetti animation on win
- Print layout for cards
- Export cards as images

## Debugging Tips

### Cards not showing
```tsx
// Check card data structure
console.log('Cards:', cards);
console.log('Card 0:', cards[0]);
console.log('Is valid 3×9?', cards[0]?.length === 3 && cards[0][0]?.length === 9);
```

### Numbers not highlighting
```tsx
// Check called numbers
console.log('Called:', calledNumbers);
console.log('Is Set?', calledNumbers instanceof Set);
console.log('Has 5?', calledNumbers.has(5));
```

### Animations stuttering
```tsx
// Check render count
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current++;
  console.log('Component rendered:', renderCount.current);
});
```

### Store not updating
```tsx
// Check store connection
import { useGameStore } from '@/store/useGameStore';
const room = useGameStore(state => state.room);
console.log('Room:', room);
```

## Success Criteria

Components are ready for production when:
- ✅ All visual tests pass
- ✅ All interaction tests pass
- ✅ All accessibility tests pass
- ✅ Performance metrics met
- ✅ Works in all major browsers
- ✅ No console errors or warnings
- ✅ TypeScript compiles without errors
- ✅ Responsive on all screen sizes
