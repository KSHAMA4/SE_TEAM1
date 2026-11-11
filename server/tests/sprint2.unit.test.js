const request = require('supertest');
const app = require('../src/app');

describe('Sprint 2 - Unit Tests (RBAC Enforcement)', () => {
  let studentCookie, techCookie, adminCookie;

  beforeAll(async () => {
    const s1 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student1@pes.edu',
        password: 'Password123!'
      });
    studentCookie = s1.headers['set-cookie'];

    const t1 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'tech1@pes.edu',
        password: 'Password123!'
      });
    techCookie = t1.headers['set-cookie'];

    const a1 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@pes.edu',
        password: 'Password123!'
      });
    adminCookie = a1.headers['set-cookie'];
  });

  it('TC-S2-001: Student cannot access return endpoint -> 403', async () => {
    const res = await request(app)
      .post('/api/v1/reservations/1/return')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });

  it('TC-S2-002: Student cannot access all-reservations dashboard -> 403', async () => {
    const res = await request(app)
      .get('/api/v1/reservations/all')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });

  it('TC-S2-003: Technician can access all-reservations dashboard -> 200', async () => {
    const res = await request(app)
      .get('/api/v1/reservations/all')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reservations');
  });

  it('TC-S2-004: Student cannot update equipment status -> 403', async () => {
    const res = await request(app)
      .put('/api/v1/equipment/1')
      .set('Cookie', studentCookie)
      .send({ status: 'MAINTENANCE' });

    expect(res.status).toBe(403);
  });

  it('TC-S2-005: Admin can get all users -> 200', async () => {
    if (!adminCookie) return;

    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
  });

  it('TC-S2-006: Student cannot access admin users endpoint -> 403', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });
});
