# SafeX 3.0 - Backend

This is the backend API for **SafeX 3.0**, a secure employee verification and recognition system built with Node.js, Express, MongoDB, and AWS Rekognition.

---

##  Features

- JWT-based authentication
-  MongoDB for employee and user data
-  AWS Rekognition for face detection and recognition
-  AWS S3 for image storage
-  Email integration for alerts and OTPs

---

##  Tech Stack

- **Node.js**
- **Express**
- **MongoDB (Mongoose)**
- **AWS S3 & Rekognition**
- **JWT (JSON Web Tokens)**
- **Nodemailer** for email services

---

## Environment Variables

Create a `.env` file in the root directory. Here's a template of the required environment variables:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/safex3?retryWrites=true&w=majority

# App Port
PORT=5000

# JWT Secret
JWT_SECRET=your_jwt_secret_token

# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1

# S3 Buckets
S3_BUCKET_NAME=your_main_bucket
EMPLOYEE_BUCKET_NAME=employees-image-store

# AWS Rekognition
AWS_REKOGNITION_COLLECTION_ID=safex-face-collection
COLLECTION_ID=safex-face-collection

# Email (SMTP)
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_app_specific_password
