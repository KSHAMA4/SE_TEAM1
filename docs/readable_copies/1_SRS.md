**SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**

*Smart Lab Equipment Slot Reservation Portal - Academic **&** Research Equipment Management Platform*
*Standards Compliance: IEEE 830-1998 Recommended Practice | Deliverables Part-1 Baseline*

| **Project Name** | Smart Lab Equipment Slot Reservation Portal |
| --- | --- |
| **Course ****&**** Team** | Software Engineering Lab-01 (UE24CS341A) │ Team No: 001 │ Problem Statement 001 |
| **Specification Document** | 1_SRS_SmartLabEquipment.docx (IEEE 830-1998) |
| **Document Version** | 1.0 - Official Baseline |
| **Date** | October 2026 |
| **Repository** | https://github.com/LakshanyaaN/Smart-Lab-Equipment-Slot-Reservation-Portal |
| **Project Team ****&**** SRNs** | Mohammed Arfan Asgar (PES1UG24AM163) - Authentication & Real-Time Engine Kshama (PES1UG24AM142) - Equipment & Calibration Management Manjunatha H J (PES1UG24AM157) - Slot Allocation & Conflict Resolution N. Lakshanyaa (PES1UG24AM169) - Project Lead, UI/UX & Quality Assurance |

**1. Introduction**

**1.1 Purpose**

This Software Requirements Specification (SRS) document details the complete functional, non-functional, and interface specifications for the Smart Lab Equipment Slot Reservation Portal, developed under IEEE 830-1998 guidelines. The system serves as a central institutional laboratory administration platform designed to manage high-value scientific equipment, enforce automated 2-hour reservation windows up to 7 days in advance, perform real-time equipment calibration verification, prevent concurrent double-booking via database-level lock isolation, track physical returns and late returns, and enable lab technicians to maintain equipment availability schedules.

**1.2 Document Conventions**

This document follows standard IEEE 830 nomenclature. Requirement identifiers use standard prefixes:
• FR-xxx: Functional Requirements (Numbered FR-001 through FR-010)
• NFR-xxx: Non-Functional Requirements (Numbered NFR-001 through NFR-006)
• UC-xx: UML Use Cases (Numbered UC-01 through UC-15)
Priorities are classified as High (P1), Medium (P2), or Low (P3).

**1.3 Intended Audience and Reading Suggestions**

This document is authored for the academic evaluation committee, software engineering development team (Frontend, Backend, Database), independent verification & validation (IV&V) test engineers, and laboratory technicians. It provides a formal contract defining precise system boundaries and behavioral constraints.

**1.4 Product Scope**

The Smart Lab Equipment Slot Reservation Portal eliminates manual paper logbooks, uncoordinated equipment usage, and unauthorized operation of uncalibrated instruments. The web-based system delivers strict role-based access control (RBAC), ensuring students reserve valid equipment slots without scheduling conflicts, while empowering lab technicians with administrative control over maintenance states, calibration certificates, and late return logging.

**2. Overall Description**

**2.1 Product Perspective**

The portal operates as a self-contained 3-tier web application comprising a modern Single Page Application (SPA) client layer (React.js + Tailwind CSS), a stateless RESTful API service layer (Node.js Express), and an ACID-compliant relational data store (PostgreSQL 15+ with btree_gist exclusion constraints). The system integrates with external notification services (email/SMS) for reservation lifecycle alerts and JWT authentication adapters.

**2.2 User Classes and Characteristics**

1. Student (Learner / User): Authenticated university student requiring access to lab instruments for coursework and research. Functions: Browse catalog, view real-time availability, reserve 2-hour slots up to 7 days ahead, manage own reservations, return equipment.
2. Lab Technician (Manager / Administrator): Authorized laboratory staff responsible for equipment readiness. Functions: Update equipment status (Available, Maintenance, Out of Order), update calibration expiration dates, review all system reservations, monitor late returns, enforce lab disciplinary rules.
3. Administrator (System Superuser): IT staff managing system security, user provisioning, database configuration, and audit trail inspection.

**2.3 Operating Environment**

• Client Platform: Modern web browsers (Chrome >= 110, Edge >= 110, Firefox >= 115, Safari >= 16) with responsive viewport support (320px to 4K).
• Server OS: Linux (Ubuntu 22.04 LTS) or containerized Node.js 20 LTS environment.
• Database Environment: PostgreSQL 15+ with UTF-8 encoding, connection pooling, and btree_gist extension.
• Network Protocol: HTTPS (TLS 1.3) over TCP port 443.

**2.4 Design ****&**** Implementation Constraints**

• Reservation Window Constraint: Maximum 2 hours per reservation slot; maximum 7 days advance booking.
• Concurrency Guard: Strict database-level pessimistic/exclusion locking to prevent double-booking under race conditions (target latency <= 200 ms).
• Calibration Safety Rule: Automatic rejection of reservation requests for equipment with invalid or expired calibration certificates.

**3. Specific Functional Requirements (FR-001 to FR-010)**

