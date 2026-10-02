const mongoose = require("mongoose");

const diagnosticCentreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        tests: [
            {
                testId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Test",
                    required: true,
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("DiagnosticCentre",diagnosticCentreSchema);