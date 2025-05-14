// routes/facultyRoutes.js
const express = require("express");
const router = express.Router();
const Faculty = require("../models/Faculty");
const { authMiddleware } = require("../middleware/authMiddleware");

// 🔍 GET: Faculty Profile
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ msg: "Faculty not found" });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✏️ PUT: Update Faculty Profile
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedFaculty) return res.status(404).json({ msg: "Faculty not found" });
    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ msg: "Update failed" });
  }
});

// 🧪 GET: Research Impact Metrics Placeholder (to integrate later)
router.get("/:id/impact-metrics", authMiddleware, async (req, res) => {
  res.json({ hIndex: 7, citations: 125 });
});

module.exports = router;
