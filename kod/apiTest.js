const app = require('./app');
const request = require('supertest');

global.request = request(app.callback());