| **Req ID** | **Feature Name** | **Functional Description** | **Priority** | **Acceptance Criteria** |
| --- | --- | --- | --- | --- |
| FR-001 | Slot Reservation Engine | The system shall allow authenticated students to view real-time availability and reserve a maximum 2-hour slot for any calibrated equipment up to 7 days in advance. | High (P1) | Pass: Reservation confirmed, token returned. Fail: Double-booking allowed or slot > 2 hours. |
| FR-002 | Calibration Verification | The system shall verify the calibration status of selected equipment before confirming a reservation. | High (P1) | Pass: Reservation confirmed only when calibration is valid. Fail: Confirms expired calibration. |
| FR-003 | Double-Booking Prevention | The system shall prevent two students from reserving the same equipment for overlapping time slots using database lock isolation. | High (P1) | Pass: Overlapping request rejected (409) with alternatives. Fail: Both confirmed. |
| FR-004 | Equipment Return & Late Tracking | The system shall allow students to return reserved equipment and automatically record whether the equipment was returned after the slot end time. | Medium (P2) | Pass: Return timestamp saved; is_late flag set correctly. Fail: Return unrecorded or wrong late state. |
| FR-005 | Technician Status & Calibration Update | The system shall allow lab technicians to update equipment availability status and calibration expiration dates. | High (P1) | Pass: Technician updates reflected immediately. Fail: Unauthorized user updates or state unsaved. |
| FR-006 | Authentication & Role-Based Access Control | The system shall authenticate users via JWT and enforce role-based permissions separating Student and Technician interfaces. | High (P1) | Pass: JWT issued; 401/403 enforced on unauthorized routes. Fail: Privilege escalation. |
| FR-007 | Equipment Search & Filtering | The system shall allow users to search equipment by keyword, filter by laboratory department, availability, and calibration status. | Medium (P2) | Pass: Filtered result set matches query exactly. Fail: Unfiltered/incorrect results returned. |
| FR-008 | Student Reservation Management | The system shall allow students to view their active/past reservations and cancel upcoming reservations. | Medium (P2) | Pass: Student views own reservations; cancellation frees slot. Fail: Cancelled slot remains locked. |
| FR-009 | Technician Reservation Overview | The system shall allow lab technicians to view all active, past, and late-returned reservations across all equipment. | Medium (P2) | Pass: Global reservation list populated with filter options. Fail: Student accesses global view. |
| FR-010 | Lifecycle Notification Service | The system shall dispatch confirmation, cancellation, and late-return alert events to an external notification adapter. | Low (P3) | Pass: Event emitted without blocking core transaction. Fail: Notification failure rolls back reservation. |

**4. UML Use Case Modeling ****&**** Detailed Specifications**

The system architecture encompasses 15 core use cases grouped by functional domain: Discovery/Search (UC-01 to UC-02), Student Reservation (UC-03 to UC-08), Return Management (UC-09 to UC-11), and Technician Administration (UC-12 to UC-15).

**4.1 Detailed Flow Specification: UC-05 Check Slot Availability**

• Primary Actor: Student
• Secondary Actor: Lab Technician
• Precondition: Student is authenticated and has access to the Smart Lab Equipment & Slot Reservation Portal. The selected equipment exists in the system and its reservation information is available.
• Postcondition (Success): The system displays whether the selected equipment and requested time slot are available for reservation.
• Postcondition (Failure): The system informs the student that the selected slot is unavailable and displays alternative available slots, if any.

Main Success Scenario:
1. Student selects 'Check Slot Availability' from the equipment reservation interface.
2. System displays the selected equipment and available date and time slots.
3. Student selects the required date and time slot.
4. System retrieves existing reservations for the selected equipment.
5. System checks whether another reservation overlaps with the requested time slot.
6. System confirms that the requested slot is available.
7. System marks the selected slot as Available.
8. System displays availability status to the student.
9. Student can proceed with the 'Reserve Equipment Slot' use case.
10. Use case ends successfully.

Alternate Flow (5a. Selected Slot Is Already Reserved):
5a1. System detects an existing reservation overlapping with the selected time slot.
5a2. System marks selected slot as Unavailable.
5a3. System informs student that the selected equipment is already reserved for requested time.
5a4. System displays other available time slots for the selected equipment.
5a5. Student selects an alternative available slot.
5a6. System checks availability of newly selected slot.
5a7. If available, system displays slot as Available and student proceeds with reservation.
5a8. If student does not select another slot, use case ends without creating a reservation.

**5. Non-Functional Requirements (NFR-001 to NFR-006)**

| **NFR ID** | **Quality Category** | **Specification ****&**** Measurable Metric** | **Target SLA / Acceptance Metric** |
| --- | --- | --- | --- |
| NFR-001 | Performance & Concurrency | The system shall process concurrent slot reservation requests within 200 ms with strict database lock isolation to prevent race conditions under peak load. | p95 < 200 ms; 0 race conditions under 100 concurrent requests |
| NFR-002 | Data Reliability & Durability | The system shall preserve confirmed reservation records and tokens without data loss when transactions complete successfully, remaining persistent across restarts. | 100% durability; records retrievable post system reboot |
| NFR-003 | Security & Access Isolation | The system shall enforce JWT-based authorization, sanitization against SQL injection/XSS, and RBAC isolation preventing students from accessing technician routes. | Zero unauthorized API accesses; 100% parameterized queries |
| NFR-004 | Usability & Workflow Efficiency | The system UI shall enable authenticated students to complete a valid slot reservation in 5 steps or fewer. | 100% of tested users complete booking in <= 5 steps |
| NFR-005 | System Availability & Uptime | The API service layer shall maintain 99.5% operational uptime during standard academic laboratory operational hours. | 99.5% uptime during lab operating schedule |
| NFR-006 | Maintainability & Test Coverage | The repository codebase shall maintain automated unit and integration test coverage exceeding 80% across core reservation logic. | >= 80% code coverage reported by CI runner |