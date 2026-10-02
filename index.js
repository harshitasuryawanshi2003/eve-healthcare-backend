const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Database connection
require("./config/database").connect();

// Routes
const userRoutes = require("./routes/user");
const centreRoutes = require("./routes/centre");
const testRoutes = require("./routes/test");
const bookingRoutes = require("./routes/booking");
const paymentRoutes = require("./routes/payment");

app.use("/api/v1", userRoutes);
app.use("/api/v1", centreRoutes);
app.use("/api/v1", testRoutes);
app.use("/api/v1", bookingRoutes);
app.use("/api/v1", paymentRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`App is listening at ${PORT}`);
});