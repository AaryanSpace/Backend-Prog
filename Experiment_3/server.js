const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const router = express.Router();
const PORT = 3000;

// ============================================================
// DATABASE PATHS
// ============================================================
// Experiment 2 is the ORIGINAL / PRIMARY database.
// Experiment 3 reads and writes it for normal CRUD operations.
const EXP2_DB = path.join(
    __dirname,
    "..",
    "Experiment_2",
    "database.json"
);

// Experiment 3 stores ONLY revised booking requests here.
const EXP3_DB = path.join(
    __dirname,
    "database.json"
);

const ID_REGISTRY = path.join(
    __dirname,
    "customer_ids.json"
);

const CUSTOMER_REGISTRY = path.join(
    __dirname,
    "customers.json"
);

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware (Experiment 3 requirement)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`
    );
    next();
});

// ============================================================
// FILE HELPERS
// ============================================================
function readJSON(file, fallback = []) {
    if (!fs.existsSync(file)) {
        return fallback;
    }

    try {
        const raw = fs.readFileSync(file, "utf8").trim();
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        console.error(`Could not read ${file}: ${error.message}`);
        return fallback;
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

function ensureExperiment2Database() {
    if (!fs.existsSync(EXP2_DB)) {
        throw new Error(
            `Experiment 2 database not found. Expected path:\n${EXP2_DB}`
        );
    }
}

function readExp2Bookings() {
    ensureExperiment2Database();

    const data = readJSON(EXP2_DB, []);

    if (!Array.isArray(data)) {
        throw new Error("Experiment 2 database.json must contain a JSON array.");
    }

    return data;
}

function writeExp2Bookings(data) {
    ensureExperiment2Database();
    writeJSON(EXP2_DB, data);
}

function readExp3Bookings() {
    const data = readJSON(EXP3_DB, []);

    if (!Array.isArray(data)) {
        return [];
    }

    return data;
}

function writeExp3Bookings(data) {
    writeJSON(EXP3_DB, data);
}

// Make sure Experiment 3's own database exists.
if (!fs.existsSync(EXP3_DB)) {
    writeExp3Bookings([]);
}

// ============================================================
// CUSTOMER REGISTRY / ID HELPERS
// ============================================================
function readCustomerIds() {
    const data = readJSON(ID_REGISTRY, []);

    if (Array.isArray(data)) {
        return data.map(String);
    }

    if (data && Array.isArray(data.usedIds)) {
        return data.usedIds.map(String);
    }

    return [];
}

function writeCustomerIds(ids) {
    writeJSON(
        ID_REGISTRY,
        [...new Set(ids.map(String))]
    );
}

function readCustomers() {
    const data = readJSON(CUSTOMER_REGISTRY, []);
    return Array.isArray(data) ? data : [];
}

function writeCustomers(data) {
    writeJSON(CUSTOMER_REGISTRY, data);
}

function allKnownBookings() {
    return [
        ...readExp2Bookings(),
        ...readExp3Bookings()
    ];
}

function syncCustomerRegistry() {
    const customers = readCustomers();
    const bookings = allKnownBookings();
    let changed = false;

    for (const booking of bookings) {
        const phone = String(booking.phone || "").trim();
        const userId = String(booking.userId || "").trim();

        if (!phone || !userId) continue;

        const existing = customers.find(
            c => String(c.phone || "").trim() === phone
        );

        if (!existing) {
            customers.push({
                userId,
                customerName: booking.customerName || "",
                phone,
                email: booking.email || "",
                dateOfBirth: booking.dateOfBirth || "",
                createdAt:
                    booking.createdAt || new Date().toISOString()
            });
            changed = true;
        } else {
            if (existing.userId !== userId) {
                existing.userId = userId;
                changed = true;
            }

            if (booking.customerName &&
                existing.customerName !== booking.customerName) {
                existing.customerName = booking.customerName;
                changed = true;
            }

            if (booking.email !== undefined &&
                existing.email !== (booking.email || "")) {
                existing.email = booking.email || "";
                changed = true;
            }

            if (booking.dateOfBirth &&
                existing.dateOfBirth !== booking.dateOfBirth) {
                existing.dateOfBirth = booking.dateOfBirth;
                changed = true;
            }
        }
    }

    if (changed) {
        writeCustomers(customers);
    }

    return customers;
}

function generateNextCustomerId() {
    const used = new Set([
        ...readCustomerIds(),
        ...readCustomers().map(c => String(c.userId || "")),
        ...allKnownBookings().map(b => String(b.userId || ""))
    ]);

    let max = 0;

    for (const id of used) {
        const match = /^VV(\d+)$/.exec(id);
        if (match) {
            max = Math.max(max, Number(match[1]));
        }
    }

    let number = max + 1;
    let id = `VV${String(number).padStart(3, "0")}`;

    while (used.has(id)) {
        number++;
        id = `VV${String(number).padStart(3, "0")}`;
    }

    used.add(id);
    writeCustomerIds([...used]);

    return id;
}

function getOrCreateCustomerId(phone, customerName, email, dateOfBirth) {
    const customers = syncCustomerRegistry();
    const normalizedPhone = String(phone || "").trim();

    const existing = customers.find(
        c => String(c.phone || "").trim() === normalizedPhone
    );

    if (existing) {
        existing.customerName = customerName || existing.customerName;
        existing.email = email || existing.email || "";
        existing.dateOfBirth =
            dateOfBirth || existing.dateOfBirth || "";
        writeCustomers(customers);
        return existing.userId;
    }

    const userId = generateNextCustomerId();

    customers.push({
        userId,
        customerName,
        phone: normalizedPhone,
        email: email || "",
        dateOfBirth: dateOfBirth || "",
        createdAt: new Date().toISOString()
    });

    writeCustomers(customers);
    return userId;
}

function updateCustomerRegistry(booking) {
    const customers = readCustomers();

    const existing = customers.find(
        c => String(c.userId) === String(booking.userId)
    );

    if (existing) {
        existing.customerName = booking.customerName || existing.customerName;
        existing.phone = booking.phone || existing.phone;
        existing.email = booking.email || existing.email || "";
        existing.dateOfBirth =
            booking.dateOfBirth || existing.dateOfBirth || "";
    } else {
        customers.push({
            userId: String(booking.userId),
            customerName: booking.customerName || "",
            phone: booking.phone || "",
            email: booking.email || "",
            dateOfBirth: booking.dateOfBirth || "",
            createdAt:
                booking.createdAt || new Date().toISOString()
        });
    }

    writeCustomers(customers);
}

// ============================================================
// REQUEST ID
// ============================================================
function normalizeReqId(value) {
    const number = Number(
        String(value ?? "")
            .trim()
            .replace(/^REQ-/i, "")
    );

    return Number.isInteger(number) ? number : null;
}

function generateNextReqId() {
    const ids = allKnownBookings()
        .map(b => Number(b.reqid))
        .filter(Number.isFinite);

    return ids.length
        ? Math.max(...ids) + 1
        : 1001;
}

// ============================================================
// BOOKING VALIDATION
// ============================================================
function hallCapacity(hall) {
    if (hall === "600x400") return 12;
    if (hall === "800x600") return 24;
    if (hall === "1000x700") return 40;
    return 0;
}

function chairLimit(shape) {
    if (shape === "Square") return 8;
    if (shape === "Round") return 12;
    if (shape === "Rectangle") return 14;
    return 0;
}

function validateBooking(booking) {
    const name = String(booking.customerName || "").trim();
    const phone = String(booking.phone || "").trim();

    if (!name || name.length < 2) {
        return "Enter a valid customer name.";
    }

    if (!/^\d{10}$/.test(phone)) {
        return "Phone number must contain exactly 10 digits.";
    }

    if (
        booking.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(booking.email))
    ) {
        return "Enter a valid email address.";
    }

    if (booking.dateOfBirth) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(booking.dateOfBirth))) {
            return "Choose a valid date of birth.";
        }

        const dob = new Date(`${booking.dateOfBirth}T00:00:00`);
        if (Number.isNaN(dob.getTime()) || dob > new Date()) {
            return "Date of birth cannot be in the future.";
        }
    }

    const tables = Number(booking.tables);
    const chairs = Number(booking.chairsPerTable);

    if (!Number.isInteger(tables) || tables < 1) {
        return "Number of tables must be at least 1.";
    }

    const capacity = hallCapacity(booking.hallDimension);

    if (!capacity) {
        return "Choose a valid hall dimension.";
    }

    if (tables > capacity) {
        return `This hall supports a maximum of ${capacity} tables.`;
    }

    if (!Number.isInteger(chairs) || chairs < 1) {
        return "Chairs per table must be at least 1.";
    }

    const maxChairs = chairLimit(booking.tableShape);

    if (!maxChairs) {
        return "Choose a valid table shape.";
    }

    if (chairs > maxChairs) {
        return `${booking.tableShape} tables support up to ${maxChairs} chairs.`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(booking.eventDate || ""))) {
        return "Choose a valid event date.";
    }

    if (!/^\d{2}:\d{2}$/.test(String(booking.eventTime || ""))) {
        return "Choose a valid event time.";
    }

    const selected = new Date(
        `${booking.eventDate}T${booking.eventTime}`
    );

    if (Number.isNaN(selected.getTime())) {
        return "Choose a valid event date and time.";
    }

    if (selected.getTime() <= Date.now()) {
        return "Event date and time must be in the future.";
    }

    return null;
}

function isConflict(bookings, booking, ignoredIds = []) {
    const ignored = new Set(
        (Array.isArray(ignoredIds) ? ignoredIds : [ignoredIds])
            .map(Number)
    );

    return bookings.some(existing => {
        if (ignored.has(Number(existing.reqid))) return false;
        if (existing.adminApproval === "Rejected") return false;
        if (existing.bookingState === "Superseded") return false;

        return (
            existing.eventDate === booking.eventDate &&
            existing.eventTime === booking.eventTime &&
            existing.hallDimension === booking.hallDimension
        );
    });
}

function defaultRemarks(status) {
    if (status === "Approved") {
        return "Welcome to VenueVista! Your booking has been approved. Please arrive 15 minutes before your scheduled booking time.";
    }

    if (status === "Rejected") {
        return "We’re sorry, but we’re unable to approve this booking for the selected date, time, or seating arrangement. Please try another date, time, or layout.";
    }

    return "Your booking request has been received and is currently under review by our venue team.";
}

function buildBooking(payload, existing = null, forcedReqId = null) {
    const now = new Date().toISOString();

    return {
        ...(existing || {}),
        reqid:
            forcedReqId !== null
                ? forcedReqId
                : Number(payload.reqid ?? existing?.reqid ?? generateNextReqId()),
        userId:
            existing?.userId ?? payload.userId,
        customerName:
            String(payload.customerName ?? existing?.customerName ?? "").trim(),
        phone:
            String(payload.phone ?? existing?.phone ?? "").trim(),
        email:
            String(payload.email ?? existing?.email ?? "").trim(),
        dateOfBirth:
            String(payload.dateOfBirth ?? existing?.dateOfBirth ?? "").trim(),
        hallDimension:
            String(payload.hallDimension ?? existing?.hallDimension ?? ""),
        tables:
            Number(payload.tables ?? existing?.tables ?? 0),
        chairsPerTable:
            Number(payload.chairsPerTable ?? existing?.chairsPerTable ?? 0),
        eventDate:
            String(payload.eventDate ?? existing?.eventDate ?? ""),
        eventTime:
            String(payload.eventTime ?? existing?.eventTime ?? ""),
        tableShape:
            String(payload.tableShape ?? existing?.tableShape ?? ""),
        tableDesign:
            String(payload.tableDesign ?? existing?.tableDesign ?? ""),
        adminApproval:
            payload.adminApproval ?? existing?.adminApproval ?? "Pending",
        adminRemarks:
            payload.adminRemarks ?? existing?.adminRemarks ?? defaultRemarks("Pending"),
        bookingState:
            payload.bookingState ?? existing?.bookingState ?? "Active",
        revisionOf:
            payload.revisionOf ?? existing?.revisionOf ?? null,
        supersededBy:
            payload.supersededBy ?? existing?.supersededBy ?? null,
        promotedToExperiment2:
            payload.promotedToExperiment2 ?? existing?.promotedToExperiment2 ?? false,
        createdAt:
            existing?.createdAt ?? payload.createdAt ?? now,
        updatedAt: now
    };
}

// ============================================================
// LOOKUPS
// ============================================================
function findExp2Booking(reqid) {
    const data = readExp2Bookings();
    const index = data.findIndex(
        b => Number(b.reqid) === Number(reqid)
    );

    return index === -1
        ? null
        : { data, index, booking: data[index], source: "experiment2" };
}

function findExp3Booking(reqid) {
    const data = readExp3Bookings();
    const index = data.findIndex(
        b => Number(b.reqid) === Number(reqid)
    );

    return index === -1
        ? null
        : { data, index, booking: data[index], source: "experiment3" };
}

function findBooking(reqid) {
    return findExp2Booking(reqid) || findExp3Booking(reqid);
}

function sameCustomer(a, b) {
    return String(a) === String(b);
}

// Current booking view: Experiment 2 is authoritative after a
// revised booking has been approved and promoted into Experiment 2.
function getVisibleBookings() {
    const exp2 = readExp2Bookings();
    const exp3 = readExp3Bookings();

    // Admin ALTER records replace the displayed version of the same
    // Experiment 2 booking, while the original Experiment 2 record
    // remains untouched until the alteration is approved.
    const alteredByReqId = new Map();

    for (const record of exp3) {
        if (record.alteredFrom !== undefined && record.alteredFrom !== null) {
            alteredByReqId.set(Number(record.alteredFrom), record);
        }
    }

    const visiblePrimary = exp2.map(booking =>
        alteredByReqId.get(Number(booking.reqid)) || booking
    );

    const exp2Ids = new Set(exp2.map(b => Number(b.reqid)));

    const pendingOrUnpromotedRevisions = exp3.filter(
        b =>
            b.revisionOf !== null &&
            b.revisionOf !== undefined &&
            !b.promotedToExperiment2 &&
            !exp2Ids.has(Number(b.reqid))
    );

    return [...visiblePrimary, ...pendingOrUnpromotedRevisions];
}

function findAlterationForReqId(reqid) {
    const data = readExp3Bookings();
    const index = data.findIndex(
        b => Number(b.alteredFrom) === Number(reqid)
    );

    return index === -1
        ? null
        : { data, index, booking: data[index], source: "experiment3-alteration" };
}

// ============================================================
// SYSTEM STATUS
// ============================================================
router.get("/system-status", (req, res) => {
    try {
        res.json({
            success: true,
            experiment2Database: EXP2_DB,
            experiment2Found: fs.existsSync(EXP2_DB),
            experiment3Database: EXP3_DB,
            experiment3Found: fs.existsSync(EXP3_DB),
            rule:
                "New customers and normal updates are stored in Experiment 2. Revised bookings are stored in Experiment 3 until approved."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================================
// GET ALL BOOKINGS
// ============================================================
router.get("/bookings", (req, res) => {
    try {
        const bookings = getVisibleBookings();
        syncCustomerRegistry();

        res.json({
            success: true,
            bookings,
            experiment2Bookings: readExp2Bookings(),
            experiment3Revisions: readExp3Bookings()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================================
// GET ONE BOOKING
// ============================================================
router.get("/bookings/:id", (req, res) => {
    try {
        const reqid = normalizeReqId(req.params.id);

        if (reqid === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking request ID."
            });
        }

        const result = findBooking(reqid);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        res.json({
            success: true,
            booking: result.booking,
            storedIn: result.source
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================================
// GET CUSTOMERS
// ============================================================
router.get("/customers", (req, res) => {
    try {
        res.json({
            success: true,
            customers: syncCustomerRegistry()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/customers/:id", (req, res) => {
    try {
        const query = String(req.params.id).trim().toLowerCase();
        const bookings = getVisibleBookings();

        const booking = bookings.find(b =>
            String(b.userId || "").toLowerCase() === query ||
            String(b.phone || "") === query ||
            String(b.reqid || "") === query
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Customer or booking not found."
            });
        }

        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================================
// AVAILABILITY
// ============================================================
router.get("/availability", (req, res) => {
    try {
        const {
            eventDate,
            eventTime,
            hallDimension,
            ignoreReqId
        } = req.query;

        const bookings = getVisibleBookings();
        const conflict = isConflict(
            bookings,
            { eventDate, eventTime, hallDimension },
            ignoreReqId
        );

        res.json({
            success: true,
            available: !conflict,
            message: conflict
                ? "This hall is already booked for that date and time."
                : "The selected slot is available."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================================
// CREATE NEW CUSTOMER / BOOKING
// NEW CUSTOMERS ARE ALWAYS SAVED IN EXPERIMENT 2.
// ============================================================
function createBookingHandler(req, res) {
    try {
        const payload = req.body || {};
        const error = validateBooking(payload);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const bookings = getVisibleBookings();

        if (isConflict(bookings, payload)) {
            return res.status(409).json({
                success: false,
                message:
                    "This hall is already booked for the selected date and time."
            });
        }

        const userId = getOrCreateCustomerId(
            payload.phone,
            payload.customerName,
            payload.email,
            payload.dateOfBirth
        );

        const booking = buildBooking(
            {
                ...payload,
                userId,
                adminApproval: "Pending",
                adminRemarks: defaultRemarks("Pending"),
                bookingState: "Active"
            },
            null,
            generateNextReqId()
        );

        const exp2 = readExp2Bookings();
        exp2.push(booking);
        writeExp2Bookings(exp2);
        updateCustomerRegistry(booking);

        res.status(201).json({
            success: true,
            message:
                `New booking #${booking.reqid} created in Experiment_2/database.json.`,
            booking
        });
    } catch (error) {
        console.error("CREATE BOOKING ERROR:", error);
        res.status(500).json({
            success: false,
            message: `Unable to create booking: ${error.message}`
        });
    }
}

