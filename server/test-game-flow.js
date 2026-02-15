/**
 * Comprehensive Socket.io test - Full game flow
 * Tests: create room → join room → generate cards → start game → call numbers → claim win
 */

const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3002';

console.log('🎮 Testing full game flow...\n');

let host, player2;
let roomId;

// Create host socket
host = io(SOCKET_URL, { transports: ['websocket'] });

host.on('connect', () => {
  console.log('✅ Host connected:', host.id);

  // Step 1: Create room
  console.log('📝 Step 1: Host creating room...');
  host.emit('create_room', {
    playerName: 'Host Player',
    callerMode: 'manual',
    machineInterval: 3000,
  });
});

host.on('room_update', (data) => {
  const room = data.room;
  roomId = room.id;

  console.log(`   Room state: ${room.gameState}, Players: ${room.players.length}`);

  // Step 2: Second player joins
  if (room.players.length === 1 && !player2) {
    console.log('\n📝 Step 2: Second player joining room...');
    player2 = io(SOCKET_URL, { transports: ['websocket'] });

    player2.on('connect', () => {
      console.log('✅ Player 2 connected:', player2.id);
      player2.emit('join_room', {
        roomId: roomId,
        playerName: 'Player 2',
      });
    });

    player2.on('room_update', (data) => {
      console.log(`   Player 2 sees room with ${data.room.players.length} players`);
    });

    player2.on('tickets_generated', (data) => {
      console.log(`   Player 2 generated ${data.tickets.length} cards`);
    });

    player2.on('error', (error) => {
      console.error('❌ Player 2 error:', error);
    });
  }

  // Step 3: Generate tickets for both players
  if (room.players.length === 2 && room.players[0].tickets.length === 0) {
    console.log('\n📝 Step 3: Generating cards for both players...');
    host.emit('generate_tickets', {
      roomId: roomId,
      cardCount: 2,
    });

    setTimeout(() => {
      player2.emit('generate_tickets', {
        roomId: roomId,
        cardCount: 2,
      });
    }, 100);
  }

  // Step 4: Start game
  if (room.players.length === 2 &&
      room.gameState === 'waiting' &&
      room.players.every(p => p.tickets.length > 0) &&
      !room.currentNumber) {
    console.log('\n📝 Step 4: Host starting game...');
    setTimeout(() => {
      host.emit('start_game', {
        roomId: roomId,
      });
    }, 500);
  }
});

host.on('tickets_generated', (data) => {
  console.log(`✅ Host generated ${data.tickets.length} cards`);
});

host.on('game_started', (data) => {
  console.log('✅ Game started in room:', data.roomId);

  // Step 5: Call some numbers (manual mode)
  console.log('\n📝 Step 5: Calling numbers manually...');
  const numbersToCall = [5, 15, 25, 35, 45];

  numbersToCall.forEach((num, index) => {
    setTimeout(() => {
      host.emit('call_number', {
        roomId: roomId,
        number: num,
      });
    }, (index + 1) * 500);
  });
});

host.on('number_called', (data) => {
  console.log(`✅ Number called: ${data.number} (Remaining: ${data.remainingCount})`);

  // Step 6: Try to claim win (will likely fail since we need a full row)
  if (data.calledHistory.length === 5) {
    console.log('\n📝 Step 6: Testing win claim (expected to fail)...');
    setTimeout(() => {
      host.emit('claim_win', {
        roomId: roomId,
        ticketIndex: 0,
        boardIndex: 0,
        type: 'row',
      });
    }, 500);
  }
});

host.on('game_finished', (data) => {
  console.log('✅ Game finished! Winner:', data.winner.playerName);
  cleanup(true);
});

host.on('error', (error) => {
  console.log('⚠️  Expected error:', error.message);

  // If we got the expected "Invalid win claim" error, test passed
  if (error.message.includes('Invalid win claim') || error.message.includes('win condition not met')) {
    console.log('\n✅ All tests passed! Server is working correctly.');
    cleanup(true);
  } else {
    console.error('❌ Unexpected error:', error);
    cleanup(false);
  }
});

host.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  cleanup(false);
});

function cleanup(success) {
  setTimeout(() => {
    console.log('\n🧹 Cleaning up...');
    if (host) host.disconnect();
    if (player2) player2.disconnect();
    process.exit(success ? 0 : 1);
  }, 1000);
}

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Test timeout');
  cleanup(false);
}, 15000);
