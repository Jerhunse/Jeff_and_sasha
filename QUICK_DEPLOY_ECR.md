# 🚀 Quick Deploy to AWS ECR

Your application is now fully dockerized and ready to deploy!

## One-Command Deployment

```bash
./scripts/push-to-ecr.sh
```

That's it! The script will:
1. ✓ Check prerequisites (AWS CLI, Docker)
2. ✓ Create ECR repository if needed
3. ✓ Authenticate Docker with ECR
4. ✓ Build your Docker image
5. ✓ Tag with both `latest` and git commit hash
6. ✓ Push to AWS ECR
7. ✓ Display deployment instructions

## Prerequisites

Make sure you have:
- Docker running
- AWS CLI configured (`aws configure`)

## What's Been Set Up

### Files Created/Modified

1. **next.config.ts** - Enabled standalone output for Docker
2. **Dockerfile** - Multi-stage build (already existed, verified)
3. **docker-compose.yml** - Local testing setup
4. **.env.example** - Environment variable template
5. **scripts/push-to-ecr.sh** - Automated ECR push script
6. **app/api/health/route.ts** - Health check endpoint
7. **DOCKER_ECR_DEPLOYMENT.md** - Comprehensive documentation

### Docker Image Details

- **Base:** Node 20 Alpine (minimal)
- **Size:** ~150-200MB (production)
- **Port:** 3000
- **Architecture:** Multi-stage build for optimization

## Step-by-Step Deployment

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 2. Test Locally (Optional)

```bash
docker-compose up --build
# Visit http://localhost:3000
```

### 3. Push to ECR

```bash
# Default (us-east-1, tag: latest)
./scripts/push-to-ecr.sh

# Custom region/tag
AWS_REGION=us-west-2 IMAGE_TAG=v1.0.0 ./scripts/push-to-ecr.sh
```

### 4. Deploy to App Runner

After pushing, you'll see output like:

```
📦 ECR Repository: 123456789.dkr.ecr.us-east-1.amazonaws.com/wedding-platform
🏷️  Image Tag: latest
🔖 Git Commit: abc123
🌍 Region: us-east-1
```

#### Option A: AWS Console

1. Go to [App Runner Console](https://console.aws.amazon.com/apprunner)
2. Create service → Container registry
3. Use the ECR image URI from output above
4. Port: `3000`
5. Add environment variables from `.env`

#### Option B: AWS CLI

```bash
# Get your image URI from the script output, then:
aws apprunner create-service \
  --service-name wedding-platform \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "<YOUR-ECR-URI>:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000"
      }
    }
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }'
```

## Environment Variables Required

At minimum, set these in App Runner:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app-runner-url.region.awsapprunner.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
AUTH_TRUST_HOST=true
AWS_REGION=us-east-1
NODE_ENV=production
```

## Testing Your Deployment

```bash
# Health check
curl https://your-app-runner-url.region.awsapprunner.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"2026-01-31T16:00:00.000Z","version":"0.1.0","uptime":123}
```

## Updating Your App

After making code changes:

```bash
# 1. Push new image
./scripts/push-to-ecr.sh

# 2. Trigger deployment
aws apprunner start-deployment --service-arn <your-service-arn>
```

## Common Issues & Solutions

### "AWS CLI not configured"
```bash
aws configure
# Enter your AWS Access Key ID, Secret, Region
```

### "Docker not running"
- Start Docker Desktop
- Or: `sudo systemctl start docker` (Linux)

### "Permission denied: ./scripts/push-to-ecr.sh"
```bash
chmod +x scripts/push-to-ecr.sh
```

### "npm ci failed" during build
- Usually network issue, retry the build
- Or check your network connection

## Cost Estimate

**App Runner (1 vCPU, 2GB RAM):**
- ~$50-100/month for moderate traffic
- Includes auto-scaling, load balancing, SSL

**ECR Storage:**
- ~$0.10/GB/month
- Keep only recent images to minimize cost

## Next Steps

1. Run `./scripts/push-to-ecr.sh`
2. Deploy to App Runner (console or CLI)
3. Configure custom domain (optional)
4. Set up monitoring/alerts

## Support

- Full docs: `DOCKER_ECR_DEPLOYMENT.md`
- AWS App Runner: https://docs.aws.amazon.com/apprunner/
- Docker help: https://docs.docker.com/

---

**Ready to deploy!** 🎉

Just run: `./scripts/push-to-ecr.sh`
