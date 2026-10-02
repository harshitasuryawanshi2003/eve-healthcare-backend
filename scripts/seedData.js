const mongoose = require("mongoose");
require("dotenv").config();

const Test = require("../models/Test");
const DiagnosticCentre = require("../models/DiagnosticCentre");

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("Connected to MongoDB");

        // 1. Create diagnostic tests
        const testData = [
            {
                name: "Complete Blood Count",
                description:
                    "Measures different components of blood including red blood cells, white blood cells and platelets",
            },
            {
                name: "Lipid Profile",
                description:
                    "Measures cholesterol and triglyceride levels",
            },
            {
                name: "Thyroid Profile",
                description:
                    "Measures thyroid hormone levels",
            },
            {
                name: "Liver Function Test",
                description:
                    "Evaluates liver function using different blood markers",
            },
        ];

        const tests = [];

        for (const data of testData) {
            let test = await Test.findOne({
                name: data.name,
            });

            if (!test) {
                test = await Test.create(data);
                console.log(`Created test: ${test.name}`);
            } else {
                console.log(`Test already exists: ${test.name}`);
            }

            tests.push(test);
        }

        // 2. Create diagnostic centres

        const centreData = [
            {
                name: "City Diagnostic Centre",
                location: "Bhopal, Madhya Pradesh",
                tests: [
                    {
                        testName: "Complete Blood Count",
                        price: 500,
                    },
                    {
                        testName: "Lipid Profile",
                        price: 800,
                    },
                    {
                        testName: "Thyroid Profile",
                        price: 650,
                    },
                ],
            },
            {
                name: "Apollo Diagnostics",
                location: "Indore, Madhya Pradesh",
                tests: [
                    {
                        testName: "Complete Blood Count",
                        price: 550,
                    },
                    {
                        testName: "Lipid Profile",
                        price: 750,
                    },
                ],
            },
            {
                name: "HealthCare Diagnostics",
                location: "Nagpur, Maharashtra",
                tests: [
                    {
                        testName: "Complete Blood Count",
                        price: 450,
                    },
                    {
                        testName: "Thyroid Profile",
                        price: 600,
                    },
                    {
                        testName: "Liver Function Test",
                        price: 900,
                    },
                ],
            },
        ];

        for (const data of centreData) {
            let centre = await DiagnosticCentre.findOne({
                name: data.name,
            });

            if (centre) {
                console.log(
                    `Centre already exists: ${centre.name}`
                );
                continue;
            }

            const centreTests = data.tests.map((item) => {
                const test = tests.find(
                    (test) => test.name === item.testName
                );

                return {
                    testId: test._id,
                    price: item.price,
                };
            });

            centre = await DiagnosticCentre.create({
                name: data.name,
                location: data.location,
                tests: centreTests,
            });

            console.log(
                `Created centre: ${centre.name}`
            );
        }

        console.log("Seed data inserted successfully");

        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedData();