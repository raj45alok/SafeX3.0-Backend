const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTPModel = require('../models/OTPModel');

// POST /api/password/forgot
router.post('/forgot', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTPModel.create({ email, otp, createdAt: new Date() });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Reset Password OTP',
      text: `Use this OTP to reset your password: ${otp}`,
    });

    res.json({ message: 'OTP sent to email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ✅ POST /api/password/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OTPModel.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Server error during verification' });
  }
});



// ✅ POST /api/password/reset
router.post('/reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const record = await OTPModel.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await OTPModel.deleteMany({ email }); // Optional: clean up OTPs
    res.json({ message: '✅ Password reset successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
