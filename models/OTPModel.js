const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: Date
});

module.exports = mongoose.model('OTP', otpSchema);


