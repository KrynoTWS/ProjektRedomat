const { expect } = require("chai");

describe('Tickets tests', () => {
  let counterId;
  let ticketId;

  before(async () => {
    const res = await request
      .post('/counters')
      .auth('admin', 'fff15169')
      .send({ name: 'Ticket Counter' });

    counterId = res.body.id;
  });

  it('User can list all tickets', async () => {
    const res = await request.get('/tickets');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('User can take a ticket', async () => {
    const res = await request
      .post('/tickets')
      .send({ counter_id: counterId });

    expect(res.status).to.equal(200);
    expect(res.body.number).to.equal(1);
    ticketId = res.body.id;
  });

  it('User can fetch ticket', async () => {
    const res = await request.get(`/tickets/${ticketId}`);
    expect(res.status).to.equal(200);
  });

  it('ADMIN can mark ticket as served', async () => {
    const res = await request
      .put(`/tickets/${ticketId}/serve`)
      .auth('admin', 'fff15169');

    expect(res.status).to.equal(200);
    expect(res.body.served).to.equal(true);
  });

  it('Cannot take ticket for invalid counter', async () => {
    const res = await request
      .post('/tickets')
      .send({ counter_id: 9999 });

    expect(res.status).to.be.oneOf([400, 404, 500]);
  });
    it('ADMIN can delete ticket', async () => {
    const create = await request
      .post('/tickets')
      .send({ counter_id: counterId });

    ticketId = create.body.id;

    const res = await request
      .delete(`/tickets/${ticketId}`)
      .auth('admin', 'fff15169');

    expect(res.status).to.equal(204);
  });

  it('Deleting non-existing ticket should return 204', async () => {
    const res = await request
      .delete('/tickets/999999')
      .auth('admin', 'fff15169');

    expect([204,404]).to.include(res.status);
  });

  it('NON-admin cannot delete ticket', async () => {
    const res = await request.delete(`/tickets/${ticketId}`);
    expect(res.status).to.equal(401);
  });
});
