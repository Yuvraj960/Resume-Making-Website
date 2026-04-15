const { Router } = require("express");
const {
  getResume,
  createResume,
  updateResume,
} = require("../controllers/resume.controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

// All resume routes require authentication
router.use(protect);

// GET  /api/resume  → fetch existing resume
router.get("/", getResume);

// POST /api/resume  → create (first time)
router.post("/", createResume);

// PUT  /api/resume  → update existing resume
router.put("/", updateResume);

module.exports = router;
