const basicAuth = require('basic-auth');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'fff15169';

module.exports = async (ctx, next) => {
  const user = basicAuth(ctx);

  if (!user || user.name !== ADMIN_USER || user.pass !== ADMIN_PASS) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Basic');
    ctx.body = { error: 'Unauthorized' };
    return;
  }

  await next();
};