router.post("/bookings", createBookingHandler);
router.post("/book-hall", createBookingHandler);

// ============================================================
// NORMAL UPDATE
// SAME Customer ID + SAME Request ID.
// UPDATED RECORD IS SAVED DIRECTLY TO EXPERIMENT 2.
// ============================================================
function updateBookingHandler(req, res) {
    try {
        const reqid = normalizeReqId(req.params.id || req.params.reqid);

        if (reqid === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking request ID."
            });
        }

        const result = findExp2Booking(reqid) || findExp3Booking(reqid);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Booking was not found."
            });
        }

        const current = result.booking;

        if (
            req.params.userId &&
            !sameCustomer(req.params.userId, current.userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "This booking does not belong to this customer."
            });
        }

        const record = buildBooking(
            req.body || {},
            current,
            current.reqid
        );

        // IDs stay unchanged during normal Update.
        record.userId = current.userId;
        record.reqid = current.reqid;
        record.adminApproval = "Pending";
        record.adminRemarks =
            "Your modified booking has been updated in Experiment 2 and is awaiting administrator review.";

        const error = validateBooking(record);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error
            });
        }

        const others = getVisibleBookings();

        if (isConflict(others, record, [record.reqid])) {
            return res.status(409).json({
                success: false,
                message:
                    "Another booking already uses this hall, date and time."
            });
        }

        result.data[result.index] = record;

        if (result.source === "experiment2") {
            writeExp2Bookings(result.data);
        } else {
            writeExp3Bookings(result.data);
        }

        updateCustomerRegistry(record);

        res.json({
            success: true,
            message:
                result.source === "experiment2"
                    ? `Booking #${record.reqid} updated in Experiment_2/database.json. Customer ID ${record.userId} remains unchanged.`
                    : `Revised booking #${record.reqid} updated in Experiment_3/database.json. Customer ID ${record.userId} remains unchanged.`,
            booking: record
        });
    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).json({
            success: false,
            message: `Unable to update booking: ${error.message}`
        });
    }
}

