# Sprint 1 Traceability Matrix: Requirement -> Issue -> Code -> Tests -> PR

**Course:** Software Engineering Lab UE24CS341A (PES University)  
**Team:** 001 | **Problem Statement:** 001  
**Project:** Smart Lab Equipment Slot Reservation Portal  

| Req ID | Requirement Description | Backlog Issue # | Assignee | Implementation Files | Test Cases Verified | PR Target Branch |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-006** | Repo skeleton & Automated CI Pipeline | Issue #1 | Mohammed Arfan Asgar | `.github/workflows/ci.yml`, `server/package.json`, `client/package.json` | Local CI & GitHub Actions | `feature/issue-1-repo-setup-ci` |
| **FR-003 / NFR-002** | PostgreSQL 3NF Schema & btree_gist extension | Issue #2 | Manjunatha H J | `server/src/database/schema.sql`, `server/src/database/migrate.js` | DDL Migration & Constraints | `feature/issue-2-db-schema` |
| **FR-002** | Test Seed Data (student1, student2, tech1, E1, E2) | Issue #4 | Kshama | `server/src/database/seed.js` | TC-001, TC-005 | `feature/issue-4-seed-data` |
| **FR-006 / NFR-003** | JWT Authentication, Bcrypt, RBAC Middleware | Issue #3 | Mohammed Arfan Asgar | `server/src/middleware/authMiddleware.js`, `roleMiddleware.js`, `authController.js` | TC-015, TC-016 | `feature/issue-3-jwt-auth-rbac` |
| **FR-001 / NFR-004** | React App Shell, Login Page & Reservation Modal | Issue #8 | N. Lakshanyaa | `client/src/pages/LoginPage.jsx`, `ReservationModal.jsx`, `App.jsx` | TC-001, TC-027 (manual) | `feature/issue-8-react-app-shell` |
| **FR-001 / FR-007** | Equipment Catalog API & Live React Page | Issue #5 | Kshama | `server/src/controllers/equipmentController.js`, `client/src/pages/EquipmentListPage.jsx` | TC-017 | `feature/issue-5-equipment-list` |
| **FR-007** | Equipment Search, Lab Filter & No-Match View | Issue #6 | Kshama | `server/src/repositories/equipmentRepository.js`, `EquipmentListPage.jsx` | TC-017 | `feature/issue-6-equipment-search` |
| **FR-001 / UC-05** | Real-Time Slot Availability & Alternatives | Issue #7 | Mohammed Arfan Asgar | `server/src/services/reservationService.js`, `ReservationModal.jsx` | TC-007, UC-05 | `feature/issue-7-slot-availability` |
| **FR-001** | Max 2-hr Duration & 7-day Window Validation | Issue #9 | N. Lakshanyaa | `server/src/services/reservationService.js`, `ReservationModal.jsx` | TC-002, TC-003 | `feature/issue-9-validation-rules` |
| **FR-002** | Equipment Calibration Verification Guard (422) | Issue #10 | Kshama | `server/src/services/reservationService.js` | TC-005 | `feature/issue-10-calibration-guard` |
| **FR-003** | Overlap Exclusion Constraint & 409 Conflict | Issue #11 | Manjunatha H J | `server/src/database/schema.sql`, `reservationService.js` | TC-007 | `feature/issue-11-overlap-prevention` |
| **FR-001** | Reservation Transaction, Row Lock & Token | Issue #12 | Manjunatha H J | `server/src/services/reservationService.js`, `reservationRepository.js` | TC-001 | `feature/issue-12-reservation-endpoint` |
| **FR-008 (view)**| Student My Reservations API & React View | Issue #14 | N. Lakshanyaa | `server/src/controllers/reservationController.js`, `MyReservationsPage.jsx` | TC-018 | `feature/issue-14-my-reservations` |
| **NFR-002** | Durability & Server Restart Test | Issue #13 | N. Lakshanyaa | `server/tests/sprint1.test.js`, PostgreSQL persistence volume | TC-024 (manual) | `feature/issue-13-durability-test` |
