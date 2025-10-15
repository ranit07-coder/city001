const express = require("express");
const jwt = require("jsonwebtoken");
const { loginUser, registerUser } = require("../controllers/authController");
const User = require("../models/User");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

// auth check: /api/auth/me  (front-end can persist user)
router.get("/me", async (req, res) => {
  try {
    const auth = (req.headers.authorization || "").split(" ")[1];
    if (!auth) return res.status(401).json({ msg: "No token" });
    const { userId } = jwt.verify(auth, process.env.JWT_SECRET);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (e) {
    return res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;
