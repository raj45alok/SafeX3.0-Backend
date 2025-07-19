const express = require("express");
const {
  RekognitionClient,
  SearchFacesByImageCommand,
  IndexFacesCommand,
  ListCollectionsCommand,
} = require("@aws-sdk/client-rekognition");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

// ✅ Initialize Rekognition Client
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Constant Collection ID
const COLLECTION_ID = "employees";

// ✅ Helper function for validating required fields
const isMissing = (fields) => fields.some((field) => !field);

// ✅ POST /api/rekognition/compare → Face Matching
router.post("/compare", async (req, res) => {
  const { source } = req.body;
  const { bucket, key } = source || {};

  // Log incoming request parameters
  console.log("Incoming request for /compare with parameters:", { bucket, key });

  if (isMissing([bucket, key])) {
    return res.status(400).json({
      message: "❌ Missing required fields: bucket, key",
    });
  }

  try {
    const command = new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: {
        S3Object: { Bucket: bucket, Name: key },
      },
      FaceMatchThreshold: 90,
      MaxFaces: 1,
    });

    // Log the Rekognition command parameters
    console.log("Rekognition Command for face match:", command);

    const { FaceMatches } = await rekognition.send(command);

    // Log Rekognition response
    console.log("Rekognition response for /compare:", FaceMatches);

    if (FaceMatches.length > 0) {
      const match = FaceMatches[0];
      return res.status(200).json({
        message: "✅ Face matched!",
        matchedFaceId: match.Face.FaceId,
        similarity: match.Similarity,
      });
    } else {
      return res.status(404).json({
        message: "❌ No face match found",
        matchedFaceId: null,
        similarity: null,
      });
    }
  } catch (err) {
    console.error("🔴 Rekognition compare error:", err);
    return res.status(500).json({
      message: "❌ Error during face recognition",
      error: err.message,
    });
  }
});

// ✅ POST /api/rekognition/index → Face Indexing
router.post("/index", async (req, res) => {
  const { source, externalImageId } = req.body;
  const { bucket, key } = source || {};

  // Log incoming request parameters
  console.log("Incoming request for /index with parameters:", { bucket, key, externalImageId });

  if (isMissing([bucket, key, externalImageId])) {
    return res.status(400).json({
      message: "❌ Missing required fields: bucket, key, externalImageId",
    });
  }

  try {
    const command = new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      ExternalImageId: externalImageId,
      Image: {
        S3Object: { Bucket: bucket, Name: key },
      },
      DetectionAttributes: [],
    });

    // Log the Rekognition command parameters
    console.log("Rekognition Command for face indexing:", command);

    const { FaceRecords } = await rekognition.send(command);

    // Log Rekognition response
    console.log("Rekognition response for /index:", FaceRecords);

    if (FaceRecords && FaceRecords.length > 0) {
      return res.status(200).json({
        message: "✅ Face successfully indexed!",
        faceId: FaceRecords[0].Face.FaceId,
      });
    } else {
      return res.status(400).json({
        message: "❌ Face not detected in image",
        faceId: null,
      });
    }
  } catch (err) {
    console.error("🔴 Rekognition index error:", err);
    return res.status(500).json({
      message: "❌ Error indexing face",
      error: err.message,
    });
  }
});

// ✅ GET /api/rekognition/list-collections
router.get("/list-collections", async (req, res) => {
  try {
    const command = new ListCollectionsCommand({});
    
    // Log the Rekognition command for listing collections
    console.log("Rekognition Command for listing collections:", command);

    const response = await rekognition.send(command);

    // Log Rekognition response
    console.log("Rekognition response for /list-collections:", response.CollectionIds);

    res.status(200).json({
      message: "✅ Rekognition collections fetched successfully!",
      collections: response.CollectionIds,
    });
  } catch (err) {
    console.error("🔴 Error listing collections:", err);
    res.status(500).json({
      message: "❌ Failed to fetch collections",
      error: err.message,
    });
  }
});

module.exports = router;
