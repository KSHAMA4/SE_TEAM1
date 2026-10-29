# Sprint-1 Issues: Manjunatha H J (PES1UG24AM157)
Focus: Database schema, slot allocation and conflict resolution (SAD role: Chief Architect & DB Schema Lead)
Sprint: 19 Oct to 23 Oct 2026 | Total story points: 13

Project: Smart Lab Equipment Slot Reservation Portal (Team 001)
Stack (per SAD): React 18 + Vite + Tailwind, Node.js Express, PostgreSQL 15 with btree_gist, JWT, Jest + Supertest

For each issue: branch `feature/issue-<n>-short-name`, commit, raise a PR with `Closes #<n>`, repo owner reviews and merges.

---

## Issue #2: PostgreSQL schema per SAD: users, laboratories, equipment, reservations, audit_logs
- Requirement: FR-003 / NFR-002
- Story points: 5
- Test Plan cases: TC-007
- Labels: `sprint-1`
- Assignee: Manjunatha H J

**Description**
Create the relational schema exactly as specified in SAD section 6. Merge this first after repo setup; everything depends on it.

**Tasks**
- [ ] CREATE EXTENSION btree_gist
- [ ] users(user_id, email UNIQUE, password_hash, role STUDENT/TECHNICIAN/ADMIN, late_return_count)
- [ ] laboratories(lab_id, name, department, location_building)
- [ ] equipment(equipment_id, name, lab_id FK, status AVAILABLE/MAINTENANCE/OUT_OF_ORDER, calibration_expiration TIMESTAMPTZ)
- [ ] reservations(reservation_id, equipment_id FK, student_id FK, start_time, end_time, status CONFIRMED/CANCELLED/RETURNED/LATE_RETURNED, token UUID UNIQUE, is_late) with EXCLUDE USING GIST (equipment_id WITH =, tsrange(start_time,end_time) WITH &&)
- [ ] audit_logs table (append-only; trigger blocking UPDATE/DELETE if time allows, else log as deviation)
- [ ] Migration scripts that run on a fresh database

**Acceptance criteria**
- Migrations run cleanly on an empty PostgreSQL 15 database
- Inserting two overlapping reservations for the same equipment is rejected by the database
- Duplicate tokens are rejected

---

## Issue #11: Overlap prevention using the database exclusion constraint
- Requirement: FR-003
- Story points: 5
- Test Plan cases: TC-007
- Labels: `sprint-1`
- Assignee: Manjunatha H J

**Description**
Two students must never hold overlapping slots on the same equipment. The database constraint is the final guard.

**Tasks**
- [ ] Catch the PostgreSQL exclusion violation (error code 23P01) and return 409 Conflict
- [ ] Include alternative available slots in the 409 response
- [ ] Tests: overlap, back-to-back (allowed), partial overlap

**Acceptance criteria**
- Pass: overlapping request rejected (409) with alternatives
- Fail: both overlapping reservations confirmed

---

## Issue #12: Reservation endpoint: transaction, row lock and token
- Requirement: FR-001
- Story points: 3
- Test Plan cases: TC-001
- Labels: `sprint-1`
- Assignee: Manjunatha H J

**Description**
POST /api/v1/reservations following SAD sequence 4.1.

**Tasks**
- [ ] Validate request, then open a transaction
- [ ] SELECT ... FOR UPDATE on the equipment row
- [ ] INSERT reservation with unique UUID token, commit, return 201 Created with the token
- [ ] Roll back and return the right code (400/409/422) on failure

**Acceptance criteria**
- Pass: slot locked and reservation token generated
- Tokens are unique

---
