import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
/**
 * Create S3 client with configuration
 */
export function createS3Client(config) {
    return new S3Client({
        endpoint: config.endpoint,
        region: config.region,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
        forcePathStyle: true, // Required for MinIO
    });
}
/**
 * Upload a file to S3 bucket with date-based folder structure
 * Path format: YYYY-MM-DD/uuid.extension
 */
export async function uploadFileToS3(s3Client, bucketName, endpoint, { file, fileName, contentType }) {
    try {
        // Create today's date folder
        const today = new Date();
        const dateFolder = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        // Generate UUID for the file
        const fileId = randomUUID();
        // Extract file extension
        const originalName = fileName || file.name;
        const fileExtension = originalName.split('.').pop() || '';
        // Create the S3 key (path)
        const key = `${dateFolder}/${fileId}${fileExtension ? `.${fileExtension}` : ''}`;
        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType || file.type || 'application/octet-stream',
            ContentLength: file.size,
        });
        await s3Client.send(command);
        // Return the result
        return {
            key,
            url: `${endpoint}/${bucketName}/${key}`,
            size: file.size,
        };
    }
    catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Fetch a file from S3 bucket
 */
export async function fetchFileFromS3(s3Client, bucketName, key) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const response = await s3Client.send(command);
        if (!response.Body) {
            throw new Error('No body in S3 response');
        }
        // Convert stream to string
        const chunks = [];
        const reader = response.Body.transformToWebStream().getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            chunks.push(value);
        }
        const buffer = Buffer.concat(chunks);
        return buffer.toString('utf-8');
    }
    catch (error) {
        console.error('Error fetching file from S3:', error);
        throw new Error(`Failed to fetch file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Delete a file from S3 bucket
 */
export async function deleteFileFromS3(s3Client, bucketName, key) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        await s3Client.send(command);
    }
    catch (error) {
        console.error('Error deleting file from S3:', error);
        throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Get a file stream from S3 bucket (for streaming files)
 */
export async function getFileStreamFromS3(s3Client, bucketName, key) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const response = await s3Client.send(command);
        if (!response.Body) {
            throw new Error('No body in S3 response');
        }
        return {
            Body: response.Body,
            ContentType: response.ContentType,
            ContentLength: response.ContentLength,
        };
    }
    catch (error) {
        console.error('Error getting file stream from S3:', error);
        throw new Error(`Failed to get file stream from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Get the public URL for a file stored in S3
 */
export function getFileUrl(endpoint, bucketName, key) {
    return `${endpoint}/${bucketName}/${key}`;
}
