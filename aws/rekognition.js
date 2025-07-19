// backend/routes/rekognition.js or backend/aws/rekognition.js
import { RekognitionClient, SearchFacesByImageCommand } from "@aws-sdk/client-rekognition";
import dotenv from "dotenv";
dotenv.config();

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const detectFaceFromS3 = async (bucketName, fileName) => {
  try {
    const command = new SearchFacesByImageCommand({
      CollectionId: process.env.AWS_REKOGNITION_COLLECTION_ID,
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: fileName,
        },
      },
      FaceMatchThreshold: 80,
      MaxFaces: 1,
    });

    const response = await rekognition.send(command);
    console.log("🔍 Rekognition response:", response);

    return response.FaceMatches && response.FaceMatches.length > 0;
  } catch (err) {
    console.error("❌ Rekognition error:", err);
    return false;
  }
};