router.put("/bookings/:id", updateBookingHandler);
router.put("/customers/:userId/bookings/:reqid", updateBookingHandler);

// ============================================================
// CREATE REVISED BOOKING
// NEW Request ID + SAME Customer ID.
// SAVED ONLY IN EXPERIMENT 3 DATABASE.
// ============================================================
router.post(
    "/customers/:userId/bookings/:reqid/revise",
    (req, res) => {
        try {
            const userId = String(req.params.userId);
            const originalReqId = normalizeReqId(req.params.reqid);

            if (originalReqId === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking request ID."
                });
            }

            const originalResult = findExp2Booking(originalReqId);

            if (!originalResult) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Original booking was not found in Experiment 2."
                });
            }

            const original = originalResult.booking;

            if (!sameCustomer(userId, original.userId)) {
                return res.status(403).json({
                    success: false,
                    message: "This booking does not belong to this customer."
                });
            }

            const revised = buildBooking(
                req.body || {},
                original,
                generateNextReqId()
            );

            revised.userId = original.userId;
            revised.revisionOf = originalReqId;
            revised.supersededBy = null;
            revised.bookingState = "Active";
            revised.promotedToExperiment2 = false;
            revised.adminApproval = "Pending";
            revised.adminRemarks =
                `Revised booking request created from Booking #${originalReqId}. It is awaiting administrator review.`;

            const error = validateBooking(revised);

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error
                });
            }

            if (
                isConflict(
                    getVisibleBookings(),
                    revised,
                    [originalReqId]
                )
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another booking already uses this hall, date and time."
                });
            }

            const exp3 = readExp3Bookings();
            exp3.push(revised);
            writeExp3Bookings(exp3);
            updateCustomerRegistry(revised);

            res.status(201).json({
                success: true,
                message:
                    `Revised booking #${revised.reqid} created in Experiment_3/database.json. Customer ID ${revised.userId} remains unchanged.`,
                booking: revised
            });
        } catch (error) {
            console.error("REVISED BOOKING ERROR:", error);
            res.status(500).json({
                success: false,
                message:
                    `Unable to create revised booking: ${error.message}`
            });
        }
    }
);

