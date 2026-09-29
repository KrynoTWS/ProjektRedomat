const Router = require('@koa/router');
const repo = require('../repo/repoTickets');
const auth = require('../middleware/auth');
const { body, params } = require('../middleware/validate');
const Joi = require('joi');

const router = new Router({ prefix: '/tickets' });

router.post('/', body({ counter_id: Joi.number().integer().required() }), async ctx => {
  const { counter_id } = ctx.request.body;
  ctx.body = await repo.createTicket(counter_id);
});

router.get('/', async ctx => {
  ctx.body = await repo.getAllTickets();
});

router.get('/:id', params({ id: Joi.number().integer().required() }), async ctx => {
  const id = parseInt(ctx.params.id, 10);
  const ticket = await repo.getTicketById(id);
  if (!ticket) ctx.throw(404, 'Ticket not found');
  ctx.body = ticket;
});

router.put('/:id/serve', auth, params({ id: Joi.number().integer().required() }), async ctx => {
  const id = parseInt(ctx.params.id, 10);
  ctx.body = await repo.markAsServed(id);
});

router.delete('/:id', auth, params({ id: Joi.number().integer().required() }), async ctx => {
  const id = parseInt(ctx.params.id, 10);
  await repo.deleteTicket(id);
  ctx.status = 204;
});

module.exports = router;
