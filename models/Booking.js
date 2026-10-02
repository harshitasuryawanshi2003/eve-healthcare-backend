const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            required: true,
        },

        centre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DiagnosticCentre",
            required: true,
        },

        appointmentDate: {
            type: Date,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "FAILED",
                "CANCELLED",
            ],
            default: "PENDING",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Booking", bookingSchema);