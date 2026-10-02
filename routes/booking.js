const express = require("express");

const router = express.Router();

const {createBooking,getMyBookings,getBookingById,cancelBooking} = require("../controllers/booking");

const {auth,isUser} = require("../middlewares/auth");

// Create a booking
router.post("/bookings",auth,isUser,createBooking);

// Get all bookings of logged-in user
router.get("/bookings",auth,isUser,getMyBookings);

// Get one booking of logged-in user
router.get("/bookings/:id",auth,isUser,getBookingById);

// Cancel a pending booking
router.patch("/bookings/:id/cancel",auth,isUser,cancelBooking);

module.exports = router;