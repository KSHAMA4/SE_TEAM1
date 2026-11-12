# DEVIATIONS LOG: Smart Lab Equipment Slot Reservation Portal

**Project:** Team 001 - Problem Statement 001  
**Course:** Software Engineering Lab UE24CS341A (PES University)  
**Baseline Documents:** `1_SRS_SmartLabEquipment.docx`, `2_TestPlan_SmartLabEquipment.docx`, `3_ArchitectureDesign_SmartLabEquipment.docx`  

This document logs all architectural decisions, clarifications, and intentional scope deferrals relative to the initial submitted documentation, as required by Handout requirement (h).

---

### Deviation 1: API Route Versioning Prefix (`/api` vs `/api/v1`)
* **Location in Documents:** SAD Section 4.1 Sequence diagrams use `/api/reservations`, whereas SAD Section 5 (RESTful API Design Table) explicitly specifies `/api/v1/...`.
* **Resolution:** Standardized strictly on `/api/v1/...` across all Express controllers, client requests, and test suites. Version prefixes prevent breaking clients when APIs evolve.
* **Impact:** High consistency; adheres to IEEE API design standards.

---

### Deviation 2: JWT Session Storage (In-Memory vs HttpOnly Cookie)
* **Location in Documents:** SAD Section 2 mentions "JWT token memory storage", while the Security Protocols column states "HttpOnly cookie storage".
* **Resolution:** Implemented `HttpOnly`, `SameSite=Lax` cookies for the JWT token.
* **Reason:** In-memory JWT storage is vulnerable to Cross-Site Scripting (XSS) extraction via JavaScript. HttpOnly cookies cannot be read by `document.cookie`, offering superior defense-in-depth against credential theft.

---

### Deviation 3: Scope Boundary: Sprint-1 vs Sprint-2 Deferrals
* **Location in Documents:** SRS Section 3 and SAD Section 3 describe advanced security & operational features:
  * Multi-Factor Authentication (MFA)
  * Rotating refresh tokens with client IP binding
  * Token bucket rate limiting (100 req/min)
  * Database-level AES-256 transparent data encryption at rest and TLS 1.3 termination
  * Full equipment return and late tracking (`POST /api/v1/reservations/:id/return`)
  * Technician availability and calibration updates (`PUT /api/v1/equipment/:id`)
  * Global technician reservation view (`GET /api/v1/technician/reservations`)
  * 100-user concurrent race load test (NFR-001)
* **Resolution:** As defined by the lab syllabus and sprint scope, these features are explicitly assigned to **Sprint-2** (Issues #15 to #28). Sprint-1 delivers the complete core foundation: Authentication, Catalog Search & Filtering, Slot Availability, Overlap Exclusion Guard (409), Calibration Validation Guard (422), and Durability.

---

### Deviation 4: Payment Gateway Exclusion
* **Location in Documents:** Lab 1 Use-Case diagram depicts an external payment processing actor.
* **Resolution:** Payment processing is omitted, as confirmed in Test Plan Section 1.2 ("Out of Scope: Payment processing gateways"). Institutional university laboratories operate under academic access permissions rather than monetary transaction gateways.

---

### Deviation 5: Calendar Sprint Window
* **Observation:** The project work was completed subsequent to the calendar dates (19 Oct to 23 Oct) due to laboratory lab schedule arrangements. All functional criteria, test cases, and deliverables remain 100% compliant with Sprint-1 specifications.


### Deviation 6: Sprint 2 Completed Features
All Sprint 2 issues (#15-#28) implemented as planned.
Admin seed user (admin@pes.edu) added in Sprint 2 for admin feature testing.

### Deviation 7: Development Cycle Frozen
All features complete. No further feature branches will be created.

