exports.seed = async knex => {
  await knex('counters').del();

  await knex('counters').insert([
    {
      name: 'Šalter A',
      description: 'Opći poslovi',
      current_number: 0,
      active: true
    },
    {
      name: 'Šalter B',
      description: 'Dokumenti',
      current_number: 0,
      active: true
    }
  ]);
};
