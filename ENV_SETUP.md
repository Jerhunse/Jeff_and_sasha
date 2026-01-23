# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_platform?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Generate with: openssl rand -base64 32

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email Provider (Resend or AWS SES)
EMAIL_PROVIDER="auto"  # Options: "resend", "ses", or "auto" (tries Resend first, falls back to SES)
RESEND_API_KEY=""  # Required if using Resend
EMAIL_FROM="noreply@yourdomain.com"

# AWS Configuration (Optional - for S3 file storage and SES email)
# AWS credentials are loaded from ~/.aws/credentials or environment variables
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""  # Your S3 bucket name for media storage
AWS_S3_PUBLIC_URL=""  # Optional: CloudFront URL or custom domain (e.g., https://cdn.yourdomain.com)
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"  # Must be verified in SES

# App Configuration
NODE_ENV="development"
```

## Quick Start

1. Copy the above to `.env`
2. Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
3. Set up your database (PostgreSQL recommended)
4. Run `npx prisma generate`
5. Run `npx prisma migrate dev`
6. Run `npm run dev`

