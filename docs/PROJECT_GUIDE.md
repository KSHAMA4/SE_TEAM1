# PROJECT GUIDE: Smart Lab Equipment Slot Reservation Portal

*A beginner-friendly architectural walkthrough for PES University Software Engineering Lab (UE24CS341A)*  
*Team: 001 | Problem Statement: 001*

---

## 1. 3-Tier Layered Architecture Overview
The application follows a clean **3-Tier Layered Architecture** as specified in IEEE 1016-2009 / SAD:
1. **Presentation Tier (Client - `client/`)**:
   * Built with **React 18**, **Vite**, and **Tailwind CSS**.
   * Communicates with the backend exclusively via Axios (`client/src/api/axios.js`) sending REST requests with HttpOnly cookies.
2. **Application / Business Logic Tier (Server - `server/`)**:
   * Built with **Node.js 20** and **Express**.
   * Separated into **Controllers** (handling HTTP requests/responses), **Services** (enforcing rules like 2-hr limit, 7-day advance booking, and calibration validation), and **Repositories** (executing SQL).
3. **Data Tier (Database - PostgreSQL 15)**:
   * ACID-compliant relational database.
   * Leverages the `btree_gist` extension to enforce strict mathematical time-range exclusion constraints (`EXCLUDE USING GIST`), guaranteeing zero double-booking even under concurrent traffic.

---

## 2. Directory Layout
```text
mini-project/
├── .github/
│   ├── workflows/ci.yml           # Automated CI running Postgres 15 container & Jest on PRs
│   ├── PULL_REQUEST_TEMPLATE.md   # PR template for issue tracking
│   └── CODEOWNERS                 # Enforces review from repo lead (@LakshanyaaN)
├── client/                        # React 18 frontend
│   ├── src/
│   │   ├── api/axios.js           # Axios instance with cookie credentials
│   │   ├── components/            # Navbar, ReservationModal
│   │   ├── context/AuthContext.jsx# React Context for login state
│   │   ├── pages/                 # LoginPage, EquipmentListPage, MyReservationsPage
│   │   ├── App.jsx & main.jsx
├── server/                        # Node.js Express backend
│   ├── src/
│   │   ├── config/db.js           # PostgreSQL connection pool (max 20 connections)
│   │   ├── controllers/           # authController, equipmentController, reservationController
│   │   ├── services/              # authService, equipmentService, reservationService
│   │   ├── repositories/          # userRepository, equipmentRepository, reservationRepository
│   │   ├── middleware/            # authMiddleware (JWT verify), roleMiddleware (RBAC)
│   │   ├── database/              # schema.sql, migrate.js, seed.js
│   │   └── app.js & server.js
│   └── tests/sprint1.test.js      # Jest + Supertest suites (TC-001, TC-002, TC-003, TC-005, TC-007, etc.)
├── docker-compose.yml             # Single-command PostgreSQL 15 setup
├── docs/                          # Architectural docs, traceability matrix, deviations
└── HANDOFF/                       # Step-by-step Git & PR instructions per member
```

---

## 3. Database Tables in 3rd Normal Form (3NF)
1. **`users`**: Stores user authentication records, hashed passwords (bcrypt), and role (`STUDENT`, `TECHNICIAN`, `ADMIN`).
2. **`laboratories`**: Organizes equipment by laboratory name, department, and campus building.
3. **`equipment`**: Contains scientific instrument details, status (`AVAILABLE`, `MAINTENANCE`, `OUT_OF_ORDER`), and calibration expiration timestamps.
4. **`reservations`**: Records slot bookings with PostgreSQL range exclusion `EXCLUDE USING GIST (equipment_id WITH =, tsrange(start_time, end_time) WITH &&) WHERE (status = 'CONFIRMED')` and unique UUID token.
5. **`audit_logs`**: Append-only log recording actor ID, action, target table, and JSON details.

---

## 4. End-to-End Request Flow: "Reserve a Slot" (SAD Sequence 4.1)
1. Student clicks **"Reserve Slot"** on an equipment item and submits date and time.
2. Client sends `POST /api/v1/reservations` with `{ equipment_id, start_time, end_time }`.
3. `authMiddleware` verifies the JWT cookie and extracts `req.user.userId`.
4. `roleMiddleware` ensures the user has the `STUDENT` role.
5. `reservationService` runs business validation:
   * Checks slot duration $\le 120$ minutes.
   * Checks start time is within `now` to `now + 7 days`.
6. Opens database transaction (`BEGIN`):
   * Acquires row lock: `SELECT ... FROM equipment WHERE equipment_id = $1 FOR UPDATE`.
   * Checks calibration: verifies status is `AVAILABLE` and `calibration_expiration >= end_time`. If not, raises HTTP 422.
   * Checks overlap: queries for existing overlapping slots.
   * Inserts into `reservations`: Postgres exclusion constraint guarantees zero collisions.
   * Writes to `audit_logs`.
7. Commits transaction (`COMMIT`).
8. Returns `201 Created` with a unique UUID confirmation token.
