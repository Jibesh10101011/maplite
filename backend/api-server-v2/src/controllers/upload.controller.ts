import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.S3_CLIENT_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_CLIENT_SECRET_ACCESS_KEY!,
  },
});

export const handleUploadFile = asyncHandler(async (
  request: Request,
  response: Response
): Promise<void> => {
    const file = request.file;
    if (!file || file.size === 0) {
        throw new ApiError(400, "Invalid or missing file");
    }

    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    const key = `Profile/user-static-files/${uniqueFileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    try {
        await s3Client.send(command);
    } catch (err) {
        console.error("S3 Upload Error:", err);
        throw new ApiError(500, "Failed to upload file to S3");
    }

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    response.status(200).json(
        new ApiResponse(200, { fileUrl }, "File successfully uploaded")
    );
});
