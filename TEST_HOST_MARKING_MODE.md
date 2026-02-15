# Testing Host-Controlled Marking Mode

## Quick Test Guide

### Setup
1. Server is running at: http://localhost:3000
2. Open **two browser windows** (or one normal + one incognito)

---

## Test 1: Host Can Control Mode ✅

**Window 1 (Host):**
1. Open http://localhost:3000
2. Create a new room
3. Select 1-3 cards from the grid
4. Look for the toggle button in "Vé của bạn" section
5. You should see: **[⚡ Tự động đánh dấu]** (Green button)
6. Click the button
7. It should change to: **[🖱️ Đánh dấu thủ công]** (Blue button)
8. Click again to toggle back

**Expected:**
- ✅ Button changes color (Green ↔ Blue)
- ✅ Text changes (Tự động ↔ Thủ công)
- ✅ Icon changes (⚡ ↔ 🖱️)
- ✅ Explanation text below updates

---

## Test 2: Players See Mode (Cannot Change) ✅

**Window 2 (Player):**
1. Copy the room ID from Window 1
2. Open http://localhost:3000
3. Join the room
4. Select 1-3 cards
5. Look for the mode indicator in "Vé của bạn" section
6. You should see: **[⚡ Tự động đánh dấu]** (Light green badge, NOT clickable)

**Window 1 (Host):**
7. Click toggle to change to Manual mode

**Window 2 (Player):**
8. Watch the indicator - it should update automatically
9. Should now show: **[🖱️ Đánh dấu thủ công]** (Light blue badge)

**Expected:**
- ✅ Player sees badge (not button)
- ✅ Badge matches host's current mode
- ✅ Badge updates immediately when host changes mode
- ✅ Player cannot click the badge

---

## Test 3: Auto Mode During Game ✅

**Window 1 (Host):**
1. Make sure mode is: **[⚡ Tự động đánh dấu]** (Auto mode)
2. Click "Bắt đầu" (Start game)
3. Game starts calling numbers

**Both Windows:**
4. Watch your cards
5. Numbers should automatically turn **GOLD** when called
6. No clicking needed

**Expected:**
- ✅ Called numbers auto-mark gold on both players' cards
- ✅ No manual clicking required
- ✅ All players see numbers marked immediately

---

## Test 4: Manual Mode During Game ✅

**Window 1 (Host):**
1. If game is running, reset it
2. Switch to: **[🖱️ Đánh dấu thủ công]** (Manual mode)
3. Start game again
4. Numbers are called

**Both Windows:**
5. Called numbers should **PULSE YELLOW** (not auto-marked)
6. **Click on the pulsing numbers** to mark them
7. Clicked numbers turn **GOLD**

**Expected:**
- ✅ Called numbers pulse yellow (reminder to click)
- ✅ Must click to turn them gold
- ✅ Works the same for both host and player
- ✅ Explanation text says "Nhấn vào số để đánh dấu"

---

## Test 5: Switch Mode Mid-Game ✅

**Window 1 (Host):**
1. Start game in Auto mode
2. Wait for 2-3 numbers to be called (auto-marked)
3. **Switch to Manual mode**
4. Next numbers should require clicking

**Both Windows:**
5. Previous numbers stay gold (already marked)
6. New numbers pulse yellow (need clicking)
7. Click new numbers to mark them

**Window 1 (Host):**
8. **Switch back to Auto mode**
9. Next numbers auto-mark again

**Expected:**
- ✅ Can switch modes anytime (host only)
- ✅ Previous marks remain
- ✅ New numbers follow current mode
- ✅ All players follow host's mode immediately

---

## Test 6: Permissions ✅

**Window 2 (Player):**
1. Try to inspect element and click the mode badge
2. Nothing should happen (it's read-only)

**Window 1 (Host):**
3. Toggle should work normally

**Expected:**
- ✅ Only host has clickable toggle
- ✅ Players have read-only indicator
- ✅ Server enforces host permission

---

## Visual Reference

### Host View (Green = Auto, Blue = Manual)
```
Auto Mode:
┌─────────────────────────────────────────┐
│ Thẻ của bạn: 3   [⚡ Tự động đánh dấu]  │ ← Clickable, green
│                                         │
│ ⚡ Chế độ tự động: Số được gọi sẽ tự... │
└─────────────────────────────────────────┘

Manual Mode:
┌─────────────────────────────────────────┐
│ Thẻ của bạn: 3   [🖱️ Đánh dấu thủ công] │ ← Clickable, blue
│                                         │
│ 🖱️ Chế độ thủ công: Nhấn vào số trên...│
└─────────────────────────────────────────┘
```

### Player View (Light colors = Read-only)
```
Auto Mode:
┌─────────────────────────────────────────┐
│ Thẻ của bạn: 3   [⚡ Tự động đánh dấu]  │ ← Badge, light green
│                                         │
│ ⚡ Chế độ tự động: Số được gọi sẽ tự... │
└─────────────────────────────────────────┘

Manual Mode:
┌─────────────────────────────────────────┐
│ Thẻ của bạn: 3   [🖱️ Đánh dấu thủ công] │ ← Badge, light blue
│                                         │
│ 🖱️ Chế độ thủ công: Nhấn vào số trên...│
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: Button not showing for host
- **Fix**: Make sure you're the room creator (first player)
- Check console for errors

### Issue: Mode not updating for players
- **Fix**: Check socket connection (should see "Connected" in console)
- Refresh the page and rejoin

### Issue: Numbers not auto-marking in auto mode
- **Fix**: Check that mode is actually "Tự động đánh dấu" (green)
- Check that game has started
- Check browser console for errors

### Issue: Cannot click numbers in manual mode
- **Fix**: Make sure mode is "Đánh dấu thủ công" (blue)
- Only called numbers (yellow pulse) are clickable
- Refresh if needed

---

## Success Criteria ✅

All tests passing means:
- ✅ Host can toggle mode
- ✅ Players see current mode
- ✅ Mode syncs in real-time
- ✅ Auto mode works (no clicking)
- ✅ Manual mode works (must click)
- ✅ Can switch mid-game
- ✅ Permissions enforced

Happy testing! 🎴✨
