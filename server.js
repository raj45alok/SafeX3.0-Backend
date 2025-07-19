const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');


// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Debug AWS Keys
console.log("AWS Key:", process.env.AWS_ACCESS_KEY_ID ? "✅ Loaded" : "❌ Not loaded");
console.log("AWS Secret:", process.env.AWS_SECRET_ACCESS_KEY ? "✅ Loaded" : "❌ Not loaded");

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Routes
app.use("/api/auth", authRoutes);
const forgotPasswordRoutes = require('./routes/forgotPassword');
const s3Routes = require('./routes/s3');
const rekognitionRoutes = require('./routes/rekognition');
const employeeUploadRoutes = require('./routes/s3EmployeeUpload');
const otpRoutes = require('./routes/otp'); // ✅ correct


// Use Routes
app.use("/api/auth", otpRoutes);
app.use("/api/password", forgotPasswordRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/rekognition", rekognitionRoutes);
app.use("/api/employee", employeeUploadRoutes);
app.use("/api", otpRoutes); // ✅ Make sure this is before app.listen

// Start Server
app.listen(5000, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
//const otpRoutes = require('./routes/otp');
//app.use('/api', otpRoutes);
//const forgotPasswordRoutes = require('./routes/forgotPassword');
//app.use('/api/password', forgotPasswordRoutes);