// ============================================================
// ADMIN ALTER BOOKING / ADD NEW ATTRIBUTE
//
// The original Experiment 2 booking is NOT modified here.
// A copy is created in Experiment 3 with alteredFrom pointing
// to the original request ID. Admin can add a completely new
// JSON attribute/key and value from the Admin page.
// ============================================================
router.post("/bookings/:id/alter", (req, res) => {
    try {
        const reqid = normalizeReqId(req.params.id);

        if (reqid === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking request ID."
            });
        }

        const originalResult = findExp2Booking(reqid);
        const revisionSourceResult = originalResult ? null : findExp3Booking(reqid);

        if (!originalResult && !revisionSourceResult) {
            return res.status(404).json({
                success: false,
                message: "Booking was not found."
            });
        }

        const sourceBooking = originalResult
            ? originalResult.booking
            : revisionSourceResult.booking;

        const attributeName = String(req.body.attributeName || "").trim();
        const attributeValue = req.body.attributeValue;

        if (!attributeName) {
            return res.status(400).json({
                success: false,
                message: "Enter a name for the new attribute."
            });
        }

        // Only safe JSON object keys are allowed.
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(attributeName)) {
            return res.status(400).json({
                success: false,
                message: "Attribute name can contain letters, numbers and underscore, and cannot start with a number."
            });
        }

        const protectedKeys = new Set([
            "__proto__", "constructor", "prototype"
        ]);

        if (protectedKeys.has(attributeName.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "This attribute name is not allowed."
            });
        }

        const existingAlteration = findAlterationForReqId(reqid);
        let altered;

        if (existingAlteration) {
            altered = { ...existingAlteration.booking };
            altered[attributeName] = attributeValue ?? "";
            altered.updatedAt = new Date().toISOString();
            altered.lastAlteredAttribute = attributeName;
        } else {
            altered = {
                ...sourceBooking,
                [attributeName]: attributeValue ?? "",
                alteredFrom: reqid,
                alterationType: "Admin Alter",
                adminApproval: "Pending",
                adminRemarks: `Admin alteration created for Booking #${reqid}. New attribute: ${attributeName}. Awaiting review.`,
                alteredAt: new Date().toISOString(),
                lastAlteredAttribute: attributeName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }

        const exp3 = readExp3Bookings();

        if (existingAlteration) {
            exp3[existingAlteration.index] = altered;
        } else {
            exp3.push(altered);
        }

        writeExp3Bookings(exp3);

        res.status(201).json({
            success: true,
            message: `Attribute \"${attributeName}\" added to Booking #${reqid} in Experiment_3/database.json.`,
            booking: altered
        });
    } catch (error) {
        console.error("ADMIN ALTER ERROR:", error);
        res.status(500).json({
            success: false,
            message: `Unable to alter booking: ${error.message}`
        });
    }
});


