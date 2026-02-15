/**
 * Machine Mode Test - Verifies auto-calling functionality
 */

const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3003';

console.log('🤖 Testing machine mode auto-calling...\n');

let socket;
let roomId;
let numbersCalledCount = 0;

socket = io(SOCKET_URL, { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  // Create room with machine mode
  console.log('📝 Creating room with machine mode (1 second interval)...');
  socket.emit('create_room', {
    playerName: 'Machine Test',
    callerMode: 'machine',
    machineInterval: 1000, // 1 second for faster testing
  });
});

socket.on('room_update', (data) => {
  const room = data.room;
  roomId = room.id;

  // Generate tickets
  if (room.gameState === 'waiting' && room.players[0].tickets.length === 0) {
    console.log('📝 Generating tickets...');
    socket.emit('generate_tickets', {
      roomId: roomId,
      cardCount: 1,
    });
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
  console.log('   Waiting for 5 numbers to be called...\n');
});

socket.on('number_called', (data) => {
  numbersCalledCount++;
  console.log(`   ${numbersCalledCount}. Number ${data.number} called (${data.remainingCount} remaining)`);

  // After 5 numbers, test passed
  if (numbersCalledCount >= 5) {
    const timeTaken = numbersCalledCount * 1000; // Should be ~5 seconds
    console.log(`\n✅ Machine mode working! ${numbersCalledCount} numbers called in ~${timeTaken/1000}s`);
    console.log('✅ Auto-calling verified successfully!');

    socket.disconnect();
    process.exit(0);
  }
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
  socket.disconnect();
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

// Timeout after 15 seconds (should call 5 numbers in ~5 seconds)
setTimeout(() => {
  console.error(`❌ Test timeout - only ${numbersCalledCount} numbers called`);
  socket.disconnect();
  process.exit(1);
}, 15000);
