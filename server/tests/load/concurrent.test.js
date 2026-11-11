const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');

describe('NFR-001: 100-user concurrent booking race condition test', () => {
  let studentToken;

  // Use Day 5 (10:00 AM) so it never conflicts with sprint1 tests on Day 1 & 2
  const slotStart = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  slotStart.setHours(10, 0, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

  beforeAll(async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'student1@pes.edu',
        password: 'Password123!',
      });

    studentToken = login.body.token;

    // Clean previous reservations for this test slot
    await db.query(
      'DELETE FROM reservations WHERE equipment_id = 1 AND start_time = $1',
      [slotStart.toISOString()]
    );
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

    const results = await Promise.all(
      Array.from({ length: 100 }, bookSlot)
    );

    const created = results.filter(r => r.status === 201);
    const rejected = results.filter(
      r => r.status === 409 || r.status === 429
    );

    console.log(
      `✅ Created: ${created.length} | ❌ Rejected: ${rejected.length}`
    );

    expect(created.length).toBe(1);
    expect(rejected.length).toBe(99);
  }, 30000);
});
