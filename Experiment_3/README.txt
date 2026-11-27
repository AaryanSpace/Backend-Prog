VENUEVISTA - BACKEND PROGRAMMING EXPERIMENT 3

FINAL DATABASE LOGIC
====================

1. Experiment 2 database is the ORIGINAL / PRIMARY database:
   ../Experiment_2/database.json

2. Experiment 3 reads the Experiment 2 database using its path.

3. NEW CUSTOMER / NEW BOOKING:
   Saved in Experiment_2/database.json.

4. NORMAL UPDATE:
   Same Customer ID.
   Same Booking Request ID.
   Updated record is saved directly in Experiment_2/database.json.

5. CREATE REVISED BOOKING:
   Same Customer ID.
   NEW Booking Request ID.
   Revised request is saved in Experiment_3/database.json.
   The original Experiment 2 booking is not changed when the revision is created.

6. ADMIN APPROVES REVISED BOOKING:
   The approved revised booking is copied/promoted into Experiment_2/database.json.
   The original booking is marked Superseded.
   The revised record remains in Experiment_3/database.json as revision history.

7. ADMIN REJECTS REVISED BOOKING:
   It remains only in Experiment_3/database.json with Rejected status.

8. EXTRA EXPERIMENT 3 KEY:
   dateOfBirth
   This field is included in new bookings, updates, revised bookings and admin views.

9. CUSTOMER ID:
   Customer ID identifies the person and remains the same for revisions.
   New customers receive a new unused VV### ID.

10. BOOKING REQUEST ID:
    Each booking/revision has its own unique numeric request ID.

TECHNICAL FEATURES
==================
- Express.js
- Express Router mounted at /api
- JSON middleware
- URL-encoded middleware
- CORS middleware
- Request logging middleware
- CRUD operations
- Booking validation
- Availability checking
- Customer ID management
- Admin approval/rejection
- Revised booking workflow
- Separate Experiment 2 and Experiment 3 storage

RUN
===
Open terminal inside Experiment_3 and run:

npm install
npm start

Then open:
http://localhost:3000

IMPORTANT
=========
Do not copy database.json from Experiment 2 into Experiment 3.
Experiment 3 has its own database.json for revised-booking data.
The server uses the path ../Experiment_2/database.json for the primary data.
