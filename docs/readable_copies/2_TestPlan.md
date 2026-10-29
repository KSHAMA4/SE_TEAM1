**SOFTWARE TEST PLAN ****&**** QUALITY ASSURANCE SPECIFICATION**

*Smart Lab Equipment Slot Reservation Portal - Verification, Validation, Security **&** Traceability Matrix*
*Standards Compliance: IEEE 829-2008 Standard for Software Test Documentation | Deliverables Part-1 Baseline*

| **Project Name** | Smart Lab Equipment Slot Reservation Portal |
| --- | --- |
| **Course ****&**** Team** | Software Engineering Lab-01 (UE24CS341A) │ Team No: 001 │ Date: 27 October 2026 |
| **Specification Document** | 2_TestPlan_SmartLabEquipment.docx (IEEE 829-2008) |
| **Document Version** | 1.0 - Official Baseline |
| **Repository** | https://github.com/LakshanyaaN/Smart-Lab-Equipment-Slot-Reservation-Portal |
| **QA Engineering Team** | N. Lakshanyaa (PES1UG24AM169) - Test Lead & QA Architecture Mohammed Arfan Asgar (PES1UG24AM163) - Security & Concurrency Testing Kshama (PES1UG24AM142) - Functional & Calibration Validation Manjunatha H J (PES1UG24AM157) - API & Database Integration Testing |

**1. Introduction ****&**** Scope**

**1.1 Purpose**

This plan defines how the Smart Lab Equipment Slot Reservation Portal will be tested so that every requirement in the SRS (FR-001 to FR-010, NFR-001 to NFR-006) is verified before the Sprint 1 and Sprint 2 releases. It establishes complete traceability between requirements, test cases, and automated test scripts execution.

**1.2 Scope**

• In Scope: Slot reservation, calibration verification, double-booking prevention, equipment return and late-return logging, technician equipment management, authentication and RBAC, search/filtering, notification events, latency under concurrency, data durability, security sanitization.
• Out of Scope: Payment processing gateways, native mobile application wrappers, physical IoT hardware sensor integration, load testing beyond the NFR-001 concurrency targets.

**2. Test Strategy ****&**** Hierarchy**

The project employs a multi-tier testing strategy combining automated unit, integration, performance, security, and manual end-to-end usability walkthroughs:

| **Testing Tier** | **Verification Goal ****&**** Scope** | **Tooling / Framework** | **Owner** |
| --- | --- | --- | --- |
| Unit Testing | Validate isolated business rules (2-hour duration limit, 7-day advance window, late-return evaluation, calibration status check). | Jest | Module Developer |
| Integration Testing | Validate REST API controllers against live PostgreSQL test container (ACID transactions, foreign key cascades, exclusion lock constraints). | Jest, Supertest, PostgreSQL | Backend Leads |
| System / E2E Testing | Validate end-to-end student and technician workflows in client UI. | Playwright / Cypress | QA Lead |
| Concurrency / Load | Validate race condition prevention and 200 ms latency target under 100 concurrent reservation requests. | autocannon, k6, Custom Race Script | Backend Lead |
| Security Assessment | Validate RBAC isolation, JWT verification, SQL injection parameterization, and XSS sanitization. | Manual Checklist, npm audit, OWASP ZAP | Security Lead |
| Usability Testing | Verify that authenticated students complete slot booking in 5 steps or fewer. | User Walkthrough (3 users) | Frontend Lead |

**3. Requirements Traceability Matrix (RTM)**

The RTM establishes bidirectional mapping between Functional/Non-Functional Requirements and Test Cases TC-001 to TC-027.

| **Req ID** | **Requirement Description** | **Mapped Test Case IDs** | **Status** |
| --- | --- | --- | --- |
| FR-001 | Slot Reservation Engine | TC-001, TC-002, TC-003, TC-004, TC-026 | Verified |
| FR-002 | Calibration Verification | TC-005, TC-006 | Verified |
| FR-003 | Double-Booking Prevention | TC-007, TC-008 | Verified |
| FR-004 | Equipment Return & Late Tracking | TC-012, TC-013, TC-014 | Verified |
| FR-005 | Technician Equipment Management | TC-009, TC-010, TC-011 | Verified |
| FR-006 | Authentication & RBAC | TC-015, TC-016 | Verified |
| FR-007 | Equipment Search & Filtering | TC-017 | Verified |
| FR-008 | Student Reservation Management | TC-018, TC-019 | Verified |
| FR-009 | Technician Global Overview | TC-020 | Verified |
| FR-010 | Lifecycle Notifications | TC-021 | Verified |
| NFR-001 | Performance & Concurrency (200ms) | TC-022, TC-023 | Verified |
| NFR-002 | Data Durability & Reliability | TC-024 | Verified |
| NFR-003 | Security & Access Isolation | TC-016, TC-025 | Verified |
| NFR-004 | Usability (<= 5 steps) | TC-027 | Verified |

**4. Detailed Test Cases (TC-001 through TC-027)**

| **ID** | **Req** | **Test Description** | **Execution Steps** | **Expected Result** | **Pri** | **Type** |
| --- | --- | --- | --- | --- | --- | --- |
| TC-001 | FR-001 | Reserve a valid 2-hour slot | Login student1; reserve E1 tomorrow 14:00-16:00 | Reservation CONFIRMED, token returned | High | Auto |
| TC-002 | FR-001 | Reject slot > 2 hours | Reserve E1 for 121 minutes | Rejected (400 Bad Request) | High | Auto |
| TC-003 | FR-001 | Booking window boundary | Reserve at 7 days + 1 min, and in past | Both rejected; 7 days exact accepted | High | Auto |
| TC-005 | FR-002 | Reject expired calibration | Reserve E2 (expired calibration) | Rejected (422 Unprocessable Entity) | High | Auto |
| TC-007 | FR-003 | Overlapping slot request | student1 books E1 10:00-12:00; student2 requests 11:00-13:00 | Second request rejected (409 Conflict) | High | Auto |
| TC-008 | FR-003 | Simultaneous race condition | 100 concurrent requests for same slot | Exactly 1 confirmed; 99 rejected (409) | High | Auto |
| TC-009 | FR-005 | Technician update availability | tech1 sets E1 to MAINTENANCE | Status saved; slot no longer reservable | High | Auto |
| TC-011 | FR-005 | Unauthorized status update | student1 calls PUT /api/equipment/:id | HTTP 403 Forbidden; no change saved | High | Auto |
| TC-013 | FR-004 | Late return identification | Student returns after slot end | is_late = true, status LATE_RETURNED | Medium | Auto |
| TC-022 | NFR-001 | Latency under peak load | Run 200 requests (50 concurrent) | p95 latency <= 200 ms; 0 errors | High | Auto |
| TC-024 | NFR-002 | Data durability post-restart | Reserve slot, restart API & DB | Reservation & token remain retrievable | High | Manual |
| TC-027 | NFR-004 | Usability step verification | 3 users execute booking flow | Completed in 5 steps or fewer | Medium | Manual |