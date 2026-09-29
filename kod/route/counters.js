const Router = require('@koa/router');
const repo = require('../repo/repoCounters');
const Joi = require("joi");
const auth = require('../middleware/auth');
const { body, params } = require('../middleware/validate');

const router = new Router({ prefix: '/counters' });

router.post('/', auth, body({ 
  name: Joi.string().required(),
  description: Joi.string().allow('', null)
}), async ctx => {
  try {
    ctx.body = await repo.createCounter(ctx.request.body);
    ctx.status = 200;
  } catch (err) {
    ctx.throw(400, err.message);
  }
});

router.get('/', async ctx => {
  ctx.body = await repo.getAllCounters();
});

router.get('/:id', params({ id: Joi.number().integer().required() }), async ctx => {
  const id = parseInt(ctx.params.id, 10);
  const counter = await repo.getCounterById(id);
  if (!counter) ctx.throw(404, 'Counter not found');
  ctx.body = counter;
});

router.put(
  '/:id',
  auth,
  params({ id: Joi.number().integer().required() }),
  body({ name: Joi.string().required(), description: Joi.string().allow('', null) }),
  async ctx => {
    const id = parseInt(ctx.params.id, 10);
    ctx.body = await repo.updateCounter(id, ctx.request.body);
  }
);

router.delete('/:id', auth, params({ id: Joi.number().integer().required() }), async ctx => {
  const id = parseInt(ctx.params.id, 10);
  await repo.deactivateCounter(id);
  ctx.status = 204;
});

router.post('/:id/increment', auth, params({ id: Joi.number().integer().required() }), async ctx => {
  const id = parseInt(ctx.params.id, 10);
  ctx.body = await repo.incrementCounterNumber(id);
});

module.exports = router;
