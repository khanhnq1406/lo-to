/**
 * Simple Socket.io test client
 * Tests basic connectivity and room operations
 */

const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3001';

console.log('🔌 Connecting to Socket.io server...');

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);

  // Test 1: Create a room
  console.log('\n📝 Test 1: Creating a room...');
  socket.emit('create_room', {
    playerName: 'Test Player',
    callerMode: 'machine',
    machineInterval: 3000,
  });
});

socket.on('player_joined', (data) => {
  console.log('✅ Player joined:', data);
});

socket.on('room_update', (data) => {
  console.log('✅ Room update received:', {
    roomId: data.room.id,
    playerCount: data.room.players.length,
    gameState: data.room.gameState,
    callerMode: data.room.callerMode,
  });

  // Test 2: Generate tickets
  if (data.room.gameState === 'waiting' && data.room.players[0].tickets.length === 0) {
    console.log('\n📝 Test 2: Generating tickets...');
    socket.emit('generate_tickets', {
      roomId: data.room.id,
      cardCount: 2,
    });
  }
});

socket.on('tickets_generated', (data) => {
  console.log('✅ Tickets generated:', {
    playerId: data.playerId,
    ticketCount: data.tickets.length,
    firstTicketHasNumbers: data.tickets[0].flat().filter(n => n !== null).length === 15,
  });

  console.log('\n✅ All tests passed!');
  console.log('🔌 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

socket.on('error', (data) => {
  console.error('❌ Error:', data);
  socket.disconnect();
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from server');
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timeout');
  socket.disconnect();
  process.exit(1);
}, 10000);
