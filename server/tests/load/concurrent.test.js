<<<<<<< HEAD
const request = require('supertest');
const app = require('../../src/app');

describe('NFR-001: 100-user concurrent booking race condition test', () => {

  let studentCookie;

  beforeAll(async () => {

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student1@pes.edu',
        password: 'Password123!'
      });

    studentCookie = login.headers['set-cookie'];

  });

  it(
    'allows exactly 1 booking and rejects 99 with 409 for the same slot',
    async () => {

      const bookSlot = () =>
        request(app)
          .post('/api/v1/reservations')
          .set('Cookie', studentCookie)
          .send({
            equipment_id: 1,
            start_time: '2027-11-01T10:00:00.000Z',
            end_time: '2027-11-01T11:00:00.000Z'
          });

      const results = await Promise.all(
        Array.from({ length: 100 }, () => bookSlot())
      );

      const created = results.filter(
        r => r.status === 201
      );

      const conflicts = results.filter(
        r => r.status === 409
      );

      console.log(
        `✅ Created: ${created.length} | ❌ Conflicts: ${conflicts.length}`
      );

      expect(created.length).toBe(1);
      expect(conflicts.length).toBe(99);

    },
    30000
  );

});
=======

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');

describe('NFR-001: 100-user concurrent booking race condition test', () => {
  let studentToken;

  // Dynamic slot: 2 days in the future (within 7-day window, exactly 1 hour duration)
  const slotStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  slotStart.setHours(10, 0, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

  beforeAll(async () => {
    // 1. Login as student to get auth token
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student1@pes.edu', password: 'Password123!' });

    studentToken = login.body.token;

    // 2. Clean any prior reservations for this test slot
    await db.query(
      'DELETE FROM reservations WHERE equipment_id = 1 AND start_time = $1',
      [slotStart.toISOString()]
    );
  });

  afterAll(async () => {
    await db.pool.end();
  });

  it('allows exactly 1 booking and rejects 99 with 409 for the same slot', async () => {
    const bookSlot = () =>
      request(app)
        .post('/api/v1/reservations')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          equipment_id: 1,
          start_time: slotStart.toISOString(),
          end_time: slotEnd.toISOString(),
        });

    // Fire 100 simultaneous requests
    const results = await Promise.all(
      Array.from({ length: 100 }, bookSlot)
    );

    const created = results.filter(r => r.status === 201);
    const rejected = results.filter(r => r.status === 409 || r.status === 429);

    console.log(`✅ Created: ${created.length} | ❌ Rejected: ${rejected.length}`);

    // Exactly 1 must win the race, the remaining 99 are rejected
    expect(created.length).toBe(1);
    expect(rejected.length).toBe(99);
  }, 30000);
});
>>>>>>> 23403d2 (test(#24): 100-user concurrent booking proves exclusion constraint (NFR-001))
