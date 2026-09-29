const { Server } = require('socket.io');
const repoCounters = require('../repo/repoCounters');
const repoTickets = require('../repo/repoTickets');
let io;

function initSocket(server) {
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', socket => {
    console.log('Socket connected:', socket.id);

    // Dohvat svih šaltera
    socket.on('getCounters', async () => {
      const counters = await repoCounters.getAllCounters();
      socket.emit('counters:list', counters);
    });

    // Klijent uzima ticket
    socket.on('takeTicket', async ({ counterId }) => {
      try {
        const ticket = await repoTickets.createTicket(counterId);
        socket.join(`counter-${counterId}`);
        socket.emit('ticket:created', ticket);
      } catch (err) {
        socket.emit('error', err.message);
      }
    });
    socket.on('admin:login', ({ username, password }) => {
      if (username === 'admin' && password === 'fff15169') {
        socket.adminAuthenticated = true;
        socket.emit('login:success');
      } else {
        socket.emit('login:failed', 'Neispravno korisničko ime ili lozinka');
      }
    });

    // Provjera prije svih admin akcija
    function requireAuth(socket, callback) {
      return (...args) => {
        if (!socket.adminAuthenticated) return socket.emit('error', 'Niste autentificirani');
        callback(...args);
      };
    }

    // Admin povećava broj na šalteru
    socket.on('admin:increment', requireAuth(socket, async ({ counterId }) => {
      try {
        const counter = await repoCounters.incrementCounterNumber(counterId);
        // Emit za sve klijente u tom šalteru
        io.to(`counter-${counterId}`).emit('counter:update', counter);
        // Emit za admina da vidi da je broj povećan
        socket.emit('counter:update', counter);
      } catch (err) {
        socket.emit('error', err.message);
      }
    }));

    // Admin deaktivira šalter
    socket.on('admin:deactivate', requireAuth(socket, async ({ counterId }) => {
      try {
        await repoCounters.deactivateCounter(counterId);
        const counters = await repoCounters.getAllCounters();
        io.emit('counters:list', counters);
      } catch (err) {
        socket.emit('error', err.message);
      }
    }));

    // Admin aktivira šalter
    socket.on('admin:activate', requireAuth(socket, async ({ counterId }) => {
      try {
        await repoCounters.updateCounter(counterId, { active: true });
        const counters = await repoCounters.getAllCounters();
        io.emit('counters:list', counters);
      } catch (err) {
        socket.emit('error', err.message);
      }
    }));

    // Admin označava ticket kao served
    socket.on('admin:serveTicket', requireAuth(socket, async ({ ticketId, counterId }) => {
      try {
        const ticket = await repoTickets.markAsServed(ticketId);
        // Emit za klijente u šalteru
        io.to(`counter-${counterId}`).emit('ticket:served', ticket);
        // Emit za admina da vidi potvrdu
        socket.emit('ticket:served', ticket);
      } catch (err) {
        socket.emit('error', err.message);
      }
    }));

    // Admin traži sve čekajuće tickete
    socket.on('admin:getWaitingTickets', requireAuth(socket,  async () => {
      try {
        const tickets = await repoTickets.getAllTickets();
        const waiting = tickets.filter(t => t.served === false);
        socket.emit('tickets:waiting', waiting);
      } catch (err) {
        socket.emit('error', err.message);
      }
    }));

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };
