# Sprint-1 Issues: Mohammed Arfan Asgar (PES1UG24AM163)
Focus: Authentication and real-time availability (SRS role: Authentication & Real-Time Engine)
Sprint: 19 Oct to 23 Oct 2026 | Total story points: 13

Project: Smart Lab Equipment Slot Reservation Portal (Team 001)
Stack (per SAD): React 18 + Vite + Tailwind, Node.js Express, PostgreSQL 15 with btree_gist, JWT, Jest + Supertest

For each issue: branch `feature/issue-<n>-short-name`, commit, raise a PR with `Closes #<n>`, repo owner reviews and merges.

---

## Issue #1: Repo setup, monorepo structure and GitHub Actions CI
- Requirement: Setup / NFR-006
- Story points: 3
- Test Plan cases: -
- Labels: `sprint-1`
- Assignee: Mohammed Arfan Asgar

**Description**
Create the project skeleton (server/ = Node.js Express API, client/ = React 18 + Vite + Tailwind) and automate checks on every pull request.

**Tasks**
- [ ] Create server/ and client/ folders, README, .gitignore, .env.example
- [ ] Add docker-compose.yml for local PostgreSQL 15
- [ ] Add .github/workflows/ci.yml: Node 20, PostgreSQL 15 service container, npm ci, run Jest on push and pull_request
- [ ] Add PR template; document that the repo owner must review before merge
- [ ] Link the GitHub Project to the repo

**Acceptance criteria**
- CI runs automatically on every PR and shows pass/fail
- Merge needs repo owner approval

---

## Issue #3: Authentication and role-based access control (JWT)
- Requirement: FR-006 / NFR-003
- Story points: 5
- Test Plan cases: TC-015, TC-016
- Labels: `sprint-1`
- Assignee: Mohammed Arfan Asgar

**Description**
Backend login with bcrypt-hashed passwords and JWT, plus middleware that protects routes by role.

**Tasks**
- [ ] POST /api/v1/auth/login { email, password }: 200 OK or 401
- [ ] bcrypt password hashing; JWT with 15-minute TTL; store in HttpOnly cookie (log SAD memory-storage ambiguity in DEVIATIONS)
- [ ] authenticate and requireRole('STUDENT'|'TECHNICIAN') middleware returning 401/403
- [ ] Parameterised SQL only

**Acceptance criteria**
- Pass: JWT issued for valid credentials; 401/403 enforced on unauthorised routes
- Fail: a student can reach a technician route

---

## Issue #7: Real-time slot availability and alternatives
- Requirement: FR-001 / UC-05
- Story points: 5
- Test Plan cases: TC-007
- Labels: `sprint-1`
- Assignee: Mohammed Arfan Asgar

**Description**
Show free and booked slots for a piece of equipment across the next 7 days, and suggest alternatives when a slot is taken.

**Tasks**
- [ ] Endpoint returning booked intervals and free windows per equipment and date (max 7 days ahead)
- [ ] Reflect a new reservation immediately
- [ ] Alternate flow 5a: if a requested slot is unavailable, return other available slots

**Acceptance criteria**
- Availability updates right after a booking
- Only the next 7 days are offered
- Unavailable slot response includes alternatives

---
