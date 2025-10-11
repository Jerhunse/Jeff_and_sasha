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

# Email Provider (Resend)
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

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

