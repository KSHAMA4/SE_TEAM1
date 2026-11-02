\# Issue #7 - Real-time Slot Availability Inquiry



\*\*Implemented by:\*\* Mohammed Arfan Asgar



\## Summary

Provides real-time slot availability checks for equipment and suggests alternative time windows when requested slots are unavailable.



\## Implementation

\- GET /api/v1/reservations/availability/:id

\- Retrieves existing reservations for the selected equipment and date.

\- Detects overlapping time slots.

\- Generates alternative available time windows.

\- Returns equipment details, booked slots and available alternatives.



\## Implementation Files

\- server/src/routes/reservationRoutes.js

\- server/src/controllers/reservationController.js

\- server/src/services/reservationService.js



\## Note

The Issue #7 implementation was previously merged into main. This document provides a dedicated record of the implementation for evaluation and traceability.

