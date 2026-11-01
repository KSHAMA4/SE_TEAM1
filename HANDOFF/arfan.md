# Team Handoff Guide: Mohammed Arfan Asgar (PES1UG24AM163)

**Role:** Authentication & Real-Time Engine Lead  
**Assigned Issues (13 Story Points):**
* **Issue #1:** Repo setup, monorepo and GitHub Actions CI (3 pts)
* **Issue #3:** JWT authentication and RBAC (5 pts)
* **Issue #7:** Real-time slot availability and alternatives (5 pts)

---

### Step 1: Open Git Bash on your computer
Navigate to the project folder:
```bash
cd "Smart-Lab-Equipment-Slot-Reservation-Portal"
```

---

### Step 2: Push Issue #1 (Repo Setup & CI)
```bash
# 1. Switch to a new feature branch for Issue #1
git checkout -b feature/issue-1-repo-setup-ci

# 2. Stage the setup files
git add .github/ .gitignore .env.example docker-compose.yml package.json server/package.json client/package.json docs/DEVIATIONS.md

# 3. Commit with issue reference
git commit -m "feat(#1): initialize monorepo structure, docker postgres and github actions ci"

# 4. Push branch to GitHub
git push origin feature/issue-1-repo-setup-ci
```
**Raise PR on GitHub:**
* **From:** `feature/issue-1-repo-setup-ci` -> **Into:** `main`
* **Title:** `feat(#1): Monorepo setup and GitHub Actions CI pipeline`
* **Description:**
  ```text
  Closes #1
  - Configures root monorepo, server (Node 20), client (React 18 + Vite)
  - Configures PostgreSQL 15 docker-compose and .github/workflows/ci.yml
  - Reviewer: @LakshanyaaN
  ```

---

### Step 3: Push Issue #3 (JWT Auth & RBAC)
*(Run after Issue #2 & #4 are merged into main)*
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-3-jwt-auth-rbac

git add server/src/middleware/ server/src/controllers/authController.js server/src/services/authService.js server/src/repositories/userRepository.js server/src/routes/authRoutes.js

git commit -m "feat(#3): implement bcrypt login, jwt issuance and rbac middleware"
git push origin feature/issue-3-jwt-auth-rbac
```
**Raise PR:** Title: `feat(#3): JWT Authentication and RBAC Middleware` (Closes #3).

---

### Step 4: Push Issue #7 (Slot Availability & Alternatives)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-7-slot-availability

git add server/src/routes/reservationRoutes.js server/src/services/reservationService.js

git commit -m "feat(#7): add real-time slot availability inquiry and suggested alternatives"
git push origin feature/issue-7-slot-availability
```
**Raise PR:** Title: `feat(#7): Real-time slot availability and alternatives` (Closes #7).
