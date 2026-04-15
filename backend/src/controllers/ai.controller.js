const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── POST /api/ai/generate ─────────────────────────────────────
const generateLatex = async (req, res, next) => {
  try {
    const resumeData = req.body;

    if (!resumeData || Object.keys(resumeData).length === 0) {
      return res.status(400).json({ message: "Resume data is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    const prompt = buildPrompt(resumeData);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const latexContent = result.response.text();

    // Strip markdown code fences if Gemini wraps output in ```latex ... ```
    const cleanLatex = stripCodeFences(latexContent);

    res.json({ latex: cleanLatex });
  } catch (err) {
    // Surface Gemini-specific errors clearly
    if (err.message?.includes("API_KEY_INVALID")) {
      return res.status(401).json({ message: "Invalid Gemini API key" });
    }
    next(err);
  }
};

// ── Helpers ───────────────────────────────────────────────────

function buildPrompt(data) {
  return `You are a professional resume writer and LaTeX expert.

Convert the following JSON resume data into a clean, professional LaTeX resume.

Requirements:
- Use the article document class with standard margins (geometry package)
- Include these sections in order: Name + Contact, Summary, Education, Experience, Skills
- Keep it ATS-friendly and minimal
- Use \\textbf, \\textit, itemize environments, and \\hrule for section separators
- Return ONLY valid LaTeX code — no markdown, no explanations, no code fences

JSON Data:
${JSON.stringify(data, null, 2)}`;
}

function stripCodeFences(text) {
  // Remove ```latex ... ``` or ``` ... ```
  return text
    .replace(/^```(?:latex)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

module.exports = { generateLatex };
