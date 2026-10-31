# Smart Lab Equipment Slot Reservation Portal

*Academic & Research Equipment Management Platform - PES University (UE24CS341A)*  
*Team 001 | Problem Statement 001 | Sprint-1 Baseline Release*

---

## 1. Prerequisites (Windows)
1. **Node.js 20 LTS** and **npm**: [Download and install Node.js 20](https://nodejs.org/). Make sure to tick the checkbox "Add to PATH".
2. **Git**: Installed with Git Bash.
3. **Docker Desktop** (or native **PostgreSQL 15**):
   * *Option A (Recommended)*: Start Docker Desktop on Windows.
   * *Option B*: If using native PostgreSQL, ensure it is listening on port 5432 with username `postgres` and password `postgres`.

---

## 2. Quick Setup & Run Instructions

### Step 1: Start PostgreSQL 15 Container
Open **Git Bash** in the project root:
```bash
docker compose up -d
```
*(Verify it is running with `docker ps`. You should see `smart_lab_postgres` listening on `0.0.0.0:5432`).*

### Step 2: Install Dependencies
```bash
# Install root, backend and frontend dependencies
npm run install:all
```

### Step 3: Run Database Migrations and Seed
```bash
npm run migrate
npm run seed
```
This sets up the 3NF schema, enables the `btree_gist` extension, and seeds:
* `student1@pes.edu` / `Password123!` (Student)
* `student2@pes.edu` / `Password123!` (Student)
* `tech1@pes.edu` / `Password123!` (Technician)
* **Equipment E1**: Digital Storage Oscilloscope (Valid Calibration)
* **Equipment E2**: Rigol Spectrum Analyzer (Expired Calibration for testing rule TC-005)

### Step 4: Run Automated Tests
```bash
npm run test:server
```
Runs Jest + Supertest test cases mapping directly to the IEEE Test Plan:
* **TC-001**: Valid 2-hour reservation on E1 (Returns 201 Created & UUID Token)
* **TC-002**: Reject reservation > 120 minutes (121 min rejected with 400 Bad Request)
* **TC-003**: 7-day advance booking & past booking boundaries
* **TC-005**: Reject reservation for expired calibration (E2) with 422 Unprocessable Entity
* **TC-007**: Overlap exclusion prevention (409 Conflict with alternative slots suggested)
* **TC-015**: JWT login with bcrypt verification
* **TC-016**: RBAC enforcement (Student calling technician endpoint returns 403 Forbidden)
* **TC-017**: Catalog search, filtering, and no-match empty state
* **TC-018**: My Reservations view

### Step 5: Start Development Servers
```bash
npm run dev
```
* **Frontend SPA**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`
* **API Health Check**: `http://localhost:5000/health`

---

## 3. Team Member Backlog & Branch Strategy
Sprint-1 assigns **exactly 13 story points** to each of the 4 team members:
* **Mohammed Arfan Asgar (PES1UG24AM163)**: Issues #1, #3, #7 -> `feature/issue-1-...`
* **Kshama (PES1UG24AM142)**: Issues #4, #5, #6, #10 -> `feature/issue-4-...`
* **Manjunatha H J (PES1UG24AM157)**: Issues #2, #11, #12 -> `feature/issue-2-...`
* **N. Lakshanyaa (PES1UG24AM169)**: Issues #8, #9, #13, #14 -> `feature/issue-8-...`

See `HANDOFF/` for individual step-by-step Git Bash commands for each member.
