const express = require("express");
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const mime = require("mime-types");
require("dotenv").config();

const router = express.Router();

// ✅ Initialize AWS S3 Client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Configure Multer-S3 with file type validation and v3 client
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, and .png files are allowed"), false);
    }
  },
  storage: multerS3({
    s3: s3Client,
    bucket: "visitors-images-store",
    acl: "private", // Keep private for security
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: "visitor",
      });
    },
    key: (req, file, cb) => {
      const extension = mime.extension(file.mimetype);
      const fileKey = `${Date.now()}.${extension}`; // ✅ NO "uploads/" folder
      cb(null, fileKey);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ✅ Upload Route
router.post("/upload", upload.single("image"), (req, res) => {
  console.log("✅ Uploaded file:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "❌ No file uploaded" });
  }

  const fileUrl = req.file.location;
  const fileKey = req.file.key;

  return res.status(200).json({
    message: "✅ File uploaded successfully",
    fileUrl,
    fileKey, // ✅ You will use this key for Rekognition
  });
});

module.exports = router;
