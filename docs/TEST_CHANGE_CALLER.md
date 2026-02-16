# Testing the Change Caller Feature

## Prerequisites
1. Make sure both servers are running:
   ```bash
   # Terminal 1: Start Next.js app
   npm run dev

   # Terminal 2: Start Socket.IO server
   cd server
   npm start
   ```

2. Open two browser windows/tabs (or use two different browsers)

## Test Scenario 1: Basic Caller Change

### Step 1: Create Room (Browser 1)
1. Go to `http://localhost:3000`
2. Enter your name: "Player 1"
3. Click "Tạo phòng mới" (Create new room)
4. You should see:
   - You are the host
   - You have the "Người gọi số" (Caller) badge
   - Caller Controls panel is visible

### Step 2: Join Room (Browser 2)
1. Go to `http://localhost:3000`
2. Enter your name: "Player 2"
3. Enter the room code from Browser 1
4. Click "Tham gia phòng" (Join room)
5. You should see:
   - You are NOT the host
   - You do NOT have the caller badge

### Step 3: Change Caller (Browser 1)
1. In the Caller Controls panel, find the dropdown labeled "Người gọi số"
2. You should see two options:
   - Player 1 (Chủ phòng) ← Currently selected
   - Player 2
3. Select "Player 2" from the dropdown

### Step 4: Verify Change (Both Browsers)
**Browser 1:**
- You still see the controls (you're the host)
- Player 2 should now have the "Người gọi số" badge in the player list

**Browser 2:**
- You should now see the "Người gọi số" badge next to your name
- You can now see caller controls (if in manual mode)

## Test Scenario 2: Caller in Manual Mode

### Continuing from Scenario 1...

### Step 5: Set Manual Mode (Browser 1 - Host)
1. In Caller Controls, under "Chế độ gọi số"
2. Click "Thủ công" (Manual)

### Step 6: Start Game (Browser 1 - Host)
1. Both players should generate cards first
2. Click "Bắt đầu chơi" (Start game)

### Step 7: Verify Caller Can Call Numbers (Browser 2 - Caller)
1. You should see a button: "Gọi số ngẫu nhiên" (Call random number)
2. Click it
3. A number should be called
4. Both browsers should see the number

### Step 8: Verify Host Cannot Call (Browser 1 - Host)
1. You should NOT see the "Gọi số ngẫu nhiên" button
2. Only the caller (Player 2) can call numbers

## Test Scenario 3: Restrictions

### Test 3A: Cannot Change After Game Starts
1. Start a game
2. The caller dropdown should disappear or be disabled
3. Caller cannot be changed during the game

### Test 3B: Only Host Can Change
1. In Browser 2 (non-host), the caller dropdown should NOT be visible
2. Only Browser 1 (host) can see and use the dropdown

### Test 3C: Need Multiple Players
1. Create a room with only 1 player (just you)
2. The caller dropdown should NOT appear
3. It only shows when there are 2+ players

## Expected Results

✅ **Success Indicators:**
- Dropdown appears for host when 2+ players present
- Dropdown shows all player names with host indicator
- Selecting a player immediately updates their caller status
- Caller badge appears/disappears correctly on both clients
- Only the designated caller can call numbers in manual mode
- Dropdown disappears when game starts
- Non-hosts cannot see the dropdown

❌ **Failure Indicators:**
- Dropdown doesn't appear when it should
- Selecting player doesn't update caller status
- Changes not synchronized between clients
- Non-host can see/use the dropdown
- Can change caller after game starts
- Console errors in browser or server

## Troubleshooting

### Issue: Dropdown not appearing
**Check:**
- Are you the host?
- Is the game state "waiting" (not started)?
- Are there 2 or more players in the room?

### Issue: Changes not syncing
**Check:**
- Are both clients connected to the socket server?
- Check browser console for connection errors
- Check server terminal for socket errors

### Issue: Caller can't call numbers
**Check:**
- Is the caller mode set to "Thủ công" (Manual)?
- Has the game started?
- Is the player actually designated as caller? (Check badge)

## Success Criteria

All tests pass if:
1. ✅ Host can change caller via dropdown
2. ✅ Changes sync to all clients in real-time
3. ✅ Only designated caller can call numbers in manual mode
4. ✅ Dropdown only shows before game starts
5. ✅ Only host can access the dropdown
6. ✅ All players see correct caller badges
7. ✅ No console errors or TypeScript errors

## Notes
- The feature is designed to be used before starting the game
- Once the game starts, the caller is locked in
- The host always retains host privileges (start game, reset, etc.)
- Only the caller role is transferred, not the host role
