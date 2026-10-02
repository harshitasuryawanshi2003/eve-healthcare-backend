const express = require("express");

const router = express.Router();

const {createPayment,paymentWebhook} = require("../controllers/payment");

const {auth,isUser} = require("../middlewares/auth");

// Simulated payment
router.post("/payments",auth,isUser,createPayment);

// Payment webhook
// No user authentication because this is called by the payment provider
router.post("/payments/webhook",paymentWebhook);

module.exports = router;