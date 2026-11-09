const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('Sprint-1 Test Plan Verification Suite (UE24CS341A Team 001)', () => {
  let student1Token = '';
  let student2Token = '';
  let techToken = '';

  beforeAll(async () => {
    // TC-015: Authentication & JWT issuance test
    const res1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student1@pes.edu', password: 'Password123!' });
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toHaveProperty('token');
    student1Token = res1.body.token;

    const res2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student2@pes.edu', password: 'Password123!' });
    expect(res2.statusCode).toBe(200);
    student2Token = res2.body.token;

    const resTech = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'tech1@pes.edu', password: 'Password123!' });
    expect(resTech.statusCode).toBe(200);
    techToken = resTech.body.token;
  });

  afterAll(async () => {
    await db.pool.end();
  });

  // TC-015: Authentication - Valid & Invalid Credentials
  test('TC-015: Public user login with valid/invalid credentials', async () => {
    const invalidRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student1@pes.edu', password: 'WrongPassword' });
    expect(invalidRes.statusCode).toBe(401);
  });

  // TC-016: RBAC - Student restricted from Technician routes
  test('TC-016: RBAC enforcement - Student calling technician route returns 403 Forbidden', async () => {
    const res = await request(app)
      .put('/api/v1/equipment/1')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ status: 'MAINTENANCE' });
    expect(res.statusCode).toBe(403);
  });

  // TC-017: Equipment Search & Filtering
  test('TC-017: Equipment listing and filtering by search query', async () => {
    const res = await request(app)
      .get('/api/v1/equipment?search=Oscilloscope')
      .set('Authorization', `Bearer ${student1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.equipment.length).toBeGreaterThanOrEqual(1);
    expect(res.body.equipment[0].name).toContain('Oscilloscope');

    // No-match query
    const emptyRes = await request(app)
      .get('/api/v1/equipment?search=NonExistentDevice12345')
      .set('Authorization', `Bearer ${student1Token}`);
    expect(emptyRes.statusCode).toBe(200);
    expect(emptyRes.body.total).toBe(0);
  });

  // TC-002: Reject Slot > 2 hours (121 minutes)
  test('TC-002: Reject reservation longer than 2 hours (121 minutes) with 400 Bad Request', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const end = new Date(start.getTime() + 121 * 60 * 1000); // 121 mins later

    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        equipment_id: 1,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/exceeds the maximum allowed 120 minutes/i);
  });

  // TC-003: Advance booking window boundaries (past date & > 7 days)
  test('TC-003: Reject reservations beyond 7 days advance window and in the past', async () => {
    // In past
    const pastStart = new Date(Date.now() - 3600 * 1000);
    const pastEnd = new Date(Date.now() - 1800 * 1000);
    const pastRes = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        equipment_id: 1,
        start_time: pastStart.toISOString(),
        end_time: pastEnd.toISOString(),
      });
    expect(pastRes.statusCode).toBe(400);

    // 8 days in future (> 7 days)
    const futureStart = new Date(Date.now() + 8 * 24 * 3600 * 1000);
    const futureEnd = new Date(futureStart.getTime() + 60 * 60 * 1000);
    const futureRes = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        equipment_id: 1,
        start_time: futureStart.toISOString(),
        end_time: futureEnd.toISOString(),
      });
    expect(futureRes.statusCode).toBe(400);
  });

  // TC-005: Reject reservation for equipment with expired calibration (E2)
  test('TC-005: Reject reservation for equipment with expired calibration with 422', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 90 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        equipment_id: 2, // E2 has expired calibration in seed data
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.message).toMatch(/calibration certificate has expired/i);
  });

  // TC-001: Reserve a valid 2-hour slot on E1 (Returns Token & 201 Created)
  test('TC-001: Reserve a valid 2-hour slot (120 minutes) on E1 returns 201 Created and UUID token', async () => {
    const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days ahead
    start.setHours(14, 0, 0, 0);
    const end = new Date(start.getTime() + 120 * 60 * 1000); // Exactly 120 minutes

    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        equipment_id: 1,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.reservation).toHaveProperty('token');
    expect(res.body.reservation.status).toBe('CONFIRMED');
  });

  // TC-007: Overlapping slot rejection (Double-booking prevention 409 Conflict)
  test('TC-007: Overlapping reservation request rejected with 409 Conflict and suggested alternatives', async () => {
    const baseStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    baseStart.setHours(14, 0, 0, 0);
    // Overlapping slot: 11:00 to 13:00 (overlaps with 10:00 - 12:00 created in TC-001)
    const overlapStart = new Date(baseStart.getTime() + 60 * 60 * 1000);
    const overlapEnd = new Date(overlapStart.getTime() + 120 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({
        equipment_id: 1,
        start_time: overlapStart.toISOString(),
        end_time: overlapEnd.toISOString(),
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/overlaps with an existing confirmed reservation|Double-booking prevented/i);
    expect(res.body).toHaveProperty('suggestedAlternatives');
  });

  // TC-018: Student views own reservations
  test('TC-018: Authenticated student views their own confirmed reservations with tokens', async () => {
    const res = await request(app)
      .get('/api/v1/reservations/me')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.reservations[0]).toHaveProperty('token');
    expect(res.body.reservations[0].equipment_id).toBe('1');
  });
});
