# SafeX 3.0 – Backend

This is the backend service powering the SafeX 3.0 multi-layer authentication system. It handles secure user registration, credential validation, facial recognition using AWS Rekognition, OTP verification, and file vault access.

---

##  Features

- Register users with password + face data
- Upload face images to **AWS S3**
- Store user metadata in **MongoDB**
- Use **AWS Rekognition** for face comparison
- OTP generation and  verification before vault access
- Return access token upon success

---

##  Tech Stack

- **Runtime**: Node.js / Python
- **Database**: MongoDB
- **Cloud Services**: AWS Lambda, API Gateway, S3, Rekognition, CloudWatch,DynamoDB
- **Security**: IAM roles, signed S3 URLs, OTP logic
- **Architecture**: Serverless (Lambda), REST APIs, CORS-enabled

---

##  Authentication Flow

1. **Register**  
   - Store username + password hash in MongoDB  
   - Upload face image to S3

2. **Login**  
   - Validate credentials  
   - Match face using Rekognition

3. **OTP Verification**  
   - Generate and validate OTP  
   - Grant access to secure vault

---

##  API Endpoints

| Method | Endpoint                | Description                                   | File (Route)             |
|--------|-------------------------|-----------------------------------------------|--------------------------|
| POST   | `/api/auth/register`    | Register user with email, password, face      | `routes/auth.js`         |
| POST   | `/api/auth/login`       | Authenticate credentials                      | `routes/auth.js`         |
| POST   | `/api/rekognition/verify` | Verify face image using AWS Rekognition      | `routes/rekognition.js`  |
| POST   | `/api/otp/generate`     | Generate OTP after face match                 | `routes/otp.js`          |
| POST   | `/api/otp/verify`       | Verify OTP for final authentication           | `routes/otp.js`          |
| POST   | `/api/s3/upload`        | Upload file to user vault (S3)                | `routes/s3.js`           |
| GET    | `/api/s3/files/:userId` | Fetch user’s uploaded files from S3           | `routes/s3.js`           |
| POST   | `/api/forgot-password`  | Handle password reset process via email/OTP   | `routes/forgotPassword.js` |
| POST   | `/api/s3/employee-upload` | Upload employee registration image to S3    | `routes/s3EmployeeUpload.js` |

> ⚠All routes require proper request body formats. Authentication-protected routes may require a valid token or session.



## Folder Structure
/SafeX3.0-Backend
/SAFE-X-BACKEND
├── aws/ # AWS integrations
│ ├── awsConfig.js # AWS SDK configuration
│ ├── rekognition.js # Face recognition logic
│ └── uploadToS3.js # File upload to S3

├── config/
│ └── db.js # MongoDB connection setup

├── models/ # MongoDB data models
│ ├── OTPModel.js
│ └── User.js

├── routes/ # Express route handlers
│ ├── auth.js # Register & login routes
│ ├── forgotPassword.js # Forgot password handling
│ ├── otp.js # OTP generation & validation
│ ├── rekognition.js # Routes triggering Rekognition
│ ├── s3.js # File upload/download routes
│ └── s3EmployeeUpload.js # Additional S3 upload logic

├── .env # Environment variables
├── server.js # Express entry point
├── package.json # Dependencies and scripts
└── package-lock.json

---

##  Security

- Hashed passwords using bcrypt
- Face data securely stored in S3
- IAM role-based access for Lambda functions
- CORS configuration for frontend-backend integration
- Logs and metrics using AWS CloudWatch

---

##  Local Testing

Run the backend depending on the language stack you're testing:

# For Python (if used for Lambda simulation and testing )
pip install -r requirements.txt
python app.py

# For Node.js backend
npm install
npm start 

Author
Alok Raj
Email: rajalok10375@gmail.com

