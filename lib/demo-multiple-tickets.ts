/**
 * Demonstration of multiple tickets feature
 * Run with: npx tsx lib/demo-multiple-tickets.ts
 */

import {
  generateMultipleTickets,
  getPlayerTicketNumbers,
  checkPlayerWin,
  getRemainingNumbers,
  randomCallNumber,
  formatNumber,
  getTicketNumbers,
} from './game';

console.log('='.repeat(60));
console.log('Vietnamese Lô Tô - Multiple Tickets Demo');
console.log('='.repeat(60));

// Simulate a player with multiple tickets
const ticketCount = 3;
const boardsPerTicket = 2;

console.log(`\nPlayer selects ${ticketCount} tickets, each with ${boardsPerTicket} boards`);
console.log('-'.repeat(60));

const playerTickets = generateMultipleTickets(ticketCount, boardsPerTicket, 12345);

// Display ticket information
for (let i = 0; i < playerTickets.length; i++) {
  const ticket = playerTickets[i];
  const numbers = getTicketNumbers(ticket);
  console.log(`\nTicket ${i + 1}:`);
  console.log(`  Boards: ${ticket.length}`);
  console.log(`  Numbers: ${numbers.length}`);

  // Show first board of each ticket
  console.log(`  First board preview:`);
  for (let row = 0; row < ticket[0].length; row++) {
    const rowStr = ticket[0][row]
      .map(cell => cell !== null ? formatNumber(cell) : '  ')
      .join(' ');
    console.log(`    ${rowStr}`);
  }
}

// Show total unique numbers
const allPlayerNumbers = getPlayerTicketNumbers(playerTickets);
console.log(`\nTotal unique numbers across all tickets: ${allPlayerNumbers.size}`);
console.log(`Total numbers (with possible duplicates): ${ticketCount * boardsPerTicket * 20}`);

// Simulate a game
console.log('\n' + '='.repeat(60));
console.log('Simulating Game');
console.log('='.repeat(60));

const calledNumbers = new Set<number>();
let callCount = 0;
let remainingNumbers = getRemainingNumbers(calledNumbers);

// Simulate calling numbers until someone wins
while (remainingNumbers.length > 0) {
  const number = randomCallNumber(remainingNumbers, callCount);
  if (number === null) break;

  calledNumbers.add(number);
  callCount++;

  // Check for win every 5 calls
  if (callCount % 5 === 0) {
    const win = checkPlayerWin(playerTickets, calledNumbers);

    if (win) {
      console.log(`\nWIN! After ${callCount} calls`);
      console.log(`  Ticket: ${win.ticketIndex + 1}`);
      console.log(`  Board: ${win.boardIndex + 1}`);
      console.log(`  Win Type: ${win.type.toUpperCase()}`);

      if (win.rowIndices) {
        console.log(`  Winning Rows: ${win.rowIndices.map(r => r + 1).join(', ')}`);
      }

      console.log(`  Called Numbers: ${Array.from(calledNumbers).sort((a, b) => a - b).map(formatNumber).join(', ')}`);
      break;
    }
  }

  remainingNumbers = getRemainingNumbers(calledNumbers);

  // Show progress every 10 calls
  if (callCount % 10 === 0) {
    console.log(`Called ${callCount} numbers... (${remainingNumbers.length} remaining)`);
  }
}

if (!checkPlayerWin(playerTickets, calledNumbers)) {
  console.log('\nNo win yet after all numbers called (unlikely!)');
}

console.log('\n' + '='.repeat(60));
console.log('Demo Complete');
console.log('='.repeat(60));

// Show statistics
console.log('\nStatistics:');
console.log(`  Player Tickets: ${ticketCount}`);
console.log(`  Boards per Ticket: ${boardsPerTicket}`);
console.log(`  Total Boards: ${ticketCount * boardsPerTicket}`);
console.log(`  Total Numbers on Boards: ${ticketCount * boardsPerTicket * 20}`);
console.log(`  Unique Numbers: ${allPlayerNumbers.size}`);
console.log(`  Numbers Called: ${calledNumbers.size}`);
console.log(`  Coverage: ${((calledNumbers.size / 100) * 100).toFixed(1)}%`);

// Show which player numbers were called
const calledPlayerNumbers = Array.from(calledNumbers).filter(num => allPlayerNumbers.has(num));
console.log(`  Player Numbers Called: ${calledPlayerNumbers.length} / ${allPlayerNumbers.size} (${((calledPlayerNumbers.length / allPlayerNumbers.size) * 100).toFixed(1)}%)`);
