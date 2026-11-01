# 60-Second Demo Script & Viva Preparation

**Team 001:** Smart Lab Equipment Slot Reservation Portal (Problem Statement 001)  
**Evaluation:** PES University Software Engineering Lab UE24CS341A

---

## 1. 60-Second Video Demo Script (Shot-by-Shot Walkthrough)

| Time (sec) | Action on Screen | Audio / Commentary Voiceover | Test Case Proven |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:08** | Open browser to `http://localhost:5173`. Click quick-fill for `student1@pes.edu` and click "Sign in". | "Welcome to Team 001's Smart Lab Equipment Slot Reservation Portal. We log in as student1, authenticating via bcrypt and JWT." | TC-015 |
| **00:08 - 00:18** | On the Catalog page, type `Oscilloscope` in the search bar. Then type `XYZUnknown` to show the empty state. Clear search and filter by department. | "Our catalog supports keyword search, lab filtering, and live calibration badges. Searching for a non-existent item displays a clean no-match notice." | TC-017 |
| **00:18 - 00:30** | Click "Reserve Slot" on Equipment #1 (DSO 100MHz). Select tomorrow 10:00 to 12:00 (120 mins). Click "Confirm Slot". | "We reserve a valid 2-hour slot on Equipment E1. The server acquires a row lock, inserts the booking, and returns a unique UUID token." | TC-001 |
| **00:30 - 00:40** | Open another tab / logout, log in as `student2@pes.edu`. Try to book the exact same slot on E1 (11:00 to 13:00). | "Now student2 attempts an overlapping booking. The PostgreSQL exclusion constraint rejects it with HTTP 409 Conflict and suggests alternative open slots." | TC-007 |
| **00:40 - 00:48** | Go back to Catalog. Click "Reserve Slot" on Equipment #2 (Rigol Spectrum Analyzer - expired calibration). Attempt to book. | "When attempting to book Equipment E2, calibration verification detects an expired certificate and rejects the request with HTTP 422 Unprocessable Entity." | TC-005 |
| **00:48 - 00:60** | Navigate to "My Reservations" tab. Refresh browser. Stop the server (`Ctrl+C`) and restart it (`npm start`). Refresh again. | "In My Reservations, confirmed tokens persist. Even after restarting the backend and database, data durability is 100% maintained. Thank you!" | TC-018, TC-024 |

---

## 2. Top 10 Likely Viva Questions & Short Answers

1. **Q: Why did you use `EXCLUDE USING GIST` instead of regular application-level validation?**  
   *A:* Application-level checks suffer from race conditions under concurrent requests (Time-of-Check to Time-of-Use bug). PostgreSQL's exclusion constraint enforces mutual exclusion at the database engine level inside an ACID transaction.

2. **Q: What is the purpose of `SELECT ... FOR UPDATE`?**  
   *A:* It acquires a pessimistic write lock on the equipment row for the duration of the reservation transaction, preventing concurrent transactions from modifying status or calibration while a reservation is in progress.

3. **Q: Why store JWT in an HttpOnly cookie instead of localStorage?**  
   *A:* JavaScript cannot access `HttpOnly` cookies, which protects the user's session token from being stolen via Cross-Site Scripting (XSS) attacks.

4. **Q: What HTTP status codes are used and why?**  
   *A:* `200 OK` for retrieval; `201 Created` for successful reservations; `400 Bad Request` for duration > 120 mins or past date; `401 Unauthorized` for missing/invalid JWT; `403 Forbidden` for RBAC role violations; `409 Conflict` for overlapping slots; `422 Unprocessable Entity` for expired calibration.

5. **Q: How is the 2-hour and 7-day rule enforced?**  
   *A:* Enforced on both tiers: client-side form calculation for immediate user feedback, and server-side in `reservationService.js` to prevent API bypassing.

6. **Q: How does GitHub Actions CI verify each Pull Request?**  
   *A:* On every PR to `main`, GitHub Actions spins up an Ubuntu runner with a live PostgreSQL 15 container, runs migrations and seeds, and executes the Jest + Supertest suite. The PR cannot be merged if tests fail.

7. **Q: What is the difference between Equipment E1 and E2 in your database?**  
   *A:* Equipment E1 has `status = 'AVAILABLE'` and future calibration expiration (valid). Equipment E2 has `calibration_expiration` in the past, designed specifically to verify rule TC-005.

8. **Q: Why do you have a `laboratories` table instead of storing lab name directly in `equipment`?**  
   *A:* To satisfy 3rd Normal Form (3NF). Equipment belongs to a laboratory, and laboratories have independent attributes (department, building location) that avoid data duplication and update anomalies.

9. **Q: What does `tsrange(start_time, end_time) WITH &&` mean in PostgreSQL?**  
   *A:* It converts the timestamps into a continuous time interval range and uses the `&&` overlap operator to check if two intervals intersect in time.

10. **Q: How did your team ensure balanced contribution?**  
    *A:* Sprint-1 was split into 14 issues across 4 members, giving each member exactly 13 story points. Each member opened PRs from their own feature branch for peer review and merge.
