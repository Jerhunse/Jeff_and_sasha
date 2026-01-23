import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// ============================================
// AWS Configuration
// ============================================

// AWS credentials are automatically loaded from:
// 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
// 2. ~/.aws/credentials file
// 3. IAM role (when running on EC2/Lambda)

const AWS_REGION = process.env.AWS_REGION || "us-east-1"
const S3_BUCKET = process.env.AWS_S3_BUCKET
const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "noreply@wedding.app"

// ============================================
// S3 Client
// ============================================

export const s3Client = new S3Client({
  region: AWS_REGION,
  // Credentials are automatically loaded from environment or ~/.aws/credentials
})

// ============================================
// SES Client
// ============================================

export const sesClient = new SESClient({
  region: AWS_REGION,
})

// ============================================
// S3 Utilities
// ============================================

export interface UploadToS3Options {
  key: string
  body: Buffer | Uint8Array | string
  contentType: string
  bucket?: string
  metadata?: Record<string, string>
}

/**
 * Upload a file to S3
 * 
 * @param options - Upload options
 * @returns The S3 object URL
 */
export async function uploadToS3(options: UploadToS3Options): Promise<string> {
  if (!S3_BUCKET && !options.bucket) {
    throw new Error("S3 bucket not configured. Set AWS_S3_BUCKET environment variable.")
  }

  const bucket = options.bucket || S3_BUCKET!

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      Metadata: options.metadata,
    })

    await s3Client.send(command)

    // Return the public URL (adjust based on your bucket configuration)
    // If bucket is public: `https://${bucket}.s3.${AWS_REGION}.amazonaws.com/${options.key}`
    // If using CloudFront: `https://${CLOUDFRONT_DOMAIN}/${options.key}`
    const url = process.env.AWS_S3_PUBLIC_URL 
      ? `${process.env.AWS_S3_PUBLIC_URL}/${options.key}`
      : `https://${bucket}.s3.${AWS_REGION}.amazonaws.com/${options.key}`

    return url
  } catch (error: any) {
    console.error("S3 upload error:", error)
    throw new Error(`Failed to upload to S3: ${error.message}`)
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string, bucket?: string): Promise<void> {
  if (!S3_BUCKET && !bucket) {
    throw new Error("S3 bucket not configured. Set AWS_S3_BUCKET environment variable.")
  }

  const bucketName = bucket || S3_BUCKET!

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error: any) {
    console.error("S3 delete error:", error)
    throw new Error(`Failed to delete from S3: ${error.message}`)
  }
}

/**
 * Generate a presigned URL for temporary access to an S3 object
 * Useful for private files that need temporary public access
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600,
  bucket?: string
): Promise<string> {
  if (!S3_BUCKET && !bucket) {
    throw new Error("S3 bucket not configured. Set AWS_S3_BUCKET environment variable.")
  }

  const bucketName = bucket || S3_BUCKET!

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    return url
  } catch (error: any) {
    console.error("S3 presigned URL error:", error)
    throw new Error(`Failed to generate presigned URL: ${error.message}`)
  }
}

// ============================================
// SES Utilities
// ============================================

export interface SendSESEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string[]
}

/**
 * Send an email using AWS SES
 * 
 * Note: Your SES account must be out of sandbox mode to send to any email address.
 * In sandbox mode, you can only send to verified email addresses.
 */
export async function sendSESEmail(options: SendSESEmailOptions) {
  try {
    const recipients = Array.isArray(options.to) ? options.to : [options.to]

    const command = new SendEmailCommand({
      Source: options.from || AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: options.html,
            Charset: "UTF-8",
          },
          ...(options.text && {
            Text: {
              Data: options.text,
              Charset: "UTF-8",
            },
          }),
        },
      },
      ...(options.replyTo && options.replyTo.length > 0 && {
        ReplyToAddresses: options.replyTo,
      }),
    })

    const response = await sesClient.send(command)
    return {
      success: true,
      messageId: response.MessageId,
    }
  } catch (error: any) {
    console.error("SES send error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// ============================================
// Helper: Check AWS Configuration
// ============================================

export function isAWSConfigured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_PROFILE ||
    // Credentials file will be checked automatically by SDK
    true // SDK will check ~/.aws/credentials
  )
}

export function isS3Configured(): boolean {
  return !!S3_BUCKET
}

export function isSESConfigured(): boolean {
  return isAWSConfigured()
}
