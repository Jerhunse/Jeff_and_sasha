# AWS App Runner Deployment Guide

This guide walks you through deploying the wedding platform to AWS App Runner.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (optional, for CLI deployment)
- PostgreSQL database accessible from AWS (RDS, external database, etc.)
- Docker installed locally (for testing the Dockerfile)

## Overview

AWS App Runner is a fully managed service that automatically builds and deploys containerized web applications. This deployment uses Docker to containerize the Next.js application.

## Architecture

```
┌─────────────────┐
│  AWS App Runner │
│  (Container)    │
│                 │
│  Next.js App    │───┐
│  Port: 3000     │   │
└─────────────────┘   │
                      │
                      ▼
              ┌───────────────┐
              │  PostgreSQL   │
              │  (RDS/External)│
              └───────────────┘
```

## Step 1: Prepare Your Database

### Option A: AWS RDS PostgreSQL (Recommended)

1. **Create RDS PostgreSQL Instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier wedding-platform-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password YourSecurePassword \
     --allocated-storage 20 \
     --vpc-security-group-ids sg-xxxxxxxxx \
     --publicly-accessible
   ```

2. **Note the endpoint** (e.g., `wedding-platform-db.xxxxx.us-east-1.rds.amazonaws.com:5432`)

3. **Update security group** to allow inbound connections from App Runner (or use VPC configuration)

### Option B: External PostgreSQL Database

Ensure your database is:
- Accessible from the internet (or configure VPC for App Runner)
- Has proper firewall rules
- Uses SSL connections (recommended)

## Step 2: Configure Environment Variables

Prepare all required environment variables. You'll set these in App Runner console:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/wedding_platform?schema=public&sslmode=require"

# NextAuth.js
NEXTAUTH_URL="https://your-app-runner-url.us-east-1.awsapprunner.com"
NEXTAUTH_SECRET="your-generated-secret-here"

# Application
NODE_ENV="production"
PORT="3000"
```

### Optional Variables

```env
# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email Provider
EMAIL_PROVIDER="auto"
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# AWS Configuration
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-wedding-platform-media"
AWS_S3_PUBLIC_URL=""
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""

# Stripe (Optional)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 3: Deploy via AWS Console

### 3.1 Create App Runner Service

1. **Navigate to AWS App Runner Console**
   - Go to [AWS Console](https://console.aws.amazon.com/apprunner)
   - Click "Create service"

2. **Source Configuration**
   - **Source**: Choose "Source code repository" or "Container image"
   - **If using source code**:
     - Connect your GitHub/GitLab repository
     - Branch: `main` (or your production branch)
     - Build command: (leave default, App Runner will use Dockerfile)
     - Runtime: Docker
   - **If using container image**:
     - Image repository: Your ECR repository URL
     - Image tag: `latest`

3. **Deployment Settings**
   - **Deployment trigger**: Automatic (on push) or Manual
   - **Build configuration**: Use `apprunner.yaml` or Dockerfile

4. **Service Settings**
   - **Service name**: `wedding-platform`
   - **Virtual CPU**: 1 vCPU (minimum)
   - **Memory**: 2 GB (minimum for Next.js)
   - **Port**: `3000`
   - **Environment variables**: Add all variables from Step 2

5. **Auto Scaling**
   - **Min size**: 1
   - **Max size**: 10 (adjust based on expected traffic)
   - **Concurrency**: 100 requests per instance

6. **Health Check** (optional)
   - **Health check path**: `/api/health` (if you have one) or `/`
   - **Health check interval**: 10 seconds
   - **Timeout**: 5 seconds
   - **Healthy threshold**: 1
   - **Unhealthy threshold**: 5

7. **Review and Create**
   - Review all settings
   - Click "Create & deploy"

### 3.2 Configure VPC (If Database is in VPC)

If your database is in a VPC:

1. **Create VPC Connector** (if needed)
   ```bash
   aws apprunner create-vpc-connector \
     --vpc-connector-name wedding-platform-vpc \
     --subnets subnet-xxxxx subnet-yyyyy \
     --security-groups sg-xxxxx
   ```

2. **Attach VPC Connector to Service**
   - In App Runner service settings
   - Network: Select your VPC connector
   - This allows App Runner to access RDS in private subnets

## Step 4: Run Database Migrations

After deployment, run Prisma migrations:

### Option A: Via AWS Systems Manager (SSM)

1. **Create a migration script** (temporary):
   ```bash
   # Connect to App Runner instance via SSM
   aws ssm start-session --target <instance-id>
   ```

2. **Run migrations**:
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

### Option B: Via Local Machine (Recommended)

If your database is publicly accessible:

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@host:5432/wedding_platform?schema=public"

# Run migrations
npx prisma migrate deploy
```

### Option C: Add Migration to Dockerfile (For Automated Deployments)

You can modify the Dockerfile to run migrations on startup:

```dockerfile
# Add to Dockerfile before CMD
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Update CMD to run migrations first
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

**⚠️ Tradeoff**: This runs migrations on every container start, which may cause issues if multiple containers start simultaneously. Consider using a migration job instead.

## Step 5: Verify Deployment

1. **Check Service Status**
   - Go to App Runner console
   - Service should show "Running" status
   - Note the service URL (e.g., `https://xxxxx.us-east-1.awsapprunner.com`)

2. **Test the Application**
   ```bash
   curl https://your-service-url.us-east-1.awsapprunner.com
   ```

3. **Check Logs**
   - In App Runner console, go to "Logs" tab
   - Verify no errors during startup
   - Check database connection logs

4. **Update NEXTAUTH_URL**
   - After deployment, update `NEXTAUTH_URL` environment variable with the actual App Runner URL
   - Redeploy if needed

