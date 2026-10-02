const Test = require("../models/Test");
const mongoose = require("mongoose");
const DiagnosticCentre = require("../models/DiagnosticCentre");

// CREATE TEST
// ADMIN ONLY
exports.createTest = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Basic validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Test name is required",
            });
        }

        // Check if test already exists
        const existingTest = await Test.findOne({
            name: name.trim(),
        });

        if (existingTest) {
            return res.status(409).json({
                success: false,
                message: "Test already exists",
            });
        }

        // Create test
        const test = await Test.create({
            name: name.trim(),
            description: description ? description.trim() : "",
        });

        return res.status(201).json({
            success: true,
            message: "Diagnostic test created successfully",
            test,
        });

    } catch (error) {
        console.error("Create test error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create diagnostic test",
        });
    }
};


// GET ALL TESTS

exports.getTests = async (req, res) => {
    try {
        const tests = await Test.find();

        return res.status(200).json({
            success: true,
            count: tests.length,
            tests,
        });

    } catch (error) {
        console.error("Get tests error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch diagnostic tests",
        });
    }
};


// GET TEST BY ID
exports.getTestById = async (req, res) => {
    try {
        const { id } = req.params;

        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic test not found",
            });
        }

        return res.status(200).json({
            success: true,
            test,
        });

    } catch (error) {
        console.error("Get test error:", error);

        return res.status(400).json({
            success: false,
            message: "Invalid test ID",
        });
    }
};

// UPDATE TEST - ADMIN ONLY
exports.updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid test ID",
            });
        }

        if (!name && description === undefined) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update",
            });
        }

        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic test not found",
            });
        }

        if (name) {
            const existingTest = await Test.findOne({
                name: name.trim(),
                _id: { $ne: id },
            });

            if (existingTest) {
                return res.status(409).json({
                    success: false,
                    message: "Another test with this name already exists",
                });
            }

            test.name = name.trim();
        }

        if (description !== undefined) {
            test.description = description.trim();
        }

        await test.save();

        return res.status(200).json({
            success: true,
            message: "Diagnostic test updated successfully",
            test,
        });

    } catch (error) {
        console.error("Update test error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update diagnostic test",
        });
    }
};


// DELETE TEST - ADMIN ONLY
exports.deleteTest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid test ID",
            });
        }

        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic test not found",
            });
        }

        // Check whether any diagnostic centre is using this test
        const centreUsingTest = await DiagnosticCentre.findOne({
            "tests.testId": id,
        });

        if (centreUsingTest) {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete this test because it is currently offered by a diagnostic centre",
            });
        }

        await Test.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Diagnostic test deleted successfully",
        });

    } catch (error) {
        console.error("Delete test error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete diagnostic test",
        });
    }
};