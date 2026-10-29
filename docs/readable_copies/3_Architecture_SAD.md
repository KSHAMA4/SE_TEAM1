**SOFTWARE ARCHITECTURE ****&**** DESIGN SPECIFICATION (SADD)**

*Smart Lab Equipment Slot Reservation Portal - 3-Tier Layered Architecture, Security Modeling **&** Schemas*
*Standards Compliance: IEEE 1016-2009 / ISO/IEC/IEEE 42010 Architecture Standard | Deliverables Part-1 Baseline*

| **Project Name** | Smart Lab Equipment Slot Reservation Portal |
| --- | --- |
| **Course ****&**** Team** | Software Engineering Lab-01 (UE24CS341A) │ Team No: 001 │ Date: October 2026 |
| **Specification Document** | 3_ArchitectureDesign_SmartLabEquipment.docx (IEEE 1016-2009) |
| **Document Version** | 1.0 - Official Baseline |
| **Repository** | https://github.com/LakshanyaaN/Smart-Lab-Equipment-Slot-Reservation-Portal |
| **Architecture Engineering Team** | Manjunatha H J (PES1UG24AM157) - Chief Architect & Database Schema Lead Mohammed Arfan Asgar (PES1UG24AM163) - Backend API & Microservices Lead N. Lakshanyaa (PES1UG24AM169) - Project Lead & Frontend SPA Architecture Kshama (PES1UG24AM142) - Security Modeling & Data Integrity Lead |

**1. Introduction ****&**** Architectural Goals**

This Software Architecture & Design Document (SADD) defines the structural organization, component decomposition, interface protocols, and relational data schemas for the Smart Lab Equipment Slot Reservation Portal in accordance with IEEE 1016-2009. The architecture is engineered to satisfy strict constraints regarding ACID transactional integrity, zero double-booking tolerance under race conditions, deterministic 2-hour window enforcement, and zero-trust role isolation.

**2. Architectural Pattern: 3-Tier Layered Architecture**

| **Layer / Tier** | **Technology Stack** | **Core Components ****&**** Responsibilities** | **Security Protocols** |
| --- | --- | --- | --- |
| Tier 1: Presentation Layer | React.js 18, Vite, Tailwind CSS, Axios, Lucide Icons | Client-side SPA rendering, responsive student/technician dashboards, JWT token memory storage, form validation. | XSS sanitization, CSP headers, HttpOnly cookie storage. |
| Tier 2: Business Logic & API Layer | Node.js (Express) / REST Engine | REST API controllers, stateless JWT middleware, slot availability engine, calibration validator, late return policy, notification dispatcher. | Bcrypt password hashing, IDOR guards, rate limiting, CORS whitelist. |
| Tier 3: Persistence Layer | PostgreSQL 15+, btree_gist extension | Relational ACID database, exclusion lock constraints (EXCLUDE USING GIST), append-only audit trail, automated snapshot backups. | TLS connection encryption, AES-256 data at rest, row-level access control. |

**3. Security Architecture ****&**** STRIDE Threat Analysis**

| **STRIDE Category** | **Vulnerability Scenario** | **Impact on System** | **Architectural Countermeasure** |
| --- | --- | --- | --- |
| Spoofing Identity | Attacker captures session or replays stolen login credentials to reserve equipment. | Unauthorized reservations, asset squatting | Multi-Factor Auth option, 15-minute JWT TTL, rotating refresh tokens with IP binding. |
| Tampering with Data | Malicious actor alters calibration expiration date or equipment status in transit. | Usage of unsafe uncalibrated equipment | TLS 1.3 encryption, database write triggers restricted strictly to TECHNICIAN role. |
| Repudiation | Technician denies altering calibration date; student denies returning equipment late. | Loss of accountability, disputes | Append-only audit trail capturing actor ID, timestamp, before/after state JSON diff, source IP. |
| Information Disclosure | Student queries another student's reservations via URL IDOR manipulation. | Student privacy violation | Zero-trust object authorization: query filters strictly bound to authenticated token claims. |
| Denial of Service | Automated script submits thousands of slot check calls to exhaust database pool. | Portal downtime during exam projects | Token bucket rate limiting (100 req/min per IP), database connection pooling, query indexing. |
| Elevation of Privilege | Student tampers JWT claims to impersonate Lab Technician role. | Full lab administrative compromise | Asymmetric JWT signing; server validates signature; role claims re-verified against DB cache. |

