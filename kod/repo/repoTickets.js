const db = require('../db');

async function createTicket(counterId) {
  if (!counterId) throw new Error('COUNTER_ID_REQUIRED');

  return db.transaction(async trx => {
    const counter = await trx('counters')
      .where({ id: counterId, active: true })
      .first();

    if (!counter) throw new Error('COUNTER_NOT_FOUND_OR_INACTIVE');

    const lastTicket = await trx('tickets')
      .where({ counter_id: counterId })
      .orderBy('number', 'desc')
      .first();

    const nextNumber = lastTicket ? lastTicket.number + 1 : 1;

    const [row] = await trx('tickets')
      .insert({
        counter_id: counterId,
        number: nextNumber,
        served: false,
      })
      .returning('id');

    return trx('tickets').where({ id: row.id }).first();
  });
}

async function getTicketById(id) {
  if (!id) throw new Error('ID_REQUIRED');
  return db('tickets').where({ id }).first();
}

async function markAsServed(id) {
  if (!id) throw new Error('ID_REQUIRED');
  await db('tickets')
    .where({ id })
    .update({ served: true, updated_at: db.fn.now() });
  return getTicketById(id);
}

async function getAllTickets() {
  return db('tickets').select('*');
}

async function deleteTicket(id) {
  if (!id) throw new Error('ID_REQUIRED');
  return db('tickets').where({ id }).del();
}
module.exports = {
  createTicket,
  getTicketById,
  markAsServed,
  getAllTickets,
  deleteTicket
};
