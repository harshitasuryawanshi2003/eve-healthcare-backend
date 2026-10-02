const express = require("express");

const router = express.Router();

const {createTest,getTests,getTestById,updateTest,deleteTest} = require("../controllers/test");

const {auth,isAdmin} = require("../middlewares/auth");

// Admin: create diagnostic test
router.post("/tests",auth,isAdmin,createTest);

// Public: get all diagnostic tests
router.get("/tests",getTests);

// Public: get diagnostic test by ID
router.get("/tests/:id",getTestById);

// Admin: update diagnostic test
router.patch("/tests/:id",auth,isAdmin,updateTest);

// Admin: delete diagnostic test
router.delete("/tests/:id",auth,isAdmin,deleteTest);

module.exports = router;