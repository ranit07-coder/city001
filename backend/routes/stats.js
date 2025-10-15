// routes/stats.js
const express = require("express");
const Report = require("../models/Report");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    // Count total active reports
    const activeCount = await Report.countDocuments();

    // Count high severity reports
    const highPriorityCount = await Report.countDocuments({ severity: "high" });

    // Count prediction-tagged reports (adjust if needed)
    const predictionCount = await Report.countDocuments({ aiCategory: "Prediction" });

    // Sentiment breakdown (positive, neutral, negative)
    const sentimentStats = await Report.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } }
    ]);

    const positive = sentimentStats.find(s => s._id === "positive")?.count || 0;

    // Calculate city mood as % positive
    const cityMood = activeCount > 0
      ? Math.round((positive / activeCount) * 100)
      : 0;

    res.json({
      activeCount,
      highPriorityCount,
      predictionCount,
      cityMood
    });
  } catch (e) {
    console.error("Error fetching stats:", e);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
