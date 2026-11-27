const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB = path.join(__dirname, "database.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function readDB() {
    if (!fs.existsSync(DB)) return [];

    try {
        return JSON.parse(fs.readFileSync(DB, "utf8") || "[]");
    } catch {
        return [];
    }
}

function saveDB(data) {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}


/* ================================
   CREATE BOOKING
================================ */

app.post("/api/book-hall", (req, res) => {

    try {

        const data = readDB();

        const phone = String(req.body.phone || "").trim();

        /* SAME CUSTOMER = SAME USER ID */

        let customer = data.find(
            b => String(b.phone || "") === phone
        );

        let userId;

        if (customer) {

            userId = customer.userId;

        } else {

            const users = data
                .map(b => parseInt(String(b.userId || "").replace(/\D/g, "")))
                .filter(n => !isNaN(n));

            const nextUser =
                users.length ? Math.max(...users) + 1 : 1;

            userId = "VV" + String(nextUser).padStart(3, "0");
        }


        /* NEXT REQUEST ID */

        const requestIds = data
            .map(b => Number(b.reqid))
            .filter(n => !isNaN(n));

        const reqid =
            requestIds.length
                ? Math.max(...requestIds) + 1
                : 1001;


        const booking = {

            reqid,

            userId,

            customerName: req.body.customerName || "",

            phone,

            hallDimension: req.body.hallDimension || "",

            tables: Number(req.body.tables) || 0,

            chairsPerTable:
                Number(req.body.chairsPerTable) || 0,

            eventDate: req.body.eventDate || "",

            eventTime:
                req.body.eventTime ||
                req.body.time ||
                "",

            tableShape:
                req.body.tableShape || "",

            tableDesign:
                req.body.tableDesign || "",

            adminApproval: "Pending",

            adminRemarks:
                "Your booking request has been received and is currently under review by our venue team."

        };


        data.push(booking);

        saveDB(data);

        res.json({
            success: true,
            booking
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to save booking."
        });

    }

});


/* ================================
   GET ALL BOOKINGS
================================ */

app.get("/api/bookings", (req, res) => {

    res.json({
        success: true,
        bookings: readDB()
    });

});


/* ================================
   UPDATE ONE BOOKING
================================ */

app.patch("/api/bookings/:id", (req, res) => {

    try {

        const data = readDB();

        const requestId = Number(req.params.id);

        /* FIND ONLY THIS REQUEST */

        const booking = data.find(
            b => Number(b.reqid) === requestId
        );


        if (!booking) {

            return res.status(404).json({

                success: false,

                message: "Booking request not found."

            });

        }


        const decision =
            req.body.adminApproval || "Pending";


        /* ============================
           APPROVED
        ============================ */

        if (decision === "Approved") {

            booking.adminApproval = "Approved";

            booking.adminRemarks =
                req.body.adminRemarks?.trim() ||

                "Welcome to VenueVista! Your booking has been approved. Please arrive 15 minutes before your scheduled booking time so our team can prepare the venue for you. If you require any additional venue services, please contact our team in advance. We look forward to welcoming you.";

        }


        /* ============================
           REJECTED
        ============================ */

        else if (decision === "Rejected") {

            booking.adminApproval = "Rejected";

            booking.adminRemarks =
                req.body.adminRemarks?.trim() ||

                "We’re sorry, but we’re unable to approve your booking for the selected date, time, or seating arrangement. Please try another date, time, or layout. We appreciate your understanding and would be happy to assist you with an alternative arrangement.";

        }


        /* ============================
           PENDING
        ============================ */

        else {

            booking.adminApproval = "Pending";

            booking.adminRemarks =
                req.body.adminRemarks?.trim() ||

                "Your booking request has been received and is currently under review by our venue team. We’ll update you once a decision has been made.";

        }


        saveDB(data);


        res.json({

            success: true,

            booking

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to update booking."

        });

    }

});


/* ================================
   SERVER
================================ */

app.listen(PORT, () => {

    console.log(
        `VenueVista running at http://localhost:${PORT}`
    );

    console.log(
        `Admin: http://localhost:${PORT}/admin.html`
    );

});