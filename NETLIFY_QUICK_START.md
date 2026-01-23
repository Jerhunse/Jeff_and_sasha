# Netlify Quick Start Guide

## TL;DR - Deploy in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Connect to Netlify

**Option A: Via Dashboard (Easiest)**
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next` (or leave empty - plugin handles it)

**Option B: Via CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
```

### 3. Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

**Required:**
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=https://your-site.netlify.app
```

**At least one auth provider:**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**OR**

```
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Run Database Migrations

```bash
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
```

### 5. Deploy

**Via Dashboard:** Click "Deploy site"

**Via CLI:**
```bash
netlify deploy --prod
```

## Common Issues

### Build Fails
- ✅ Ensure `@netlify/plugin-nextjs` is installed
- ✅ Check that `DATABASE_URL` is set correctly
- ✅ Verify Node version is 20 (set in netlify.toml)

### Database Connection Errors
- ✅ Check database allows external connections
- ✅ Verify SSL mode: `?sslmode=require` in DATABASE_URL
- ✅ Test connection locally with production URL

### Auth Not Working
- ✅ `AUTH_SECRET` must be at least 32 characters
- ✅ `AUTH_URL` must match your Netlify site URL exactly
- ✅ Check OAuth provider callback URLs

## Next Steps

1. Set up custom domain
2. Configure email service (Resend or AWS SES)
3. Set up monitoring
4. Configure backups

For detailed instructions, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
