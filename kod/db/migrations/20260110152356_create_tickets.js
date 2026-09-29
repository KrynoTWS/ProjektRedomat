/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('tickets', table => {
        table.increments('id').primary();
        table.integer('counter_id').notNullable().references('id').inTable('counters').onDelete('CASCADE');
        table.integer('number').notNullable();
        table.boolean('served').notNullable().defaultTo(false);
        table.timestamps(true, true);
        table.unique(['counter_id', 'number']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('tickets');
};