// ============================================================
// ADMIN ALTER BOOKING / DELETE EXISTING ATTRIBUTE
//
// The original Experiment 2 booking is NOT modified here.
// The selected attribute is removed from the Experiment 3
// alteration copy. The deletion reaches Experiment 2 only
// after the Admin approves the alteration.
// ============================================================
router.post("/bookings/:id/delete-attribute", (req, res) => {
    try {
        const reqid = normalizeReqId(req.params.id);

        if (reqid === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking request ID."
            });
        }

        const attributeName = String(req.body.attributeName || "").trim();

        if (!attributeName) {
            return res.status(400).json({
                success: false,
                message: "Select an attribute to delete."
            });
        }

        // Fields required for identifying and processing a booking
        // must never be deleted by the Admin.
        const protectedKeys = new Set([
            "reqid",
            "userId",
            "customerName",
            "phone",
            "adminApproval",
            "adminRemarks",
            "bookingState",
            "revisionOf",
            "supersededBy",
            "createdAt",
            "updatedAt",
            "alteredFrom",
            "alterationType",
            "alteredAt",
            "lastAlteredAttribute",
            "deletedAttribute",
            "attributeDeletion",
            "promotedToExperiment2",
            "promotedFromExperiment3"
        ]);

        if (protectedKeys.has(attributeName)) {
            return res.status(400).json({
                success: false,
                message: `The field "${attributeName}" is a protected system field and cannot be deleted.`
            });
        }

        const originalResult = findExp2Booking(reqid);
        const revisionSourceResult = originalResult
            ? null
            : findExp3Booking(reqid);

        if (!originalResult && !revisionSourceResult) {
            return res.status(404).json({
                success: false,
                message: "Booking was not found."
            });
        }

        const existingAlteration = findAlterationForReqId(reqid);

        // Always work from the latest Experiment 3 alteration if one exists.
        // Otherwise create an alteration from the source booking.
        const sourceBooking = existingAlteration
            ? existingAlteration.booking
            : (
                originalResult
                    ? originalResult.booking
                    : revisionSourceResult.booking
            );

        if (!Object.prototype.hasOwnProperty.call(sourceBooking, attributeName)) {
            return res.status(404).json({
                success: false,
                message: `The field "${attributeName}" does not exist in this booking.`
            });
        }

        const altered = { ...sourceBooking };

        // Remove the requested field from the Experiment 3 copy.
        delete altered[attributeName];

        altered.alteredFrom = reqid;
        altered.alterationType = "Admin Delete Attribute";
        altered.deletedAttribute = attributeName;
        altered.attributeDeletion = true;
        altered.adminApproval = "Pending";
        altered.adminRemarks =
            `Admin requested deletion of field "${attributeName}" from Booking #${reqid}. Awaiting administrator approval.`;
        altered.alteredAt = new Date().toISOString();
        altered.lastAlteredAttribute = attributeName;
        altered.updatedAt = new Date().toISOString();

        const exp3 = readExp3Bookings();

        if (existingAlteration) {
            exp3[existingAlteration.index] = altered;
        } else {
            exp3.push(altered);
        }

        writeExp3Bookings(exp3);

        res.status(201).json({
            success: true,
            message:
                `Field "${attributeName}" marked for deletion from Booking #${reqid}. Approve the alteration to apply it to Experiment_2/database.json.`,
            booking: altered
        });
    } catch (error) {
        console.error("ADMIN DELETE ATTRIBUTE ERROR:", error);

        res.status(500).json({
            success: false,
            message:
                `Unable to delete attribute: ${error.message}`
        });
    }
});

