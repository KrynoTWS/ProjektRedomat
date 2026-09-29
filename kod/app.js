require('dotenv-safe').config()
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const countersRoutes = require('./route/counters');
const ticketsRoutes = require('./route/tickets');
const app = new Koa();

app.use(bodyParser());

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.error(err)
    ctx.status = err.status || 500
    ctx.body = {
      err,
      message: err.message
    }
  }
})

app.use(countersRoutes.routes());
app.use(ticketsRoutes.routes());

module.exports = app;
