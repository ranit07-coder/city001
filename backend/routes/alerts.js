const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

router.get('/', async (req, res) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const recentReports = await Report.aggregate([
    { $match: { createdAt: { $gte: oneHourAgo } } },
    { $group: {
      _id: { category: "$category", location: "$location" },
      count: { $sum: 1 }
    }},
    { $match: { count: { $gte: 3 } } },
  ]);

  const alerts = recentReports.map(r => ({
    message: `Multiple ${r._id.category} reports in your area.`,
    timestamp: now
  }));

  res.json(alerts);
});

module.exports = router;
