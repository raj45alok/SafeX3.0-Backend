const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Utility: Validate password format
const isValidPassword = (password) => {
  // Minimum 6 chars, at least one letter, one digit, and one special character
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
  return regex.test(password);
};

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Validate password format
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long, contain one special character, one number, and one letter.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Check if password is already in use
    const allUsers = await User.find({});
    for (const user of allUsers) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return res.status(400).json({ message: "Password already in use. Please choose a different one." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in /register:", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      fullName: user.fullName,
    });
  } catch (err) {
    console.error("Error in /login:", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
});

// OPTIONAL: Password existence check route (for frontend async check)
router.post("/check-password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });

    const allUsers = await User.find({});
    for (const user of allUsers) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) return res.json({ exists: true });
    }

    return res.json({ exists: false });
  } catch (err) {
    console.error("Error in /check-password:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
