const io = require('socket.io-client');
const readline = require('readline');
const PORT = process.env.PORT || 3000;
const socket = io(`http://localhost:${PORT}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let authenticated = false;

function login() {
  rl.question('Korisničko ime: ', username => {
    rl.question('Lozinka: ', password => {
      socket.emit('admin:login', { username, password });
    });
  });
}

function menu() {
  console.log(`
1. Prikaži šaltere
2. Povećaj broj na šalteru
3. Deaktiviraj šalter
4. Aktiviraj šalter
5. Označi da je broj poslužen
6. Prikaži sve brojeve koji čekaju
`);
  rl.question('Odabir: ', handleMenu);
}

function handleMenu(choice) {
  if (!authenticated) {
    console.log('Niste autentificirani.');
    login();
    return;
  }

  switch (choice) {
    case '1':
      socket.emit('getCounters');
      break;
    case '2':
      rl.question('ID šaltera: ', id => socket.emit('admin:increment', { counterId: Number(id) }));
      break;
    case '3':
      rl.question('ID šaltera: ', id => socket.emit('admin:deactivate', { counterId: Number(id) }));
      break;
    case '4':
      rl.question('ID šaltera: ', id => socket.emit('admin:activate', { counterId: Number(id) }));
      break;
    case '5':
      rl.question('ID broja: ', ticketId => {
        rl.question('ID šaltera: ', counterId => {
          socket.emit('admin:serveTicket', { ticketId: Number(ticketId), counterId: Number(counterId) });
        });
      });
      break;
    case '6':
      socket.emit('admin:getWaitingTickets');
      break;
    default:
      console.log('Nepoznat odabir.');
      menu();
      break;
  }
}

//listeneri
socket.on('connect', () => {
  console.log('Spojeno na server');
  login();
});

socket.on('login:success', () => {
  console.log('Autentikacija uspješna!');
  authenticated = true;
  menu();
});

socket.on('login:failed', msg => {
  console.log('Greška pri prijavi:', msg);
  login();
});

socket.on('counters:list', counters => {
  console.log('\n--- ŠALTERI ---');
  counters.forEach(c =>
    console.log(`${c.id}. ${c.name} | ${c.active ? 'AKTIVAN' : 'NEAKTIVAN'} | Trenutni: ${c.current_number}`)
  );
  menu();
});

socket.on('counter:update', counter => {
  console.log(`\nŠalter ${counter.id} povećan na ${counter.current_number}`);
  menu();
});

socket.on('ticket:served', ticket => {
  console.log(`\nBroj ${ticket.id} je poslužen`);
  menu();
});

socket.on('tickets:waiting', tickets => {
  console.log('\n--- KORISNICI U ČEKANJU ---');
  if (!tickets.length) console.log('Nema brojeva');
  else tickets.forEach(t => console.log(`ID Broja: ${t.id} | Šalter ID: ${t.counter_id} | Dodijeljeni broj: ${t.number}`));
  menu();
});

socket.on('error', msg => {
  console.log('Greška:', msg);
  menu();
});
