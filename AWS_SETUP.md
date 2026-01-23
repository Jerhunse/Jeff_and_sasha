# AWS Setup Guide

This guide explains how to configure AWS services for the wedding platform.

## Prerequisites

- AWS Account (Account ID: 676467514398)
- AWS CLI configured (already done ✅)
- AWS credentials configured in `~/.aws/credentials`

## Services Used

### 1. Amazon S3 - File Storage

S3 is used for storing media files (images, photos) uploaded through the admin panel.

#### Setup Steps

1. **Create an S3 Bucket**
   ```bash
   aws s3 mb s3://your-wedding-platform-media --region us-east-1
   ```

2. **Configure Bucket Permissions**
   
   For public read access (if you want direct URLs):
   ```bash
   aws s3api put-bucket-policy --bucket your-wedding-platform-media --policy '{
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::your-wedding-platform-media/*"
     }]
   }'
   ```

   **OR** for private bucket with CloudFront (recommended for production):
   - Keep bucket private
   - Set up CloudFront distribution
   - Use CloudFront URL in `AWS_S3_PUBLIC_URL`

3. **Set CORS Configuration** (if uploading from browser)
   ```bash
   aws s3api put-bucket-cors --bucket your-wedding-platform-media --cors-configuration '{
     "CORSRules": [{
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }]
   }'
   ```

4. **Update Environment Variables**
   ```env
   AWS_S3_BUCKET="your-wedding-platform-media"
   AWS_REGION="us-east-1"
   # Optional: If using CloudFront
   AWS_S3_PUBLIC_URL="https://d1234567890.cloudfront.net"
   ```

#### IAM Policy for S3

Your IAM user needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-wedding-platform-media/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-wedding-platform-media"
    }
  ]
}
```

### 2. Amazon SES - Email Sending

SES can be used as an alternative to Resend for sending emails.

#### Setup Steps

1. **Verify Your Email Domain or Email Address**
   - Go to AWS SES Console
   - Navigate to "Verified identities"
   - Click "Create identity"
   - Choose "Domain" (recommended) or "Email address"
   - Follow verification steps

2. **Request Production Access** (if needed)
   - By default, SES is in "sandbox mode"
   - In sandbox mode, you can only send to verified email addresses
   - Request production access to send to any email address
   - Go to SES Console → Account dashboard → Request production access

3. **Update Environment Variables**
   ```env
   AWS_SES_FROM_EMAIL="noreply@yourdomain.com"  # Must be verified
   AWS_REGION="us-east-1"
   ```

#### IAM Policy for SES

Your IAM user needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## Usage in Code

### S3 File Upload

The media upload route automatically uses S3 if `AWS_S3_BUCKET` is configured:

```typescript
import { uploadToS3 } from "@/lib/aws"

const url = await uploadToS3({
  key: "media/couple-id/filename.jpg",
  body: buffer,
  contentType: "image/jpeg",
})
```

### SES Email Sending

You can use SES as an alternative to Resend:

```typescript
import { sendSESEmail } from "@/lib/aws"

const result = await sendSESEmail({
  to: "guest@example.com",
  subject: "Wedding Invitation",
  html: "<h1>You're Invited!</h1>",
})
```

## Testing

### Test S3 Connection
```bash
aws s3 ls s3://your-wedding-platform-media
```

### Test SES
```bash
aws ses send-email \
  --from noreply@yourdomain.com \
  --to verified-email@example.com \
  --subject "Test Email" \
  --text "This is a test email"
```

## Security Best Practices

1. **Never commit credentials to git** - Use environment variables or `~/.aws/credentials`
2. **Use IAM roles** - In production (EC2/Lambda), use IAM roles instead of access keys
3. **Restrict IAM policies** - Only grant minimum required permissions
4. **Enable S3 bucket versioning** - For backup and recovery
5. **Use CloudFront** - For private S3 buckets with signed URLs
6. **Enable S3 bucket encryption** - At rest encryption (SSE-S3 or SSE-KMS)

## Troubleshooting

### S3 Upload Fails
- Check bucket name is correct in `AWS_S3_BUCKET`
- Verify IAM permissions
- Check bucket region matches `AWS_REGION`
- Ensure bucket exists: `aws s3 ls s3://your-bucket-name`

### SES Email Not Sending
- Verify sender email/domain in SES Console
- Check if account is in sandbox mode (can only send to verified emails)
- Verify IAM permissions
- Check SES sending limits and quotas

### Credentials Not Found
- Verify `~/.aws/credentials` exists and has correct format
- Check environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Test with: `aws sts get-caller-identity`

## Cost Considerations

- **S3**: ~$0.023 per GB/month storage, $0.005 per 1,000 PUT requests
- **SES**: First 62,000 emails/month free, then $0.10 per 1,000 emails
- **CloudFront**: Additional cost for CDN (optional)

Monitor usage in AWS Cost Explorer.
