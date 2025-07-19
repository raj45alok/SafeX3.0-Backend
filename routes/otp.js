const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const OTPModel = require('../models/OTPModel');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}
console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Optional: verify transporter on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email transporter error:", err);
  } else {
    console.log("✅ Email transporter is ready");
  }
});

// ✅ POST /api/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();

  try {
    // Save OTP to DB
    await OTPModel.create({ email, otp, createdAt: new Date() });

    // Send email with OTP
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent' });

  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
});

// ✅ POST /api/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OTPModel.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Optional: check expiration
    await OTPModel.deleteMany({ email });
    res.status(200).json({ success: true, message: 'OTP Verified' });

  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
