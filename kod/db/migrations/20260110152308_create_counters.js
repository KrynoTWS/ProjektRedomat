/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('counters', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.integer('current_number').notNullable().defaultTo(0);
        table.boolean('active').notNullable().defaultTo(true);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('counters');
};