// Return the current admin alteration for one booking.
router.get("/bookings/:id/alter", (req, res) => {
    try {
        const reqid = normalizeReqId(req.params.id);
        if (reqid === null) {
            return res.status(400).json({ success: false, message: "Invalid booking request ID." });
        }

        const alteration = findAlterationForReqId(reqid);
        res.json({
            success: true,
            altered: Boolean(alteration),
            booking: alteration ? alteration.booking : null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================================
// ADMIN APPROVE / REJECT
// ============================================================
router.patch("/bookings/:id", (req, res) => {
    try {
        const reqid = normalizeReqId(req.params.id);

        if (reqid === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking request ID."
            });
        }

        const decision = String(
            req.body.adminApproval || "Pending"
        );

        if (![
            "Pending",
            "Approved",
            "Rejected"
        ].includes(decision)) {
            return res.status(400).json({
                success: false,
                message: "Invalid approval status."
            });
        }

        // First check whether this request is an Admin ALTER record.
        const alterationResult = findAlterationForReqId(reqid);

        if (alterationResult) {
            const alteration = alterationResult.booking;
            alteration.adminApproval = decision;
            alteration.adminRemarks = String(
                req.body.adminRemarks || defaultRemarks(decision)
            ).trim();
            alteration.updatedAt = new Date().toISOString();

            if (decision === "Approved") {
                const originalResult = findExp2Booking(reqid);

                // If the altered booking itself is an Experiment 3 revision,
                // keep the approved alteration in Experiment 3.
                if (!originalResult) {
                    alteration.promotedToExperiment2 = false;
                    alteration.updatedAt = new Date().toISOString();
                    alterationResult.data[alterationResult.index] = alteration;
                    writeExp3Bookings(alterationResult.data);

                    return res.json({
                        success: true,
                        message: `Alteration for Experiment_3 booking #${reqid} approved and kept in Experiment_3/database.json.`,
                        booking: alteration
                    });
                }

                const promoted = {
                    ...alteration,
                    alteredFrom: undefined,
                    alterationType: undefined,
                    alteredAt: undefined,
                    lastAlteredAttribute: undefined,
                    promotedFromExperiment3: true,
                    adminApproval: "Approved",
                    bookingState: "Active",
                    updatedAt: new Date().toISOString()
                };

                // Remove internal alteration-only fields before saving the
                // approved record into the primary Experiment 2 database.
                delete promoted.alteredFrom;
                delete promoted.alterationType;
                delete promoted.alteredAt;
                delete promoted.lastAlteredAttribute;
                delete promoted.deletedAttribute;
                delete promoted.attributeDeletion;
                delete promoted.promotedToExperiment2;
                delete promoted.promotedFromExperiment3;

                originalResult.data[originalResult.index] = promoted;
                writeExp2Bookings(originalResult.data);

                // Keep the alteration in Experiment 3 as an audit/history record.
                alteration.adminApproval = "Approved";
                alteration.promotedToExperiment2 = true;
                alteration.updatedAt = new Date().toISOString();
                alterationResult.data[alterationResult.index] = alteration;
                writeExp3Bookings(alterationResult.data);
                updateCustomerRegistry(promoted);

                return res.json({
                    success: true,
                    message: `Alteration for Booking #${reqid} approved and applied to Experiment_2/database.json. The alteration history remains in Experiment_3/database.json.`,
                    booking: promoted
                });
            }

            alterationResult.data[alterationResult.index] = alteration;
            writeExp3Bookings(alterationResult.data);

            return res.json({
                success: true,
                message: `Alteration for Booking #${reqid} marked ${decision} in Experiment_3/database.json.`,
                booking: alteration
            });
        }

        // Then check whether this request is a revised Experiment 3 booking.
        const revisionResult = findExp3Booking(reqid);

        if (revisionResult) {
            const revision = revisionResult.booking;

            revision.adminApproval = decision;
            revision.adminRemarks = String(
                req.body.adminRemarks || defaultRemarks(decision)
            ).trim();
            revision.updatedAt = new Date().toISOString();

            if (decision === "Approved") {
                // ====================================================
                // CONFIRMED RULE B:
                // Approved revision is copied into Experiment 2.
                // Original Experiment 2 booking is marked Superseded.
                // The revised record remains in Experiment 3 as history.
                // ====================================================
                const originalResult = findExp2Booking(
                    revision.revisionOf
                );

                if (!originalResult) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Original booking for this revision was not found in Experiment 2."
                    });
                }

                const exp2 = originalResult.data;

                const original = exp2[originalResult.index];
                original.bookingState = "Superseded";
                original.supersededBy = revision.reqid;
                original.updatedAt = new Date().toISOString();

                // Copy the approved revision into Experiment 2.
                const promoted = {
                    ...revision,
                    promotedToExperiment2: true,
                    bookingState: "Active",
                    adminApproval: "Approved",
                    adminRemarks: revision.adminRemarks,
                    updatedAt: new Date().toISOString()
                };

                // If a record with this request ID somehow exists,
                // replace it; otherwise append it.
                const existingIndex = exp2.findIndex(
                    b => Number(b.reqid) === Number(promoted.reqid)
                );

                if (existingIndex >= 0) {
                    exp2[existingIndex] = promoted;
                } else {
                    exp2.push(promoted);
                }

                writeExp2Bookings(exp2);

                // Keep the revised copy in Experiment 3 as history.
                revision.adminApproval = "Approved";
                revision.promotedToExperiment2 = true;
                revision.updatedAt = new Date().toISOString();
                revision.bookingState = "Active";
                revision.supersededBy = null;

                revisionResult.data[revisionResult.index] = revision;
                writeExp3Bookings(revisionResult.data);
                updateCustomerRegistry(promoted);

                return res.json({
                    success: true,
                    message:
                        `Revised booking #${revision.reqid} approved and copied into Experiment_2/database.json. Original booking #${revision.revisionOf} is marked Superseded.`,
                    booking: promoted
                });
            }

            // Rejected/Pending revision stays only in Experiment 3.
            revisionResult.data[revisionResult.index] = revision;
            writeExp3Bookings(revisionResult.data);

            return res.json({
                success: true,
                message:
                    `Revised booking #${reqid} marked ${decision} in Experiment_3/database.json.`,
                booking: revision
            });
        }

        // Normal Experiment 2 booking approval/rejection.
        const primaryResult = findExp2Booking(reqid);

        if (!primaryResult) {
            return res.status(404).json({
                success: false,
                message: "Booking request not found."
            });
        }

        const booking = primaryResult.booking;
        booking.adminApproval = decision;
        booking.adminRemarks = String(
            req.body.adminRemarks || defaultRemarks(decision)
        ).trim();
        booking.updatedAt = new Date().toISOString();

        primaryResult.data[primaryResult.index] = booking;
        writeExp2Bookings(primaryResult.data);

        res.json({
            success: true,
            message:
                `Booking #${reqid} marked ${decision} in Experiment_2/database.json.`,
            booking
        });
    } catch (error) {
        console.error("ADMIN STATUS ERROR:", error);
        res.status(500).json({
            success: false,
            message: `Unable to update booking status: ${error.message}`
        });
    }
});

