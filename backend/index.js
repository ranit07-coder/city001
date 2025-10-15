require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const streamifier = require("streamifier");
const cloudinary = require("./services/cloudinary");
const Report = require("./models/Report");
const { analyzeMedia } = require("./services/analyzer");

// Route modules
const authRoutes = require("./routes/authRoutes");
const statsRoutes = require("./routes/statsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const alerts = require("./routes/alerts");

const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/alerts", alerts);

// Multer for in-memory uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * POST /report - Upload new report
 */
app.post("/report", upload.single("media"), async (req, res) => {
  try {
    const { eventType, severity, description, lat, lng } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No media file uploaded." });

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    // AI Analysis
    const aiResult = await analyzeMedia(description, uploadResult.secure_url);

    // Save to DB
    const newReport = new Report({
      eventType,
      severity,
      description,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      imageUrl: uploadResult.secure_url,
      aiCategory: aiResult.category,
      aiSummary: aiResult.summary,
      sentiment: aiResult.sentiment,
    });

    await newReport.save();
    res.status(201).json({ message: "✅ Report uploaded successfully", report: newReport });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /reports - Fetch all reports
 */
app.get("/reports", async (_req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
