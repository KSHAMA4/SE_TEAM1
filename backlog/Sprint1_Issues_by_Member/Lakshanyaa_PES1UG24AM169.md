# Sprint-1 Issues: N. Lakshanyaa (PES1UG24AM169)
Focus: Frontend shell, validation, durability and QA (SRS role: Project Lead, UI/UX & QA)
Sprint: 19 Oct to 23 Oct 2026 | Total story points: 13

Project: Smart Lab Equipment Slot Reservation Portal (Team 001)
Stack (per SAD): React 18 + Vite + Tailwind, Node.js Express, PostgreSQL 15 with btree_gist, JWT, Jest + Supertest

For each issue: branch `feature/issue-<n>-short-name`, commit, raise a PR with `Closes #<n>`, repo owner reviews and merges.

---

## Issue #8: React app shell: login page, routing and reservation form
- Requirement: FR-001 / NFR-004
- Story points: 3
- Test Plan cases: TC-001, TC-027
- Labels: `sprint-1`
- Assignee: N. Lakshanyaa

**Description**
Frontend foundation: login page, protected routes, navigation, and the reservation form (equipment, date, start, end). Booking should take 5 steps or fewer.

**Tasks**
- [ ] Vite + React 18 + Tailwind setup with Axios
- [ ] Login page and protected routing
- [ ] Reservation form with success screen showing the token
- [ ] Clear error messages for 400, 409 and 422 responses

**Acceptance criteria**
- Student can log in and submit a reservation from the UI
- Token shown after confirmation
- Booking flow takes 5 steps or fewer

---

## Issue #9: Validate max 2-hour duration and 7-day booking window
- Requirement: FR-001
- Story points: 2
- Test Plan cases: TC-002, TC-003
- Labels: `sprint-1`
- Assignee: N. Lakshanyaa

**Description**
Reject reservations that break the duration or advance-booking rules on the server and in the form.

**Tasks**
- [ ] Reject duration > 120 minutes (121 minutes fails, 120 passes)
- [ ] Reject start in the past and beyond now + 7 days (7 days exactly is accepted)
- [ ] Return 400 with clear messages; mirror checks in the form

**Acceptance criteria**
- Pass: 2-hour slot within 7 days accepted
- Fail: reservation exceeding 2 hours or outside the window is accepted

---

## Issue #13: Durability: reservations and tokens survive logout, refresh and restart
- Requirement: NFR-002
- Story points: 5
- Test Plan cases: TC-024
- Labels: `sprint-1`
- Assignee: N. Lakshanyaa

**Description**
Make sure confirmed reservations are committed and persisted, and prove it with a restart test.

**Tasks**
- [ ] Confirm commits happen before returning 201
- [ ] Docker volume so PostgreSQL data survives container restart
- [ ] Step-by-step manual test for TC-024: reserve, restart API and DB, log in again, reservation and token still there
- [ ] Automated check that a reservation is retrievable after logout/login

**Acceptance criteria**
- Pass: reservation record and token remain retrievable after logout, refresh or system restart
- Fail: a confirmed reservation or its token is lost

---

## Issue #14: My Reservations: API and React page
- Requirement: FR-008 (view part)
- Story points: 3
- Test Plan cases: TC-018
- Labels: `sprint-1`
- Assignee: N. Lakshanyaa

**Description**
Students view their own reservations with token, equipment and time. (Cancel is Sprint-2.)

**Tasks**
- [ ] GET /api/v1/reservations/me with optional ?status
- [ ] Filter strictly by the authenticated user (no IDOR)
- [ ] React page with status and token; empty state

**Acceptance criteria**
- Student sees only their own reservations
- Tokens match those issued at booking

---
