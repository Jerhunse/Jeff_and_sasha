# Docker & AWS ECR Setup - Complete ✓

Your Wedding Platform application has been fully dockerized and is ready for AWS ECR deployment!

## ✅ What's Been Completed

### 1. Docker Configuration
- ✓ **Next.js Standalone Output** - Enabled in `next.config.ts`
- ✓ **Multi-stage Dockerfile** - Optimized for production (~150-200MB)
- ✓ **Docker Compose** - Local testing environment
- ✓ **Health Check Endpoint** - `/api/health` for monitoring
- ✓ **.dockerignore** - Optimized build context

### 2. AWS ECR Integration
- ✓ **Automated Push Script** - `scripts/push-to-ecr.sh`
- ✓ **ECR Repository Creation** - Automatic setup
- ✓ **Authentication** - Handles Docker/ECR login
- ✓ **Image Tagging** - Both `latest` and git commit tags

### 3. Documentation
- ✓ **Comprehensive Guide** - `DOCKER_ECR_DEPLOYMENT.md` (full details)
- ✓ **Quick Start** - `QUICK_DEPLOY_ECR.md` (fast deployment)
- ✓ **Environment Template** - `.env.example` (all variables)

### 4. App Runner Ready
- ✓ Port 3000 configured
- ✓ Health check endpoint
- ✓ Environment variables documented
- ✓ Deployment commands provided

## 📁 Files Created/Modified

```
wedding-platform/
├── next.config.ts                    # ✓ Modified - standalone output
├── Dockerfile                        # ✓ Verified - multi-stage build
├── docker-compose.yml                # ✓ Created - local testing
├── .env.example                      # ✓ Created - env template
├── .dockerignore                     # ✓ Verified - optimized
├── scripts/
│   └── push-to-ecr.sh               # ✓ Created - ECR deployment
├── app/api/health/
│   └── route.ts                     # ✓ Created - health endpoint
├── DOCKER_ECR_DEPLOYMENT.md         # ✓ Created - full docs
├── QUICK_DEPLOY_ECR.md              # ✓ Created - quick start
└── DOCKER_SETUP_SUMMARY.md          # ✓ This file
```

## 🚀 Deploy Right Now

### Single Command:
```bash
./scripts/push-to-ecr.sh
```

### Then Create App Runner Service:

**Option 1: AWS Console**
1. Go to https://console.aws.amazon.com/apprunner
2. Create service → Container registry
3. Paste ECR image URI from script output
4. Set port to 3000
5. Add environment variables

**Option 2: AWS CLI**
```bash
aws apprunner create-service \
  --service-name wedding-platform \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "<ECR-URI>:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {"Port": "3000"}
    }
  }' \
  --instance-configuration '{"Cpu": "1 vCPU", "Memory": "2 GB"}'
```

## 🔧 Key Features

### Docker Image
- **Base:** Node 20 Alpine (lightweight)
- **Build:** Multi-stage for optimization
- **Size:** ~150-200MB compressed
- **Layers:** Cached for fast rebuilds
- **Security:** Non-root user, minimal attack surface

### Deployment Script
- Checks prerequisites (AWS CLI, Docker)
- Creates ECR repository if needed
- Authenticates automatically
- Tags with git commit for versioning
- Provides clear next steps

### Local Testing
```bash
docker-compose up --build
# App runs on http://localhost:3000
```

## 📋 Environment Variables

Required for App Runner:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.awsapprunner.com
NEXTAUTH_SECRET=<generate-random>
AUTH_TRUST_HOST=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=<your-bucket>
AWS_SES_FROM_EMAIL=<email>
```

See `.env.example` for complete list.

## 🔍 Verification Steps

### 1. Test Docker Build Locally
```bash
docker build -t wedding-platform:test .
```

### 2. Test Container Locally
```bash
docker-compose up
# Visit http://localhost:3000
# Check http://localhost:3000/api/health
```

### 3. Push to ECR
```bash
./scripts/push-to-ecr.sh
```

### 4. Verify in AWS
```bash
aws ecr describe-images --repository-name wedding-platform
```

## 💡 Next Steps

1. **Deploy Now:**
   ```bash
   ./scripts/push-to-ecr.sh
   ```

2. **Create App Runner Service** (see options above)

3. **Configure Environment Variables** in App Runner console

4. **Test Deployment:**
   ```bash
   curl https://your-app.awsapprunner.com/api/health
   ```

5. **Optional: Custom Domain**
   - Add custom domain in App Runner
   - Configure DNS CNAME

6. **Optional: CI/CD**
   - See GitHub Actions example in `DOCKER_ECR_DEPLOYMENT.md`

## 📊 Monitoring

### Health Check
```bash
curl https://your-app.awsapprunner.com/api/health
```

### App Runner Logs
- Available in App Runner console
- Or via CloudWatch Logs: `/aws/apprunner/wedding-platform/service`

### AWS CLI
```bash
# List services
aws apprunner list-services

# Service details
aws apprunner describe-service --service-arn <arn>

# Trigger deployment
aws apprunner start-deployment --service-arn <arn>
```

## 💰 Estimated Costs

**App Runner (1 vCPU, 2GB RAM):**
- Active: ~$0.064/hour
- Monthly: ~$50-100 (depending on traffic)

**ECR Storage:**
- ~$0.10/GB/month
- Keep 3-5 recent images

**Total:** ~$60-110/month for production workload

## 🔒 Security Notes

- Docker runs as non-root user (nextjs:1001)
- ECR image scanning enabled
- Environment variables via App Runner (not in image)
- Use AWS Secrets Manager for sensitive data
- Health check endpoint doesn't expose sensitive info

## 🆘 Troubleshooting

### Build Fails
- Check Docker is running
- Verify network connectivity
- Retry - npm network issues are transient

### Push Fails
- Run `aws configure` to set credentials
- Check AWS permissions (ECR access)
- Verify region is correct

### App Runner Issues
- Check environment variables are set
- Verify DATABASE_URL is accessible
- Check CloudWatch logs

## 📚 Documentation Reference

- **Quick Start:** `QUICK_DEPLOY_ECR.md`
- **Full Guide:** `DOCKER_ECR_DEPLOYMENT.md`
- **Environment:** `.env.example`

## ✨ Benefits of This Setup

1. **Portable** - Runs anywhere Docker runs
2. **Consistent** - Same environment dev/prod
3. **Scalable** - App Runner auto-scales
4. **Fast Builds** - Multi-stage with caching
5. **Version Control** - Git commit tagging
6. **Easy Updates** - Single script deployment
7. **Cost Effective** - Minimal image size
8. **Secure** - Best practices implemented

## 🎉 You're Ready!

Your application is fully dockerized and ready for AWS App Runner deployment via ECR.

**Deploy now:** `./scripts/push-to-ecr.sh`

---

**Setup Date:** 2026-01-31  
**Docker Version:** 20.10+  
**Node Version:** 20 LTS  
**Next.js:** 15.5.4  
**Status:** ✅ Production Ready
