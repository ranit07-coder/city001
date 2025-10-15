// 📊 GET /stats — summary of report stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Report.countDocuments();

    // Use aiCategory instead of category
    const highPriority = await Report.countDocuments({ aiCategory: 'High Priority' });
    const predictions = await Report.countDocuments({ aiCategory: 'Prediction' });

    // Aggregate sentiment distribution
    const sentimentStats = await Report.aggregate([
      { $group: { _id: "$sentiment", count: { $sum: 1 } } }
    ]);

    let positiveCount = sentimentStats.find(item => item._id?.toLowerCase() === 'positive')?.count || 0;
    let negativeCount = sentimentStats.find(item => item._id?.toLowerCase() === 'negative')?.count || 0;
    let neutralCount  = sentimentStats.find(item => item._id?.toLowerCase() === 'neutral')?.count || 0;

    const cityMood = total > 0 ? (positiveCount / total) * 100 : 0;

    res.json({
      totalReports: total,
      highPriority,
      predictions,
      sentiments: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      },
      cityMood: parseFloat(cityMood.toFixed(2))
    });
  } catch (err) {
    console.error("Error in /stats:", err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
