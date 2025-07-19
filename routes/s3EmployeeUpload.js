// /routes/s3EmployeeUpload.js
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const router = express.Router();
require('dotenv').config();

// Configure AWS S3 with credentials
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/employee/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const file = req.file;

    if (!fullName || !email || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate filename
    const formattedName = fullName.replace(/\s+/g, '-');
    const fileName = `${formattedName}-${email}.jpg`;
    const bucketName = process.env.EMPLOYEE_BUCKET_NAME;

    // Upload to S3
    await s3
      .putObject({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    res.status(200).json({ message: '✅ Image uploaded to S3 successfully.' });
  } catch (error) {
    console.error('❌ Error uploading to S3:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

module.exports = router;
