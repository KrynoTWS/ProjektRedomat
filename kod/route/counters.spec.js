const { expect } = require("chai");

describe('Counters tests', () => {
  let counterId;

  it('ADMIN can create counter', async () => {
    const res = await request
      .post('/counters')
      .auth('admin', 'fff15169')
      .send({ name: 'Šalter 1', description: 'Opis' });

    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('Šalter 1');
    counterId = res.body.id;
  });

  it('NON-admin cannot create counter', async () => {
    const res = await request
      .post('/counters')
      .send({ name: 'Fail' });

    expect(res.status).to.equal(401);
  });

  it('Anyone can list counters', async () => {
    const res = await request.get('/counters');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('ADMIN can increment counter number', async () => {
    const res = await request
      .post(`/counters/${counterId}/increment`)
      .auth('admin', 'fff15169');

    expect(res.status).to.equal(200);
    expect(res.body.current_number).to.equal(1);
  });

  it('ADMIN can deactivate counter', async () => {
    const res = await request
      .delete(`/counters/${counterId}`)
      .auth('admin', 'fff15169');

    expect(res.status).to.equal(204);
  });
});
