# Sprint-1 Issues: Kshama (PES1UG24AM142)
Focus: Equipment, calibration and search (SRS role: Equipment & Calibration Management)
Sprint: 19 Oct to 23 Oct 2026 | Total story points: 13

Project: Smart Lab Equipment Slot Reservation Portal (Team 001)
Stack (per SAD): React 18 + Vite + Tailwind, Node.js Express, PostgreSQL 15 with btree_gist, JWT, Jest + Supertest

For each issue: branch `feature/issue-<n>-short-name`, commit, raise a PR with `Closes #<n>`, repo owner reviews and merges.

---

## Issue #4: Seed data: laboratories, equipment, users
- Requirement: FR-002
- Story points: 2
- Test Plan cases: TC-001, TC-005
- Labels: `sprint-1`
- Assignee: Kshama

**Description**
Create repeatable sample data that matches the Test Plan.

**Tasks**
- [ ] Users: student1, student2, tech1 (bcrypt hashed passwords)
- [ ] Laboratories with departments
- [ ] 8-10 equipment items: E1 (AVAILABLE, valid calibration), E2 (expired calibration, used by TC-005), one MAINTENANCE, one OUT_OF_ORDER
- [ ] Seed script that is safe to re-run

**Acceptance criteria**
- Seed script runs on a fresh database
- E1 and E2 exist exactly as the Test Plan expects

---

## Issue #5: Equipment list: API and React page with status and calibration badge
- Requirement: FR-001 / FR-007
- Story points: 3
- Test Plan cases: TC-017
- Labels: `sprint-1`
- Assignee: Kshama

**Description**
Authenticated users see the equipment catalogue with live status and calibration state.

**Tasks**
- [ ] GET /api/v1/equipment (authenticated)
- [ ] React page listing name, lab, status, calibration expiration and a valid/expired badge
- [ ] Link each item to the reservation form

**Acceptance criteria**
- All seeded equipment appears with correct status and badge
- Unauthenticated requests return 401

---

## Issue #6: Equipment search and filtering
- Requirement: FR-007
- Story points: 3
- Test Plan cases: TC-017
- Labels: `sprint-1`
- Assignee: Kshama

**Description**
Search by keyword and filter by laboratory/department, availability and calibration status. Implements the Search / Filter use case including the no-match alternate flow.

**Tasks**
- [ ] Query params ?lab, ?status, ?search (plus calibration filter) on GET /api/v1/equipment
- [ ] Filter controls in the React page
- [ ] No-match message with option to modify or clear filters

**Acceptance criteria**
- Pass: filtered result set matches the query exactly
- No-match case shows a message and lets the student retry

---

## Issue #10: Calibration verification before confirming a reservation
- Requirement: FR-002
- Story points: 5
- Test Plan cases: TC-005
- Labels: `sprint-1`
- Assignee: Kshama

**Description**
Block reservations for equipment that is not AVAILABLE or whose calibration expires before the slot ends.

**Tasks**
- [ ] Check equipment.status = 'AVAILABLE' and calibration_expiration >= end_time (SAD sequence 4.1 step 3)
- [ ] Return 422 Unprocessable Entity with a clear message
- [ ] Unit tests: valid, expired, maintenance, out of order

**Acceptance criteria**
- Pass: reservation confirmed only when calibration is valid
- Fail: reservation confirmed for expired calibration

---
