# Team Handoff Guide: Kshama (PES1UG24AM142)

**Role:** Equipment & Calibration Management Lead  
**Assigned Issues (13 Story Points):**
* **Issue #4:** Seed data: laboratories, equipment, users (2 pts)
* **Issue #5:** Equipment list API and page (3 pts)
* **Issue #6:** Equipment search and filtering (3 pts)
* **Issue #10:** Calibration verification before reservation (5 pts)

---

### Step 1: Open Git Bash on your computer
Navigate to the project directory:
```bash
cd "Smart-Lab-Equipment-Slot-Reservation-Portal"
```

---

### Step 2: Push Issue #4 (Seed Data)
*(Run after Issue #2 schema is merged)*
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-4-seed-data

# Stage seed file
git add server/src/database/seed.js

git commit -m "feat(#4): create repeatable seed data with users, laboratories and equipment E1 and E2"
git push origin feature/issue-4-seed-data
```
**Raise PR on GitHub:**
* **Title:** `feat(#4): Seed data for users, labs, and equipment (E1 & E2)`
* **Description:**
  ```text
  Closes #4
  - Creates repeatable seed data: student1, student2, tech1
  - Creates equipment items including E1 (valid calib) and E2 (expired calib for TC-005)
  - Reviewer: @LakshanyaaN
  ```

---

### Step 3: Push Issue #5 & #6 (Equipment Catalog, Search & Filtering)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-5-equipment-catalog

git add server/src/controllers/equipmentController.js server/src/repositories/equipmentRepository.js server/src/routes/equipmentRoutes.js client/src/pages/EquipmentListPage.jsx

git commit -m "feat(#5, #6): add equipment list API, search, filter and no-match empty state"
git push origin feature/issue-5-equipment-catalog
```
**Raise PR:** Title: `feat(#5): Equipment Catalog list, search and filtering` (Closes #5, Closes #6).

---

### Step 4: Push Issue #10 (Calibration Verification Guard)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-10-calibration-guard

git add server/src/services/reservationService.js

git commit -m "feat(#10): reject reservation for uncalibrated or expired equipment with 422"
git push origin feature/issue-10-calibration-guard
```
**Raise PR:** Title: `feat(#10): Calibration verification guard before confirming slot` (Closes #10).