// ============================================================
// CUSTOMER DELETE
// Original booking -> Experiment 2
// Pending revision -> Experiment 3
// ============================================================
router.delete(
    "/customers/:userId/bookings/:reqid",
    (req, res) => {
        try {
            const userId = String(req.params.userId);
            const reqid = normalizeReqId(req.params.reqid);

            if (reqid === null) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid booking request ID."
                });
            }

            const exp2Result = findExp2Booking(reqid);
            const exp3Result = findExp3Booking(reqid);
            const result = exp2Result || exp3Result;

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
            }

            if (!sameCustomer(result.booking.userId, userId)) {
                return res.status(403).json({
                    success: false,
                    message: "This booking does not belong to this customer."
                });
            }

            result.data.splice(result.index, 1);

            if (result.source === "experiment2") {
                writeExp2Bookings(result.data);
            } else {
                writeExp3Bookings(result.data);
            }

            res.json({
                success: true,
                message:
                    result.source === "experiment2"
                        ? `Booking #${reqid} deleted from Experiment_2/database.json.`
                        : `Revised booking #${reqid} deleted from Experiment_3/database.json.`,
                booking: result.booking
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Unable to delete booking: ${error.message}`
            });
        }
    }
);

// ============================================================
// ADMIN DELETE
// ============================================================
router.delete("/bookings/:id", (req, res) => {
    try {
        const reqid = normalizeReqId(req.params.id);

        if (reqid === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking request ID."
            });
        }

        const alterationResult = findAlterationForReqId(reqid);
        const exp2Result = findExp2Booking(reqid);
        const exp3Result = findExp3Booking(reqid);

        // If an Admin ALTER exists, delete the alteration history only.
        // The original Experiment 2 booking remains untouched.
        if (alterationResult) {
            const deleted = alterationResult.booking;
            alterationResult.data.splice(alterationResult.index, 1);
            writeExp3Bookings(alterationResult.data);

            return res.json({
                success: true,
                message: `Alteration for Booking #${reqid} deleted from Experiment_3/database.json. Original Experiment 2 booking was not changed.`,
                booking: deleted
            });
        }

        // Current/primary booking takes priority.
        if (exp2Result) {
            const deleted = exp2Result.booking;
            exp2Result.data.splice(exp2Result.index, 1);
            writeExp2Bookings(exp2Result.data);

            res.json({
                success: true,
                message:
                    `Booking #${reqid} deleted from Experiment_2/database.json.`,
                booking: deleted
            });
            return;
        }

        if (exp3Result) {
            const deleted = exp3Result.booking;
            exp3Result.data.splice(exp3Result.index, 1);
            writeExp3Bookings(exp3Result.data);

            res.json({
                success: true,
                message:
                    `Revised booking #${reqid} deleted from Experiment_3/database.json.`,
                booking: deleted
            });
            return;
        }

        res.status(404).json({
            success: false,
            message: `Booking #${reqid} was not found.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Unable to delete booking: ${error.message}`
        });
    }
});

