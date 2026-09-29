const db = require('../db');

async function createCounter(data) {
  const [row] = await db('counters')
    .insert({
      name: data.name,
      description: data.description,
      active: true,
      current_number: 0,
    })
    .returning('id');

  return getCounterById(row.id);
}

async function getAllCounters() {
  return db('counters').select('*');
}

async function getCounterById(id) {
  if (!id) throw new Error('ID_REQUIRED');
  return db('counters').where({ id }).first();
}

async function updateCounter(id, data) {
  if (!id) throw new Error('ID_REQUIRED');
  await db('counters')
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() });
  return getCounterById(id);
}

async function deactivateCounter(id) {
  if (!id) throw new Error('ID_REQUIRED');
  await db('counters')
    .where({ id })
    .update({ active: false, updated_at: db.fn.now() });
}

async function incrementCounterNumber(id) {
  if (!id) throw new Error('ID_REQUIRED');
  return db.transaction(async trx => {
    const counter = await trx('counters')
      .where({ id, active: true })
      .first();

    if (!counter) throw new Error('COUNTER_NOT_FOUND_OR_INACTIVE');

    const newNumber = (counter.current_number || 0) + 1;
    await trx('counters')
      .where({ id })
      .update({ current_number: newNumber, updated_at: db.fn.now() });
    const updated = { ...counter, current_number: newNumber};

    return updated;
  });
}

module.exports = {
  createCounter,
  getAllCounters,
  getCounterById,
  updateCounter,
  deactivateCounter,
  incrementCounterNumber,
};
