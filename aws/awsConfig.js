// src/aws/awsConfig.js
import { S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient } from "@aws-sdk/client-rekognition";

// ⚠️ Make sure these are stored securely (in production, use env vars or Cognito)
const REGION = "your-region"; // e.g., "ap-south-1"
const ACCESS_KEY = "YOUR_ACCESS_KEY";
const SECRET_KEY = "YOUR_SECRET_KEY";

// ✅ S3 Client
export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

// ✅ Rekognition Client
export const rekognition = new RekognitionClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
