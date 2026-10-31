# Team Handoff Guide: N. Lakshanyaa (PES1UG24AM169)

**Role:** Project Lead, UI/UX & Quality Assurance  
**Assigned Issues (13 Story Points):**
* **Issue #8:** React app shell, login page and reservation form (3 pts)
* **Issue #9:** Validate 2-hour duration and 7-day booking window (2 pts)
* **Issue #14:** My Reservations API and React page (3 pts)
* **Issue #13:** Durability and restart test (5 pts)

---

### Step 1: Open Git Bash on your computer
Navigate to the project directory:
```bash
cd "Smart-Lab-Equipment-Slot-Reservation-Portal"
```

---

### Step 2: Push Issue #8 (React App Shell, Login & Reservation Modal)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-8-react-app-shell

git add client/src/App.jsx client/src/main.jsx client/src/index.css client/src/pages/LoginPage.jsx client/src/components/Navbar.jsx client/src/components/ReservationModal.jsx client/src/api/axios.js client/src/context/AuthContext.jsx

git commit -m "feat(#8): implement react app shell, tailwind styling, login page and booking modal"
git push origin feature/issue-8-react-app-shell
```
**Raise PR on GitHub:** Title: `feat(#8): React app shell, login and reservation form` (Closes #8).  
*(Note: As repo lead, have Kshama or Arfan review and approve your PR).*

---

### Step 3: Push Issue #9 & #14 (Validation Rules & My Reservations Page)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-14-my-reservations

git add client/src/pages/MyReservationsPage.jsx client/src/components/ReservationModal.jsx server/src/services/reservationService.js

git commit -m "feat(#9, #14): enforce 2-hour/7-day rules and create student My Reservations view"
git push origin feature/issue-14-my-reservations
```
**Raise PR:** Title: `feat(#14): My Reservations view and validation rules` (Closes #9, Closes #14).

---

### Step 4: Push Issue #13 (Durability, CI Verification & Sprint-1 Test Suite)
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-13-durability-suite

git add server/tests/sprint1.test.js docs/SPRINT1_TRACEABILITY.md docs/PROJECT_GUIDE.md docs/DEMO_SCRIPT.md README.md

git commit -m "test(#13): complete sprint-1 jest test suite and durability persistence tests"
git push origin feature/issue-13-durability-suite
```
**Raise PR:** Title: `test(#13): Full Sprint-1 automated test suite and durability verification` (Closes #13).

---

### How to Review and Merge Teammates' PRs (As Project Lead):
1. Go to the repo on GitHub: `https://github.com/LakshanyaaN/Smart-Lab-Equipment-Slot-Reservation-Portal/pulls`
2. Click on the open PR submitted by Arfan, Kshama, or Manjunatha.
3. Check the **"Files changed"** tab.
4. Verify GitHub Actions CI test run is green (passed).
5. Click **"Review changes"** -> Select **"Approve"** -> Submit.
6. Click **"Merge pull request"** -> **"Confirm merge"**.
