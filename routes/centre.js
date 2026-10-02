const express = require("express");

const router = express.Router();

const {createCentre,getCentres,getCentreById,updateCentre,deleteCentre} = require("../controllers/centre");

const {auth,isAdmin} = require("../middlewares/auth");

// Admin: create diagnostic centre
router.post("/centres",auth,isAdmin,createCentre);

// Public: get all diagnostic centres
router.get("/centres",getCentres);

// Public: get diagnostic centre by ID
router.get("/centres/:id",getCentreById);

// Admin: update diagnostic centre
router.patch("/centres/:id",auth,isAdmin,updateCentre);

// Admin: delete diagnostic centre
router.delete("/centres/:id",auth,isAdmin,deleteCentre);

module.exports = router;