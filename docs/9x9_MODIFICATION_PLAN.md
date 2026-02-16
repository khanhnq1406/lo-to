# Modification Plan: 9×9 Grid Format

## Current Format (Authentic Vietnamese Lô Tô)
- **Grid**: 9 columns × 3 rows = 27 cells
- **Numbers**: 15 per card (1-90)
- **Blanks**: 12 per card
- **Numbers per row**: 5 numbers + 4 blanks

## Requested Format (Custom 9×9)
- **Grid**: 9 columns × 9 rows = 81 cells
- **Numbers**: ??? (needs to be decided)
- **Blanks**: ??? (needs to be decided)
- **Numbers per row**: ??? (needs to be decided)

---

## Design Questions to Answer:

### 1. How many numbers per card?
**Options:**
- **Option A**: 45 numbers (81 cells - 36 blanks) - half filled
- **Option B**: 90 numbers (all cells filled, no blanks)
- **Option C**: Custom amount (e.g., 54 numbers = 27 blanks)

### 2. How many numbers per row?
**Options:**
- **Option A**: 5 numbers per row (like authentic) = 5 × 9 = 45 total
- **Option B**: 9 numbers per row (all filled) = 81 total
- **Option C**: Custom amount per row

### 3. Column constraints?
**Options:**
- **Option A**: Keep existing (Col 0=1-9, Col 1=10-19, ..., Col 8=80-90)
- **Option B**: Remove constraints (random placement)
- **Option C**: New constraint system

### 4. Win condition?
**Options:**
- **Option A**: Complete any horizontal row (9 numbers)
- **Option B**: Complete multiple rows (e.g., 3 rows)
- **Option C**: Column wins, diagonal wins, patterns

---

## Recommendation

Based on Vietnamese Lô Tô tradition, if moving to 9×9:

### Suggested Format:
```
9 columns × 9 rows = 81 cells
45 numbers per card (5 per row × 9 rows)
36 blanks per card (4 per row × 9 rows)
Each row: 5 numbers + 4 blanks
Column constraints: Keep existing (Col 0=1-9, etc.)
Win condition: Complete any horizontal row (5 numbers)
```

### Visual Example:
```
┌────┬────┬────┬────┬────┬────┬────┬────┬────┐
│  3 │    │ 25 │    │ 47 │    │    │ 72 │    │  Row 0: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │ 12 │    │ 33 │    │ 56 │ 68 │    │ 89 │  Row 1: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│  7 │    │ 21 │    │ 44 │    │ 61 │    │ 90 │  Row 2: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│  1 │ 15 │    │ 38 │    │    │ 63 │ 76 │    │  Row 3: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │ 22 │    │ 41 │ 52 │    │    │ 84 │  Row 4: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│  6 │ 18 │    │    │ 46 │    │ 69 │    │ 87 │  Row 5: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │ 28 │ 35 │    │ 57 │    │ 79 │    │  Row 6: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│  4 │    │    │ 36 │ 48 │    │ 64 │    │ 82 │  Row 7: 5 numbers
├────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │ 13 │ 29 │    │    │ 59 │    │ 71 │ 86 │  Row 8: 5 numbers
└────┴────┴────┴────┴────┴────┴────┴────┴────┘
  Total: 45 numbers (5 per row × 9 rows)
         36 blanks (4 per row × 9 rows)
```

This maintains the traditional "5 numbers + 4 blanks per row" pattern while expanding to 9 rows.

---

## Files That Need Modification

### 1. `lib/game.ts` - Core game logic
- `generateCard()` function - change from 3 rows to 9 rows
- Update total numbers from 15 to 45
- Keep same column constraint logic
- Update validation logic

### 2. `components/game/CardGrid.tsx` - Display component
- Change `gridTemplateRows: 'repeat(3, 1fr)'` to `'repeat(9, 1fr)'`
- Adjust cell sizing for more rows

### 3. `components/game/NumberCell.tsx` - Cell component
- Adjust cell height for 9 rows to fit screen

### 4. `types/index.ts` - Type definitions
- Update comments/documentation

### 5. `lib/game.test.ts` - Unit tests
- Update test expectations (15 → 45 numbers, etc.)

---

## Question for You:

**Please confirm your preferences:**

1. **How many numbers per card?**
   - [ ] 45 numbers (5 per row, like authentic pattern)
   - [ ] 90 numbers (all cells filled)
   - [ ] Other: _______

2. **How many numbers per row?**
   - [ ] 5 numbers + 4 blanks (like authentic)
   - [ ] 9 numbers (all filled)
   - [ ] Other: _______

3. **Win condition?**
   - [ ] Complete any row (5 or 9 numbers depending on choice above)
   - [ ] Complete multiple rows
   - [ ] Other: _______

4. **Keep column constraints?**
   - [ ] Yes (Col 0=1-9, Col 1=10-19, etc.)
   - [ ] No (random placement)

Once you confirm these choices, I'll implement the 9×9 format for you!

