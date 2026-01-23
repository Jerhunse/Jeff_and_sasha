# Netlify Deployment Guide

This guide will walk you through deploying your wedding platform to Netlify.

## Prerequisites

- A Netlify account (sign up at [netlify.com](https://www.netlify.com))
- A PostgreSQL database (can use Netlify Postgres, Supabase, or any PostgreSQL provider)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Install Netlify CLI (Optional but Recommended)

```bash
npm install -g netlify-cli
```

Or use npx:
```bash
npx netlify-cli
```

## Step 2: Install Required Dependencies

Make sure you have the Netlify Next.js plugin installed:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

## Step 3: Update Build Script

The build script in `package.json` should already be configured. Verify it includes:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "prisma generate"
  }
}
```

**Note:** The `postbuild` script ensures Prisma Client is generated after the build.

## Step 4: Set Up Environment Variables

You'll need to configure the following environment variables in Netlify:

### Required Environment Variables

1. **Database Connection**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   ```

2. **NextAuth Configuration**
   ```
   AUTH_SECRET=your-secret-key-here (generate with: openssl rand -base64 32)
   AUTH_URL=https://your-site.netlify.app (or your custom domain)
   ```

3. **NextAuth Providers** (at least one)
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
   
   OR
   
   ```
   RESEND_API_KEY=your-resend-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Optional Environment Variables

4. **Email Service** (choose one or both)
   ```
   EMAIL_PROVIDER=auto (or "resend" or "ses")
   RESEND_API_KEY=your-resend-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

5. **AWS Services** (if using S3/SES)
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_S3_PUBLIC_URL=https://your-cdn-domain.com (optional, for CloudFront)
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   ```

6. **Supabase** (if using)
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

7. **Other**
   ```
   NODE_ENV=production
   ```

### How to Set Environment Variables in Netlify

**Via Netlify Dashboard:**
1. Go to your site settings
2. Navigate to **Build & deploy** → **Environment variables**
3. Click **Add variable** for each variable
4. Set the scope (All scopes, Production, Deploy previews, Branch deploys)

**Via Netlify CLI:**
```bash
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set AUTH_SECRET "your-secret"
# ... etc
```

## Step 5: Database Setup

### Option A: Run Migrations Manually

Before your first deployment, run Prisma migrations on your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Run migrations
npx prisma migrate deploy
```

### Option B: Run Migrations During Build

You can add a build command that runs migrations. Update your `netlify.toml`:

```toml
[build]
  command = "npx prisma migrate deploy && npm run build"
```

**⚠️ Warning:** This approach runs migrations on every build. Only use if you want automatic migrations.

### Option C: Use Netlify Build Plugin

Create a build plugin or use a post-build hook. Add to `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"

[build]
  command = "npm run build"
  publish = ".next"
```

Then create a build script that runs migrations:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "prisma generate",
    "migrate": "prisma migrate deploy"
  }
}
```

## Step 6: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended for First Deployment)

1. **Connect Repository:**
   - Log in to [Netlify Dashboard](https://app.netlify.com)
   - Click **Add new site** → **Import an existing project**
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

2. **Configure Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (Netlify plugin will handle this)
   - **Base directory:** (leave empty unless your app is in a subdirectory)

3. **Set Environment Variables:**
   - Go to **Site settings** → **Environment variables**
   - Add all required variables (see Step 4)

4. **Deploy:**
   - Click **Deploy site**
   - Netlify will build and deploy your site

### Option B: Deploy via Netlify CLI

1. **Login:**
   ```bash
   netlify login
   ```

2. **Initialize Site:**
   ```bash
   netlify init
   ```
   Follow the prompts to:
   - Link to existing site or create new
   - Set build command: `npm run build`
   - Set publish directory: `.next`

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

   For a preview deployment first:
   ```bash
   netlify deploy
   ```

## Step 7: Run Database Migrations

After deployment, run migrations on your production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

Or use Netlify CLI with environment variables:
```bash
netlify env:get DATABASE_URL | xargs -I {} npx prisma migrate deploy --schema=./prisma/schema.prisma
```

## Step 8: Seed Database (Optional)

If you need to seed your production database:

```bash
export DATABASE_URL="your-production-database-url"
npm run seed
```

**⚠️ Warning:** Only run seed scripts on production if you're sure it's safe. Consider creating a separate seed script for production.

## Step 9: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow Netlify's DNS configuration instructions
4. Update your `AUTH_URL` environment variable to match your custom domain

## Step 10: Set Up Continuous Deployment

Netlify automatically sets up continuous deployment when you connect a Git repository. Every push to your main branch will trigger a new deployment.

### Branch Deploys

- **Production:** Deploys from your main/master branch
- **Deploy Previews:** Automatic previews for pull requests
- **Branch Deploys:** Deploy specific branches

## Troubleshooting

### Build Fails with Prisma Errors

**Problem:** `PrismaClient` not found or schema not generated

**Solution:**
1. Ensure `prisma generate` runs in your build process
2. Add to `package.json`:
   ```json
   {
     "scripts": {
       "postbuild": "prisma generate"
     }
   }
   ```

### Database Connection Errors

**Problem:** Cannot connect to database during build

**Solution:**
1. Verify `DATABASE_URL` is set correctly in Netlify environment variables
2. Ensure your database allows connections from Netlify's IP ranges
3. Check SSL mode is set correctly (`?sslmode=require`)

### NextAuth Errors

**Problem:** Authentication not working

**Solution:**
1. Verify `AUTH_SECRET` is set (must be at least 32 characters)
2. Verify `AUTH_URL` matches your Netlify site URL
3. Check that callback URLs are configured correctly in your OAuth providers (Google, etc.)

### Function Timeout Errors

**Problem:** API routes timing out

**Solution:**
1. Netlify Functions have a 10-second timeout on free tier, 26 seconds on paid
2. Optimize long-running operations
3. Consider using background jobs for heavy processing

### Static File Serving Issues

**Problem:** Images or assets not loading

**Solution:**
1. Ensure files are in the `public/` directory
2. Check that `next.config.ts` doesn't have conflicting output settings
3. Verify Netlify plugin is installed and configured

## Performance Optimization

### Enable Edge Functions (Optional)

For better performance, you can use Netlify Edge Functions for certain routes. Update `netlify.toml`:

```toml
[[edge_functions]]
  path = "/api/rsvp/*"
  function = "rsvp-handler"
```

### Caching Strategy

The `netlify.toml` already includes caching headers for static assets. Adjust as needed for your use case.

## Monitoring and Logs

- **Build Logs:** Available in Netlify Dashboard under **Deploys**
- **Function Logs:** Available in **Functions** tab
- **Analytics:** Enable Netlify Analytics in site settings

## Security Considerations

1. **Never commit secrets:** All sensitive data should be in environment variables
2. **Use HTTPS:** Netlify provides free SSL certificates
3. **Database Security:** Use connection pooling and SSL for database connections
4. **Rate Limiting:** Consider adding rate limiting for API routes

## Cost Considerations

- **Free Tier:** 100GB bandwidth, 300 build minutes/month
- **Pro Tier:** $19/month - More bandwidth, build minutes, and features
- **Database:** Consider using Netlify Postgres, Supabase free tier, or other providers

## Next Steps

1. Set up monitoring and error tracking (e.g., Sentry)
2. Configure backup strategy for your database
3. Set up staging environment for testing
4. Configure custom domain and email
5. Set up CI/CD workflows for automated testing

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

## Support

If you encounter issues:
1. Check Netlify build logs
2. Review function logs
3. Verify environment variables are set correctly
4. Test database connectivity
5. Check Next.js and Netlify documentation
