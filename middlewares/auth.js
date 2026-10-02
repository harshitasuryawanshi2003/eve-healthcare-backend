const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
    try {
        let token;

        // 1. Try cookie
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // 2. Otherwise try Authorization header
        const authHeader = req.header("Authorization");

        if (!token && authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // No token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded user information
        req.user = decoded;

        next();

    } catch (error) {
        console.error("Authentication error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }

    next();
};

exports.isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    if (req.user.role !== "USER") {
        return res.status(403).json({
            success: false,
            message: "User access required",
        });
    }

    next();
};