// src/aws/uploadToS3.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./awsConfig";

export const uploadToS3 = async (file, fileName) => {
  const bucketName = "visitors-images-store"; // Replace with your actual bucket name

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: file.type || "image/jpeg",
      ACL: "public-read", // Optional: for public access if required
    });

    const response = await s3.send(command);
    console.log("✅ Upload successful:", response);

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
    return imageUrl;
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return null;
  }
};
