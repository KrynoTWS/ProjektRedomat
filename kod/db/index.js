require('dotenv-safe').config()
const knex = require('knex');
const knexConfig = require('../knexfile');

const db = knex(knexConfig.development);

module.exports = db;