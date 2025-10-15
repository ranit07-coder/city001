const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  eventType: String,
  severity: String,
  description: String,
  location: {
    lat: Number,
    lng: Number,
  },
  imageUrl: String,
  aiCategory: String,
  aiSummary: String,
  sentiment: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