**4. Dynamic Behavioral Sequence Workflows**

**4.1 Sequence 1: Slot Reservation ****&**** Double-Booking Lock Isolation**

1. Client submits POST /api/reservations with { equipment_id, start_time, end_time }.
2. Reservation Controller validates duration <= 120 minutes and start_time <= now + 7 days.
3. Calibration Engine checks equipment status == 'AVAILABLE' and calibration_expiration >= end_time.
4. Database transaction initiates SELECT FOR UPDATE on equipment row.
5. Exclusion constraint checks postgres tsrange overlap: EXCLUDE USING GIST (equipment_id WITH =, slot_range WITH &&).
6. If no overlap, INSERT INTO reservations succeeds; unique reservation_token generated.
7. Transaction commits atomically; 201 Created returned with token.

**4.2 Sequence 2: Equipment Return ****&**** Late Return Evaluation**

1. Student submits POST /api/reservations/:id/return.
2. Return Controller retrieves reservation record and current server timestamp.
3. If return_timestamp > end_time, controller sets is_late = TRUE and status = 'LATE_RETURNED'.
4. Database updates reservation record and increments student's cumulative late_return_count.
5. Event Logger emits 'LATE_RETURN_DETECTED' event to notification service.
6. Response returns 200 OK with return receipt.

**5. RESTful API Design Specification**

| **Endpoint URL** | **Method** | **Auth Role** | **Request Payload / Params** | **Response Codes** |
| --- | --- | --- | --- | --- |
| /api/v1/auth/login | POST | Public | { email, password } | 200 OK, 401 Unauthorized |
| /api/v1/equipment | GET | Authenticated | QueryParams: ?lab, ?status, ?search | 200 OK, 401 Unauthorized |
| /api/v1/equipment/:id | PUT | Technician | { status, calibration_expiration } | 200 OK, 403 Forbidden |
| /api/v1/reservations | POST | Student | { equipment_id, start_time, end_time } | 201 Created, 400, 409, 422 |
| /api/v1/reservations/me | GET | Student | QueryParams: ?status | 200 OK, 401 Unauthorized |
| /api/v1/reservations/:id/cancel | POST | Student | None | 200 OK, 400, 403 Forbidden |
| /api/v1/reservations/:id/return | POST | Student | None | 200 OK, 400 Bad Request |
| /api/v1/technician/reservations | GET | Technician | QueryParams: ?is_late, ?equipment_id | 200 OK, 403 Forbidden |

**6. Relational Database Architecture ****&**** 3NF Schemas**

| **Table Name** | **Primary Key** | **Key Attributes ****&**** Columns** | **Relationships ****&**** Constraints** |
| --- | --- | --- | --- |
| users | user_id (BIGSERIAL) | email (VARCHAR UNIQUE), password_hash (VARCHAR), role (VARCHAR: 'STUDENT'/'TECHNICIAN'/'ADMIN'), late_return_count (INT) | Base table for authenticating users. |
| laboratories | lab_id (BIGSERIAL) | name (VARCHAR), department (VARCHAR), location_building (VARCHAR) | Parent entity for equipment groupings. |
| equipment | equipment_id (BIGSERIAL) | name (VARCHAR), lab_id (FK), status (VARCHAR: 'AVAILABLE'/'MAINTENANCE'/'OUT_OF_ORDER'), calibration_expiration (TIMESTAMPTZ) | FK -> laboratories(lab_id). Managed by Lab Technicians. |
| reservations | reservation_id (BIGSERIAL) | equipment_id (FK), student_id (FK), start_time (TIMESTAMPTZ), end_time (TIMESTAMPTZ), status (VARCHAR: 'CONFIRMED'/'CANCELLED'/'RETURNED'/'LATE_RETURNED'), token (UUID UNIQUE), is_late (BOOL) | FK -> equipment, users. EXCLUDE USING GIST (equipment_id WITH =, tsrange(start_time, end_time) WITH &&). |
| audit_logs | log_id (BIGSERIAL) | actor_user_id (FK), action (VARCHAR), target_table (VARCHAR), details (JSONB), ip_address (INET), created_at (TIMESTAMPTZ) | Append-Only table. Direct UPDATE/DELETE blocked via trigger. |