## Step 6: Custom Domain (Optional)

1. **Request Custom Domain in App Runner**
   - Go to service → Custom domains
   - Add your domain (e.g., `wedding.yourdomain.com`)
   - Follow DNS configuration instructions

2. **Update DNS Records**
   - Add CNAME record pointing to App Runner domain
   - Wait for DNS propagation

3. **Update Environment Variables**
   - Update `NEXTAUTH_URL` to use custom domain
   - Redeploy service

## Step 7: Configure AWS Services

### S3 for Media Storage

1. **Create S3 Bucket** (if not already done)
   ```bash
   aws s3 mb s3://your-wedding-platform-media --region us-east-1
   ```

2. **Configure IAM Role for App Runner**
   - App Runner service needs IAM role with S3 permissions
   - Attach policy with S3 read/write access

3. **Set Environment Variables**
   - `AWS_S3_BUCKET`: Your bucket name
   - `AWS_REGION`: Your AWS region

### SES for Email

1. **Verify Email/Domain in SES**
2. **Request Production Access** (if needed)
3. **Set Environment Variables**
   - `AWS_SES_FROM_EMAIL`: Verified email address
   - `EMAIL_PROVIDER`: `ses` or `auto`

## Monitoring & Maintenance

### View Logs

```bash
# Via AWS Console
# Navigate to App Runner → Your Service → Logs

# Via AWS CLI
aws apprunner list-operations --service-arn <service-arn>
```

### Monitor Metrics

- **CPU Utilization**: Should stay below 80%
- **Memory Utilization**: Monitor for memory leaks
- **Request Count**: Track traffic patterns
- **Error Rate**: Should be minimal
- **Response Time**: Should be < 500ms for most requests

### Scaling

App Runner automatically scales based on:
- CPU utilization
- Memory utilization
- Request concurrency

Adjust min/max instances based on your traffic patterns.

## Troubleshooting

### Issue: Application Won't Start

**Symptoms**: Service shows "Failed" status

**Solutions**:
1. Check logs in App Runner console
2. Verify all environment variables are set correctly
3. Check database connectivity
4. Verify Dockerfile builds correctly locally:
   ```bash
   docker build -t wedding-platform .
   docker run -p 3000:3000 --env-file .env wedding-platform
   ```

### Issue: Database Connection Errors

**Symptoms**: Errors about database connection in logs

**Solutions**:
1. Verify `DATABASE_URL` is correct
2. Check security group allows App Runner IPs
3. If using RDS, ensure it's publicly accessible or VPC connector is configured
4. Test connection from local machine:
   ```bash
   psql $DATABASE_URL
   ```

### Issue: Prisma Client Not Found

**Symptoms**: Errors about `@prisma/client` not found

**Solutions**:
1. Ensure `prisma generate` runs during build (included in Dockerfile)
2. Check that Prisma files are copied in Dockerfile
3. Verify `node_modules/.prisma` is included in build

### Issue: Static Files Not Loading

**Symptoms**: Images, CSS, or JS files return 404

**Solutions**:
1. Verify `.next/static` is copied in Dockerfile
2. Check `next.config.ts` has `output: 'standalone'`
3. Ensure public files are in `/app/public` directory

### Issue: Environment Variables Not Working

**Symptoms**: App uses wrong values or defaults

**Solutions**:
1. Verify variables are set in App Runner console
2. Check variable names match exactly (case-sensitive)
3. Redeploy service after changing variables
4. Restart service if needed

## Cost Optimization

### Estimated Monthly Costs

- **App Runner**: ~$7-25/month (1 instance, 1 vCPU, 2GB RAM)
- **RDS PostgreSQL (db.t3.micro)**: ~$15/month
- **S3 Storage**: ~$0.023/GB/month
- **Data Transfer**: ~$0.09/GB (first 100GB free)

### Cost-Saving Tips

1. **Use smaller instance sizes** if traffic is low
2. **Set min instances to 0** if you can tolerate cold starts (not available in App Runner, but you can use smaller instances)
3. **Use RDS Reserved Instances** for predictable workloads
4. **Enable S3 lifecycle policies** to move old media to cheaper storage
5. **Monitor and optimize** database queries to reduce RDS costs

## Security Best Practices

1. **Use Secrets Manager** for sensitive environment variables
   - Store secrets in AWS Secrets Manager
   - Reference in App Runner environment variables

2. **Enable SSL/TLS**
   - App Runner provides HTTPS by default
   - Use custom domain with SSL certificate

3. **Database Security**
   - Use SSL connections (`sslmode=require` in DATABASE_URL)
   - Restrict database access to App Runner security group
   - Use strong passwords
   - Enable RDS encryption at rest

4. **IAM Roles**
   - Use IAM roles instead of access keys for AWS services
   - Follow principle of least privilege

5. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Use automated dependency scanning

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to App Runner

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and push to ECR
        run: |
          # Build Docker image
          docker build -t wedding-platform .
          # Push to ECR (if using container image source)
          # Or trigger App Runner deployment
```

## Rollback

If deployment fails:

1. **Via Console**:
   - Go to App Runner service
   - Click "Deployments" tab
   - Select previous successful deployment
   - Click "Rollback"

2. **Via CLI**:
   ```bash
   aws apprunner start-deployment \
     --service-arn <service-arn> \
     --source-configuration <previous-config>
   ```

## Next Steps

- Set up monitoring and alerts
- Configure custom domain
- Set up CI/CD pipeline
- Implement backup strategy for database
- Configure CDN (CloudFront) for static assets
- Set up staging environment

## Support

For issues or questions:
- Check [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- Review application logs in App Runner console
- Check [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
