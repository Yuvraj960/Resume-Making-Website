const Resume = require("../models/Resume.model");

// ── GET /api/resume ───────────────────────────────────────────
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "No resume found" });
    }
    res.json(resume);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/resume ──────────────────────────────────────────
const createResume = async (req, res, next) => {
  try {
    const exists = await Resume.findOne({ userId: req.user.id });
    if (exists) {
      return res.status(409).json({
        message: "Resume already exists. Use PUT to update.",
      });
    }

    const { personalInfo, education, experience, skills } = req.body;

    const resume = await Resume.create({
      userId: req.user.id,
      personalInfo: personalInfo || {},
      education: education || [],
      experience: experience || [],
      skills: skills || [],
    });

    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/resume ───────────────────────────────────────────
const updateResume = async (req, res, next) => {
  try {
    const { personalInfo, education, experience, skills } = req.body;

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          ...(personalInfo !== undefined && { personalInfo }),
          ...(education !== undefined && { education }),
          ...(experience !== undefined && { experience }),
          ...(skills !== undefined && { skills }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({
        message: "No resume found. Use POST to create one first.",
      });
    }

    res.json(resume);
  } catch (err) {
    next(err);
  }
};

module.exports = { getResume, createResume, updateResume };
