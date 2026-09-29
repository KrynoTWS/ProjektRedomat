const io = require('socket.io-client');
const readline = require('readline');
const PORT = process.env.PORT || 3000;
const socket = io(`http://localhost:${PORT}`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

let myTicket = null;

socket.on('connect', () => {
  console.log('Spojeno na redomat');
  getCounters();
});

function getCounters() {
  socket.emit('getCounters');
}

function askForTicket() {
  rl.question('\nUnesi ID šaltera za uzimanje broja: ', id => {
    socket.emit('takeTicket', { counterId: Number(id) });
  });
}

//listeneri
socket.on('counters:list', counters => {
  console.log('\n--- ŠALTERI ---');
  counters.forEach(c =>
    console.log(`${c.id}. ${c.name} | ${c.active ? 'AKTIVAN' : 'NEAKTIVAN'} | Trenutni: ${c.current_number}`)
  );
  if (!myTicket) askForTicket();
});

socket.on('ticket:created', ticket => {
  myTicket = ticket;
  console.log(`\nTvoj broj: ${ticket.number}. Čekaj poziv...`);
});

socket.on('counter:update', counter => {
  if (myTicket && counter.current_number === myTicket.number) {
    console.log('\nNA REDU SI!');
  }
});

socket.on('ticket:served', ticket => {
  if (myTicket && ticket.id === myTicket.id) {
    console.log('\nTvoj broj je poslužen. Možeš ponovno uzeti broj.');
    myTicket = null;
    getCounters();
  }
});

socket.on('error', msg => {
  console.log('Greška:', msg);
  if (!myTicket) askForTicket();
});
