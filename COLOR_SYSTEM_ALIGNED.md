# Color System Alignment - Complete

## Overview
All colors in the system are now aligned to use the actual RGB values extracted from the card images as the single source of truth.

## Actual Card Colors (Base Colors)

All colors are defined in `/lib/card-configs.ts` and used throughout the system:

### Cards 1-2 (Red/Pink-Red)
- **RGB**: `236, 125, 151`
- **Hex Primary**: `#EC7D97`
- **Hex Dark**: `#D05A76`
- **Hex Light**: `#F5B3C4`

### Cards 3-4 (Blue/Coral)
- **RGB**: `238, 119, 107`
- **Hex Primary**: `#EE776B`
- **Hex Dark**: `#D9584A`
- **Hex Light**: `#F7B0A8`

### Cards 5-6 (Purple)
- **RGB**: `130, 76, 175`
- **Hex Primary**: `#824CAF`
- **Hex Dark**: `#6A3C8E`
- **Hex Light**: `#B88DD4`

### Cards 7-8 (Orange)
- **RGB**: `226, 131, 86`
- **Hex Primary**: `#E28356`
- **Hex Dark**: `#C86A3F`
- **Hex Light**: `#F0B08F`

### Cards 9-10 (Yellow)
- **RGB**: `215, 192, 81`
- **Hex Primary**: `#D7C051`
- **Hex Dark**: `#B8A13A`
- **Hex Light**: `#E8D88A`

### Cards 11-12 (Green)
- **RGB**: `130, 175, 108`
- **Hex Primary**: `#82AF6C`
- **Hex Dark**: `#68904F`
- **Hex Light**: `#ACCF9B`

### Cards 13-14 (Cyan/Blue)
- **RGB**: `63, 145, 204`
- **Hex Primary**: `#3F91CC`
- **Hex Dark**: `#2C6FA3`
- **Hex Light**: `#7BB3DD`

### Cards 15-16 (Pink/Olive)
- **RGB**: `154, 159, 73`
- **Hex Primary**: `#9A9F49`
- **Hex Dark**: `#7A7F32`
- **Hex Light**: `#BBBF77`

## Color Usage Throughout System

### 1. Card Configuration (`/lib/card-configs.ts`)
✅ **Single source of truth** - All colors defined here

**Exports:**
- `ACTUAL_CARD_COLORS` - Hex color objects with primary, dark, light shades
- `COLOR_CLASSES` - Tailwind CSS classes using arbitrary values `[#HEX]`
- `getCardConfig()` - Get full card config including hex colors
- `getCardColorClasses()` - Get Tailwind classes for a card
- `getCardActualColors()` - Get hex color object for a card
- `getBlankCellColor()` - Get primary color for blank cells
- `getBlankCellBorderColor()` - Get dark shade for borders

### 2. Blank Cells in PlayableCardImage (`/components/game/PlayableCardImage.tsx`)
✅ **Now using centralized functions**

```tsx
backgroundColor: getBlankCellColor(cardId)
borderColor: getBlankCellBorderColor(cardId)
```

### 3. Card Selector (`/components/game/CardSelector.tsx`)
✅ **Using COLOR_CLASSES with actual colors**

- Card borders: Uses `colorClasses.border` → `border-[#HEX]`
- Card badges: Uses `colorClasses.bg` → `bg-[#HEX]`
- Hover states: Uses `colorClasses.hover` → `hover:border-[#HEX]`
- Ring effects: Uses `colorClasses.ring` → `ring-[#HEX]`

### 4. Selected Cards Display (`/components/game/SelectedCardsDisplay.tsx`)
✅ **Inherits from PlayableCardImage** which uses actual colors

### 5. Card Generator (`/components/game/CardGenerator.tsx`)
✅ **Uses getCardColorClasses()** with actual colors

## Benefits of This Alignment

1. **Single Source of Truth**: All colors defined in one place (`card-configs.ts`)
2. **Consistency**: Same colors used everywhere in the system
3. **Maintainability**: Change colors in one place, updates everywhere
4. **Accuracy**: Colors match actual card images exactly
5. **Type Safety**: TypeScript ensures correct color usage

## Testing Checklist

- [x] Card 1-2: Pink-red blank cells `#EC7D97`
- [x] Card 3-4: Coral blank cells `#EE776B`
- [x] Card 5-6: Purple blank cells `#824CAF`
- [x] Card 7-8: Orange blank cells `#E28356`
- [x] Card 9-10: Yellow blank cells `#D7C051`
- [x] Card 11-12: Green blank cells `#82AF6C`
- [x] Card 13-14: Blue blank cells `#3F91CC`
- [x] Card 15-16: Olive blank cells `#9A9F49`
- [x] Card selector borders match card colors
- [x] Card badges use correct colors
- [x] Hover states use darker shades
- [x] All colors consistent across mobile and desktop

## Files Modified

1. `/lib/card-configs.ts` - Added actual colors, utility functions
2. `/components/game/PlayableCardImage.tsx` - Use centralized color functions
3. All other components automatically inherit the correct colors

## Usage Examples

```tsx
// Get hex color for blank cells
const blankColor = getBlankCellColor(cardId); // '#EC7D97' for cards 1-2

// Get border color
const borderColor = getBlankCellBorderColor(cardId); // '#D05A76' for cards 1-2

// Get Tailwind classes (for existing code)
const classes = getCardColorClasses(cardId);
// Returns: { border: 'border-[#EC7D97]', bg: 'bg-[#F5B3C4]', ... }

// Get actual color object
const colors = getCardActualColors(cardId);
// Returns: { primary: '#EC7D97', dark: '#D05A76', light: '#F5B3C4', ... }
```

## Next Steps

All colors are now aligned! The system uses the actual card colors throughout:
- ✅ Blank cells match card images
- ✅ Borders use darker shades
- ✅ Badges use lighter shades
- ✅ All components consistent
- ✅ Single source of truth established
