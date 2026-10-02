const DiagnosticCentre = require("../models/DiagnosticCentre");
const Test = require("../models/Test");

// CREATE DIAGNOSTIC CENTRE
// ADMIN ONLY
exports.createCentre = async (req, res) => {
    try {
        const { name, location, tests } = req.body;

        // Basic validation
        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "Centre name and location are required",
            });
        }

        // Validate tests if provided
        let centreTests = [];

        if (tests && tests.length > 0) {
            for (const item of tests) {
                const { testId, price } = item;

                if (!testId || price === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "Each test must have testId and price",
                    });
                }

                if (price < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Test price cannot be negative",
                    });
                }

                // Check whether test exists
                const test = await Test.findById(testId);

                if (!test) {
                    return res.status(404).json({
                        success: false,
                        message: `Test not found: ${testId}`,
                    });
                }

                centreTests.push({
                    testId,
                    price,
                });
            }
        }

        // Create centre
        const centre = await DiagnosticCentre.create({
            name: name.trim(),
            location: location.trim(),
            tests: centreTests,
        });

        return res.status(201).json({
            success: true,
            message: "Diagnostic centre created successfully",
            centre,
        });

    } catch (error) {
        console.error("Create centre error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create diagnostic centre",
        });
    }
};


// GET ALL CENTRES
exports.getCentres = async (req, res) => {
    try {
        const centres = await DiagnosticCentre
            .find()
            .populate(
                "tests.testId",
                "name description"
            );

        return res.status(200).json({
            success: true,
            count: centres.length,
            centres,
        });

    } catch (error) {
        console.error("Get centres error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch diagnostic centres",
        });
    }
};


// GET CENTRE BY ID
exports.getCentreById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid centre ID",
            });
        }

        const centre = await DiagnosticCentre
            .findById(id)
            .populate(
                "tests.testId",
                "name description"
            );

        if (!centre) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic centre not found",
            });
        }

        return res.status(200).json({
            success: true,
            centre,
        });

    } catch (error) {
        console.error("Get centre error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch diagnostic centre",
        });
    }
};

// UPDATE DIAGNOSTIC CENTRE - ADMIN ONLY
exports.updateCentre = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, tests } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid centre ID",
            });
        }

        if (
            name === undefined &&
            location === undefined &&
            tests === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update",
            });
        }

        const centre = await DiagnosticCentre.findById(id);

        if (!centre) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic centre not found",
            });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Centre name cannot be empty",
                });
            }

            centre.name = name.trim();
        }

        if (location !== undefined) {
            if (!location.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Centre location cannot be empty",
                });
            }

            centre.location = location.trim();
        }

        if (tests !== undefined) {
            if (!Array.isArray(tests)) {
                return res.status(400).json({
                    success: false,
                    message: "Tests must be an array",
                });
            }

            const centreTests = [];

            for (const item of tests) {
                const { testId, price } = item;

                if (
                    !testId ||
                    price === undefined
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Each test must have testId and price",
                    });
                }

                if (!mongoose.Types.ObjectId.isValid(testId)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid test ID: ${testId}`,
                    });
                }

                if (
                    typeof price !== "number" ||
                    price < 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Test price must be a non-negative number",
                    });
                }

                const test = await Test.findById(testId);

                if (!test) {
                    return res.status(404).json({
                        success: false,
                        message: `Test not found: ${testId}`,
                    });
                }

                centreTests.push({
                    testId,
                    price,
                });
            }

            centre.tests = centreTests;
        }

        await centre.save();

        return res.status(200).json({
            success: true,
            message:
                "Diagnostic centre updated successfully",
            centre,
        });

    } catch (error) {
        console.error("Update centre error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to update diagnostic centre",
        });
    }
};


// DELETE DIAGNOSTIC CENTRE - ADMIN ONLY
exports.deleteCentre = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid centre ID",
            });
        }

        const centre = await DiagnosticCentre.findById(id);

        if (!centre) {
            return res.status(404).json({
                success: false,
                message: "Diagnostic centre not found",
            });
        }

        await DiagnosticCentre.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message:
                "Diagnostic centre deleted successfully",
        });

    } catch (error) {
        console.error("Delete centre error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to delete diagnostic centre",
        });
    }
};