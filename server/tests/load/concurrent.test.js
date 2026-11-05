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