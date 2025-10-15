const express = require("express");
const Report = require("../models/Report");
const router = express.Router();


router.get("/", async (_req, res) => {
  try {
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const grouped = await Report.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
          _id: { eventType: "$eventType", severity: "$severity" },
          count: { $sum: 1 },
          sample: { $first: "$$ROOT" }
      }},
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const predictions = grouped.map(g => {
      const { eventType, severity } = g._id;
      const place = g.sample?.location ? `(${g.sample.location.lat?.toFixed(3)}, ${g.sample.location.lng?.toFixed(3)})` : "Your area";
      const baseConfidence = Math.min(95, 30 + g.count * 10);
      const durationText = eventType === "traffic" ? "5–7 PM" :
                           eventType === "power"   ? "2–4 hours" :
                                                      "Next 3 hours";
      return {
        title: eventType === "power" ? "Potential Power Outage"
             : eventType === "traffic" ? "Traffic Congestion Likely"
             : "Weather Alert",
        severity: (severity || "low").toLowerCase(), // "high" | "medium" | "low"
        description: g.sample?.aiSummary || g.sample?.description || `${eventType} activity detected`,
        area: g.sample?.aiCategory || place,
        confidence: baseConfidence,
        window: durationText
      };
    });

    res.json({ window: "Next 6 hours", predictions });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to compute predictions" });
  }
});

module.exports = router;
