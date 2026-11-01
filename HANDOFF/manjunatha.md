# Team Handoff Guide: Manjunatha H J (PES1UG24AM157)

**Role:** Slot Allocation & Conflict Resolution Lead (Chief Architect)  
**Assigned Issues (13 Story Points):**
* **Issue #2:** PostgreSQL schema per SAD (5 pts)
* **Issue #11:** Overlap prevention using database exclusion constraint (5 pts)
* **Issue #12:** Reservation endpoint with transaction, row lock and token (3 pts)

---

### Step 1: Open Git Bash on your computer
Navigate to the project directory:
```bash
cd "Smart-Lab-Equipment-Slot-Reservation-Portal"
```

---

### Step 2: Push Issue #2 (PostgreSQL 3NF Schema)
*(Run right after Issue #1 is merged)*
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-2-db-schema

git add server/src/database/schema.sql server/src/database/migrate.js server/src/config/db.js

git commit -m "feat(#2): implement postgresql 3nf schema with btree_gist and exclusion constraint"
git push origin feature/issue-2-db-schema
```
**Raise PR on GitHub:**
* **Title:** `feat(#2): PostgreSQL 3NF schema, btree_gist and migration runner`
* **Description:**
  ```text
  Closes #2
  - Creates users, laboratories, equipment, reservations, audit_logs tables
  - Enables btree_gist extension and EXCLUDE USING GIST constraint
  - Reviewer: @LakshanyaaN
  ```

---

### Step 3: Push Issue #11 & #12 (Overlap Prevention & Reservation Transaction)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-11-reservation-engine

git add server/src/services/reservationService.js server/src/repositories/reservationRepository.js server/src/controllers/reservationController.js server/src/routes/reservationRoutes.js

git commit -m "feat(#11, #12): slot reservation endpoint with row lock SELECT FOR UPDATE and overlap guard 409"
git push origin feature/issue-11-reservation-engine
```
**Raise PR:** Title: `feat(#11, #12): Reservation transaction with row lock and overlap exclusion` (Closes #11, Closes #12).