// ============================================================
// EXPERIMENT 3 REVISION HISTORY
// ============================================================
router.get("/revisions", (req, res) => {
    try {
        res.json({
            success: true,
            revisions: readExp3Bookings()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================================
// MOUNT ROUTER + STATIC FRONTEND
// ============================================================
app.use("/api", router);
app.use("/exp4", express.static(path.join(__dirname, "Exp4_React_Customer_Update_Counter")));
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log("");
    console.log("====================================================");
    console.log(" VenueVista - Experiment 3");
    console.log("====================================================");
    console.log(`Server       : http://localhost:${PORT}`);
    console.log(`My Booking   : http://localhost:${PORT}/status.html`);
    console.log(`Admin        : http://localhost:${PORT}/admin.html`);
    console.log("----------------------------------------------------");
    console.log(`EXP 2 DB     : ${EXP2_DB}`);
    console.log(`EXP 3 DB     : ${EXP3_DB}`);
    console.log("----------------------------------------------------");
    console.log("New customer        -> Experiment 2");
    console.log("Normal Update       -> Experiment 2");
    console.log("Revised Booking     -> Experiment 3");
    console.log("Approved Revision   -> Experiment 2 + history in Experiment 3");
    console.log("Extra field         -> dateOfBirth");
    console.log("====================================================");
    console.log("");
});
