const { Router } = require("express");
const { generateLatex } = require("../controllers/ai.controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

// POST /api/ai/generate
// Body: resume JSON (personalInfo, education, experience, skills)
router.post("/generate", protect, generateLatex);

module.exports = router;
