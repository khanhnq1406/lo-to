/**
 * Reset Game Test - Verifies that machine calling stops when game is reset
 */

const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3003';

console.log('🔄 Testing reset game functionality...\n');

let socket;
let roomId;
let numbersCalledBeforeReset = 0;
let numbersCalledAfterReset = 0;
let gameReset = false;

socket = io(SOCKET_URL, { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  // Create room with machine mode
  console.log('📝 Creating room with machine mode (1 second interval)...');
  socket.emit('create_room', {
    playerName: 'Reset Test',
    callerMode: 'machine',
    machineInterval: 1000, // 1 second for faster testing
  });
});

socket.on('room_update', (data) => {
  const room = data.room;
  roomId = room.id;

  // Generate tickets if needed
  if (room.gameState === 'waiting' && room.players[0].tickets.length === 0) {
    console.log('📝 Generating tickets...');
    socket.emit('generate_tickets', {
      roomId: roomId,
      cardCount: 1,
    });
  }

  // Check if game was reset
  if (gameReset && room.gameState === 'waiting') {
    console.log('✅ Game state returned to waiting after reset');
    console.log(`✅ Called history cleared: ${room.calledHistory.length === 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Current number cleared: ${room.currentNumber === null ? 'YES' : 'NO'}`);

    // Wait 3 more seconds to ensure no numbers are called
    console.log('\n⏳ Waiting 3 seconds to verify machine calling stopped...');
    setTimeout(() => {
      if (numbersCalledAfterReset === 0) {
        console.log(`\n✅ SUCCESS! No numbers called after reset`);
        console.log(`   Numbers before reset: ${numbersCalledBeforeReset}`);
        console.log(`   Numbers after reset: ${numbersCalledAfterReset}`);
        socket.disconnect();
        process.exit(0);
      } else {
        console.error(`\n❌ FAILED! ${numbersCalledAfterReset} numbers called after reset`);
        console.error('   Machine calling interval was not stopped!');
        socket.disconnect();
        process.exit(1);
      }
    }, 3000);
  }
});

socket.on('tickets_generated', () => {
  console.log('✅ Tickets generated');
  console.log('📝 Starting game in machine mode...\n');

  setTimeout(() => {
    socket.emit('start_game', {
      roomId: roomId,
    });
  }, 500);
});

socket.on('game_started', () => {
  console.log('✅ Game started - machine should auto-call numbers');
  console.log('   Waiting for 3 numbers to be called before resetting...\n');
});

socket.on('number_called', (data) => {
  if (!gameReset) {
    numbersCalledBeforeReset++;
    console.log(`   ${numbersCalledBeforeReset}. Number ${data.number} called (${data.remainingCount} remaining)`);

    // After 3 numbers, reset the game
    if (numbersCalledBeforeReset >= 3) {
      console.log('\n📝 Resetting game...');
      socket.emit('reset_game', {
        roomId: roomId,
      });
    }
  } else {
    numbersCalledAfterReset++;
    console.error(`   ❌ Number ${data.number} called AFTER reset! (This should not happen)`);
  }
});

socket.on('game_reset', (data) => {
  console.log('✅ Game reset event received:', data.roomId);
  gameReset = true;
});

socket.on('error', (error) => {
  console.error('❌ Error:', error.message);
  if (error.code === 'RESET_GAME_ERROR') {
    console.error('   Failed to reset game on server');
  }
  socket.disconnect();
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

// Timeout after 20 seconds
setTimeout(() => {
  console.error(`\n❌ Test timeout`);
  console.error(`   Numbers before reset: ${numbersCalledBeforeReset}`);
  console.error(`   Numbers after reset: ${numbersCalledAfterReset}`);
  console.error(`   Game reset: ${gameReset}`);
  socket.disconnect();
  process.exit(1);
}, 20000);
