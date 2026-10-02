const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const DiagnosticCentre = require("../models/DiagnosticCentre");
const Test = require("../models/Test");

// CREATE BOOKING - USER ONLY
exports.createBooking = async (req, res) => {
    try {
        const {
            testId,
            centreId,
            appointmentDate,
        } = req.body;

        if (!testId || !centreId || !appointmentDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Test, centre and appointment date are required",
            });
        }

        // Validate ObjectIds
        if (
            !mongoose.Types.ObjectId.isValid(testId) ||
            !mongoose.Types.ObjectId.isValid(centreId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid test ID or centre ID",
            });
        }

        // Validate appointment date
        const appointment = new Date(appointmentDate);

        if (isNaN(appointment.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid appointment date",
            });
        }

        if (appointment <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Appointment date must be in the future",
            });
        }

        // Check test exists
        const test = await Test.findById(testId);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic test not found",
            });
        }

        // Check centre exists
        const centre = await DiagnosticCentre.findById(centreId);

        if (!centre) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic centre not found",
            });
        }

        // Check whether this test is available at this centre
        const centreTest = centre.tests.find(
            (item) => item.testId.toString() === testId
        );

        if (!centreTest) {
            return res.status(400).json({
                success: false,
                message:
                    "Selected test is not available at this diagnostic centre",
            });
        }

        // Use the price configured for this centre
        const amount = centreTest.price;

        // Create booking
        const booking = await Booking.create({
            user: req.user.id,
            test: testId,
            centre: centreId,
            appointmentDate: appointment,
            amount,
            status: "PENDING",
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking,
        });

    } catch (error) {
        console.error("Create booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create booking",
        });
    }
};


// GET MY BOOKINGS - USER ONLY
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user.id,
        })
            .populate("test", "name description")
            .populate("centre", "name location")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });

    } catch (error) {
        console.error("Get bookings error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch bookings",
        });
    }
};


// GET BOOKING BY ID - USER ONLY
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await Booking.findById(id)
            .populate("test", "name description")
            .populate("centre", "name location");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Users can only view their own bookings
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking",
            });
        }

        return res.status(200).json({
            success: true,
            booking,
        });

    } catch (error) {
        console.error("Get booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch booking",
        });
    }
};

// CANCEL BOOKING - USER ONLY
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // User can only cancel their own booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to cancel this booking",
            });
        }

        // Only pending bookings can be cancelled
        if (booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending bookings can be cancelled",
            });
        }

        booking.status = "CANCELLED";

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking,
        });

    } catch (error) {
        console.error("Cancel booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to cancel booking",
        });
    }
};