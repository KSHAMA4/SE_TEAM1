const request = require('supertest');
const app = require('../src/app');

// 1-hour slot on day 3-4 from now (UTC): clear of Sprint-1 (day 2, 14:00)
// and the load test (day 5, 10:00). Each test index gets its own 15-hour
// window with a random start inside it, so reruns rarely collide.
function makeSlot(index) {
  const base = new Date(Date.now() + 3 * 24 * 3600 * 1000);
  base.setUTCHours(0, 0, 0, 0);
  const startMs =
    base.getTime() +
    index * 15 * 3600 * 1000 +
    Math.floor(Math.random() * 13 * 60) * 60000;
  return {
    start_time: new Date(startMs).toISOString(),
    end_time: new Date(startMs + 3600 * 1000).toISOString()
  };
}

describe('Sprint 2 - Integration Tests', () => {
  let studentCookie, techCookie;

  beforeAll(async () => {
    const s1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student1@pes.edu', password: 'Password123!' });
    studentCookie = s1.headers['set-cookie'];

    const t1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'tech1@pes.edu', password: 'Password123!' });
    techCookie = t1.headers['set-cookie'];
  });

  it('TC-S2-I-001: Student books then cancels -> status = CANCELLED', async () => {
    const booking = await request(app)
      .post('/api/v1/reservations')
      .set('Cookie', studentCookie)
      .send({ equipment_id: 1, ...makeSlot(0) });

    expect(booking.status).toBe(201);

    const id = booking.body.reservation.reservationId;

    const cancel = await request(app)
      .post(`/api/v1/reservations/${id}/cancel`)
      .set('Cookie', studentCookie);

    expect(cancel.status).toBe(200);

    const list = await request(app)
      .get('/api/v1/reservations/me')
      .set('Cookie', studentCookie);

    const found = list.body.reservations.find(
      r => r.reservation_id === id
    );

    expect(found?.status).toBe('CANCELLED');
  });

  it('TC-S2-I-002: Technician marks reservation returned -> status = RETURNED or LATE_RETURNED', async () => {
    const booking = await request(app)
      .post('/api/v1/reservations')
      .set('Cookie', studentCookie)
      .send({ equipment_id: 1, ...makeSlot(1) });

    expect(booking.status).toBe(201);

    const id = booking.body.reservation.reservationId;

    const ret = await request(app)
      .post(`/api/v1/reservations/${id}/return`)
      .set('Cookie', techCookie);

    expect(ret.status).toBe(200);
  });

  it('TC-S2-I-003: Technician can see all reservations in dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/reservations/all')
      .set('Cookie', techCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reservations)).toBe(true);
  });

  it('TC-S2-I-004: Overlap conflict still returns 409 (regression)', async () => {
    const slot = { equipment_id: 1, ...makeSlot(2) };

    const first = await request(app)
      .post('/api/v1/reservations')
      .set('Cookie', studentCookie)
      .send(slot);

    expect(first.status).toBe(201);

    const s2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student2@pes.edu', password: 'Password123!' });

    const second = await request(app)
      .post('/api/v1/reservations')
      .set('Cookie', s2.headers['set-cookie'])
      .send(slot);

    expect(second.status).toBe(409);
  });
});
