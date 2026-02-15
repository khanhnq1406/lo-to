# Testing Multiple Card Selection

## Quick Test Guide

### 1. Start the Server
```bash
pnpm dev
# Server should start on http://localhost:3000
```

### 2. Test Single Player Selection

**Open Browser 1:**
1. Go to http://localhost:3000
2. Enter name: "Player 1"
3. Click "Tạo Phòng Mới" (no card count selection!)
4. You should see the card grid

**Select Multiple Cards:**
1. Click Card #1 → Should show green border + checkmark
2. Click Card #5 → Should ALSO show green border
3. Click Card #9 → Now you have 3 cards selected
4. Top banner should say: "✓ Bạn đã chọn 3 thẻ: 1, 5, 9"
5. Should also say: "Bạn có thể chọn thêm 2 thẻ nữa"

**Deselect a Card:**
1. Click Card #1 again → Should deselect (remove green border)
2. Now should show: "✓ Bạn đã chọn 2 thẻ: 5, 9"
3. Should say: "Bạn có thể chọn thêm 3 thẻ nữa"

**Test Max Limit:**
1. Select cards: 1, 2, 3, 4, 5 (5 cards total)
2. Should say: "Bạn đã chọn đủ số lượng thẻ tối đa"
3. Try clicking Card #6 → Should show alert: "Bạn chỉ có thể chọn tối đa 5 thẻ!"

### 3. Test Multi-Player Real-Time Sync

**Open Browser 2 (Incognito/Different Browser):**
1. Go to http://localhost:3000
2. Click "Tham Gia Phòng"
3. Enter the room code from Browser 1
4. Enter name: "Player 2"
5. Click "Tham Gia Phòng"

**Verify Real-Time Sync:**
1. In Browser 2, Player 1's cards (1, 2, 3, 4, 5) should show:
   - Grayed out with lock icon
   - Owner name: "Player 1"
   - Cannot click them
2. Select Card #6 as Player 2
3. In Browser 1, Card #6 should immediately show as taken by "Player 2"

**Select Multiple as Player 2:**
1. Select cards: 6, 7, 8 (3 cards)
2. All should show green border
3. In Browser 1, all 3 should show as taken
4. Both players should see correct selections

### 4. Test Deselection Sync

**In Browser 1 (Player 1):**
1. Click Card #3 to deselect
2. Card #3 should lose green border
3. In Browser 2, Card #3 should immediately become available

**In Browser 2 (Player 2):**
1. Quickly select Card #3 (now available)
2. Should work successfully
3. In Browser 1, Card #3 should show as taken by "Player 2"

### 5. Test Game Start Lock

**In Browser 1 (Host):**
1. Scroll down to controls
2. Click "Bắt Đầu Trò Chơi"
3. Card Selector should **disappear**
4. Game should start

**Verify Lock:**
1. In Browser 2, Card Selector should also disappear
2. Selected cards are now locked
3. Cannot select/deselect anymore

---

## 🐛 What to Look For

### Expected Behavior
✅ Can select multiple cards (up to 5)
✅ Clicking own card deselects it
✅ Other players' cards show grayed out
✅ Real-time updates across all browsers
✅ Alert when trying to select 6th card
✅ Cards lock when game starts

### Bugs to Watch For
❌ Only 1 card selects (previous behavior)
❌ Previous cards disappear when selecting new one
❌ Cards don't sync across browsers
❌ Can select more than 5 cards
❌ Can select other players' cards
❌ Can change selection after game starts

---

## 📝 Debug Tips

### Check Browser Console
```javascript
// Should see these logs:
[CardSelection] Selecting card: 1
[Card] Selected: {cardId: 1, playerId: "...", playerName: "..."}
[Room] Card 1 selected by Player 1 in room ABC123
```

### Check Server Console
```
[Room] Card 1 selected by Player 1 in room ABC123
[Room] Card 5 selected by Player 1 in room ABC123
[Room] Card 9 selected by Player 1 in room ABC123
```

### Check Network Tab
```
WebSocket frames:
→ select_card {roomId: "ABC123", cardId: 1}
← card_selected {cardId: 1, playerId: "...", playerName: "..."}
← room_update {room: {selectedCards: {1: "..."}}}
```

### Check State
Open React DevTools:
```javascript
// In useGameStore:
room.selectedCards = {
  1: "player1-socket-id",
  5: "player1-socket-id",
  9: "player1-socket-id",
  6: "player2-socket-id"
}
```

---

## ✅ Test Results

After completing all tests above, you should verify:

- [ ] Can select multiple cards (tested with 1, 2, 3 cards)
- [ ] Can select up to 5 cards maximum
- [ ] Alert shows when trying to select 6th card
- [ ] Can deselect individual cards by clicking them
- [ ] Counter shows correct count and remaining slots
- [ ] Real-time sync works across multiple browsers
- [ ] Other players' cards show as disabled/taken
- [ ] Cannot select other players' cards
- [ ] Cards lock when game starts
- [ ] Card Selector disappears when game starts
- [ ] No CardGenerator component visible
- [ ] Create/Join forms don't have card count selector

---

## 🎉 Success Criteria

If all checkboxes above are checked ✅, then:
**Multiple card selection is working perfectly!**

You should be able to:
1. Select any combination of 1-5 cards
2. Add and remove cards freely before game starts
3. See all players' selections in real-time
4. Have cards automatically lock when game begins

Enjoy your enhanced card selection system! 🎴✨
