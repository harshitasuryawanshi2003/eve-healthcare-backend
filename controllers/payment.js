const mongoose = require("mongoose");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");


// SIMULATED PAYMENT - USER ONLY
exports.createPayment = async (req, res) => {
    try {
        const { bookingId, paymentStatus } = req.body;

        if (!bookingId || !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and payment status are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        if (!["SUCCESS", "FAILED"].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Payment status must be SUCCESS or FAILED",
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to pay for this booking",
            });
        }

        if (booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Payment cannot be made for this booking",
            });
        }

        const existingPayment = await Payment.findOne({
            booking: bookingId,
        });

        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: "Payment already exists for this booking",
                payment: existingPayment,
            });
        }

        const transactionId = `TXN_${crypto.randomUUID()}`;

        const payment = await Payment.create({
            booking: bookingId,
            user: req.user.id,
            amount: booking.amount,
            status: paymentStatus,
            transactionId,
        });

        booking.status =
            paymentStatus === "SUCCESS"
                ? "CONFIRMED"
                : "FAILED";

        await booking.save();

        return res.status(201).json({
            success: true,
            message: "Payment processed successfully",
            payment,
            bookingStatus: booking.status,
        });

    } catch (error) {
        console.error("Create payment error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Payment already exists for this booking",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to process payment",
        });
    }
};


// PAYMENT WEBHOOK - IDEMPOTENT + TRANSACTION SAFE
exports.paymentWebhook = async (req, res) => {
    try {
        const { eventId, bookingId, paymentStatus } = req.body;

        if (!eventId || !bookingId || !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: "eventId, bookingId and paymentStatus are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        if (!["SUCCESS", "FAILED"].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Payment status must be SUCCESS or FAILED",
            });
        }

        // 1. Check whether this webhook event was already processed
        const existingEvent = await Payment.findOne({
            webhookEventId: eventId,
        });

        if (existingEvent) {
            return res.status(200).json({
                success: true,
                message: "Webhook already processed",
                payment: existingEvent,
            });
        }

        // 2. Find booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // 3. Booking should still be pending
        if (booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Payment cannot be processed for this booking",
            });
        }

        // 4. Make sure this booking doesn't already have a payment
        const existingPayment = await Payment.findOne({
            booking: bookingId,
        });

        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: "Payment already exists for this booking",
            });
        }

        // 5. Create payment
        const transactionId = `TXN_${crypto.randomUUID()}`;

        const payment = await Payment.create({
            booking: bookingId,
            user: booking.user,
            amount: booking.amount,
            status: paymentStatus,
            transactionId,
            webhookEventId: eventId,
        });

        // 6. Update booking
        booking.status =
            paymentStatus === "SUCCESS"
                ? "CONFIRMED"
                : "FAILED";

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Payment webhook processed successfully",
            payment,
            bookingStatus: booking.status,
        });

    } catch (error) {
        console.error("Payment webhook error:", error);

        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message: "Webhook already processed",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to process payment webhook",
        });
    }
};