# Docker Deployment to AWS ECR & App Runner

Complete guide for dockerizing and deploying the Wedding Platform to AWS App Runner using ECR.

## 📋 Prerequisites

Before starting, ensure you have:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and configured
- AWS account with appropriate permissions (ECR, App Runner, IAM)
- Node.js 20+ (for local development)

### AWS Permissions Required

Your AWS user/role needs these permissions:
- `ecr:CreateRepository`
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`
- `apprunner:CreateService`
- `apprunner:UpdateService`
- `iam:CreateServiceLinkedRole` (for App Runner)

## 🚀 Quick Start

### 1. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Verify your identity
aws sts get-caller-identity
```

### 2. Set Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
DATABASE_URL=postgresql://user:password@host:5432/wedding_platform
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
AWS_REGION=us-east-1
# ... etc
```

### 3. Build and Push to ECR

Run the automated script:

```bash
./scripts/push-to-ecr.sh
```

Or set custom region/tag:

```bash
AWS_REGION=us-west-2 IMAGE_TAG=v1.0.0 ./scripts/push-to-ecr.sh
```

### 4. Deploy to App Runner

After pushing to ECR, deploy using AWS Console or CLI (see sections below).

---

## 📦 Docker Configuration

### Multi-Stage Build

The `Dockerfile` uses a multi-stage build for optimal image size:

1. **deps**: Installs dependencies
2. **builder**: Builds the Next.js application and generates Prisma client
3. **runner**: Minimal production runtime (~150MB)

### Next.js Standalone Output

The application uses Next.js standalone output mode (configured in `next.config.ts`):

```typescript
export default {
  output: 'standalone',
};
```

This creates a minimal Node.js server that includes only necessary files.

### Docker Compose (Local Testing)

Test your Docker setup locally:

```bash
# Build and run
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Access the application at `http://localhost:3000`

---

## 🐳 Manual Docker Commands

If you prefer manual control:

### Build Image

```bash
docker build -t wedding-platform:latest .
```

### Run Container Locally

```bash
docker run -p 3000:3000 \
  --env-file .env \
  wedding-platform:latest
```

### Test Container

```bash
# Check if it's running
docker ps

# View logs
docker logs <container-id>

# Execute commands inside container
docker exec -it <container-id> sh
```

---

## 🔐 AWS ECR Setup

### Manual ECR Repository Creation

If not using the script:

```bash
# Set variables
AWS_REGION=us-east-1
REPO_NAME=wedding-platform

# Create repository
aws ecr create-repository \
  --repository-name $REPO_NAME \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Get repository URI
aws ecr describe-repositories \
  --repository-names $REPO_NAME \
  --region $AWS_REGION \
  --query 'repositories[0].repositoryUri' \
  --output text
```

### Authenticate Docker with ECR

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Tag and Push Image

```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Tag image
docker tag wedding-platform:latest \
  $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wedding-platform:latest

# Push to ECR
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/wedding-platform:latest
```

---

## ☁️ AWS App Runner Deployment

### Option 1: AWS Console (Recommended for First Time)

1. **Navigate to App Runner**
   - Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner)
   - Click "Create service"

2. **Configure Source**
   - Source: Container registry
   - Provider: Amazon ECR
   - Container image URI: `<account-id>.dkr.ecr.<region>.amazonaws.com/wedding-platform:latest`
   - Deployment trigger: Manual (or Automatic)

3. **Configure Service**
   - Service name: `wedding-platform`
   - Virtual CPU: 1 vCPU
   - Memory: 2 GB
   - Port: `3000`

4. **Environment Variables**
   Add all variables from `.env`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (use App Runner URL after creation)
   - `NEXTAUTH_SECRET`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - etc.

5. **Health Check**
   - Protocol: HTTP
   - Path: `/api/health` (you may need to create this endpoint)
   - Interval: 30 seconds
   - Timeout: 10 seconds
   - Healthy threshold: 3
   - Unhealthy threshold: 3

6. **Create Service**
   - Review settings
   - Click "Create & deploy"
   - Wait 5-10 minutes for deployment

### Option 2: AWS CLI

Create `apprunner-config.json`:

```json
{
  "ServiceName": "wedding-platform",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "<account-id>.dkr.ecr.<region>.amazonaws.com/wedding-platform:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DATABASE_URL": "postgresql://...",
          "NEXTAUTH_SECRET": "...",
          "AWS_REGION": "us-east-1"
        }
      }
    },
    "AutoDeploymentsEnabled": false
  },
  "InstanceConfiguration": {
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  },
  "HealthCheckConfiguration": {
    "Protocol": "HTTP",
    "Path": "/",
    "Interval": 30,
    "Timeout": 10,
    "HealthyThreshold": 3,
    "UnhealthyThreshold": 3
  }
}
```

Deploy with CLI:

```bash
aws apprunner create-service --cli-input-json file://apprunner-config.json
```

### Option 3: CloudFormation/CDK

Example CloudFormation template snippet:

```yaml
Resources:
  WeddingPlatformService:
    Type: AWS::AppRunner::Service
    Properties:
      ServiceName: wedding-platform
      SourceConfiguration:
        ImageRepository:
          ImageIdentifier: !Sub '${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/wedding-platform:latest'
          ImageRepositoryType: ECR
          ImageConfiguration:
            Port: '3000'
            RuntimeEnvironmentVariables:
              - Name: NODE_ENV
                Value: production
              - Name: DATABASE_URL
                Value: !Ref DatabaseUrl
      InstanceConfiguration:
        Cpu: 1 vCPU
        Memory: 2 GB
```

---

## 🔄 Updating Your Deployment

### Update with New Code

1. **Build and push new image:**
   ```bash
   ./scripts/push-to-ecr.sh
   ```

2. **Trigger App Runner deployment:**
   ```bash
   aws apprunner start-deployment \
     --service-arn <your-service-arn>
   ```

### Rollback to Previous Version

```bash
# List image tags
aws ecr list-images \
  --repository-name wedding-platform \
  --region us-east-1

# Update service with specific tag
aws apprunner update-service \
  --service-arn <service-arn> \
  --source-configuration ImageRepository={ImageIdentifier=<account-id>.dkr.ecr.us-east-1.amazonaws.com/wedding-platform:<old-tag>}
```

---

## 🔍 Monitoring & Debugging

### View App Runner Logs

```bash
# Get service ARN
aws apprunner list-services

# View logs (requires CloudWatch log group)
aws logs tail /aws/apprunner/wedding-platform/service --follow
```

### Common Issues

#### 1. Build Fails - Prisma Generation Error

**Problem:** Prisma client not generating during build

**Solution:** Ensure `npx prisma generate` runs in Dockerfile

#### 2. Container Starts But Crashes

**Problem:** Missing environment variables

**Solution:** 
- Check all required env vars are set in App Runner
- Use App Runner console to view application logs
- Ensure `DATABASE_URL` is accessible from App Runner

#### 3. Database Connection Timeout

**Problem:** App Runner can't reach database

**Solution:**
- If using RDS, configure security groups to allow App Runner traffic
- Use App Runner VPC connector if database is in private subnet
- Verify DATABASE_URL is correct

#### 4. Port Binding Issues

**Problem:** App not responding on expected port

**Solution:**
- Verify PORT environment variable is set to 3000
- Check Dockerfile EXPOSE directive matches
- Ensure Next.js is binding to 0.0.0.0 not localhost

---

## 🔒 Security Best Practices

### 1. Use AWS Secrets Manager

Instead of plain environment variables:

```bash
# Store secret
aws secretsmanager create-secret \
  --name wedding-platform/nextauth-secret \
  --secret-string "your-secret-here"

# Reference in App Runner
# Use IAM role with secretsmanager:GetSecretValue permission
```

### 2. ECR Image Scanning

Enable automatic scanning:

```bash
aws ecr put-image-scanning-configuration \
  --repository-name wedding-platform \
  --image-scanning-configuration scanOnPush=true
```

### 3. IAM Roles

Create dedicated IAM role for App Runner with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "ses:SendEmail",
        "rds:DescribeDBInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. Network Security

- Use VPC connector for private resources
- Enable AWS WAF for DDoS protection
- Use custom domain with SSL/TLS certificate

---

## 💰 Cost Optimization

### App Runner Pricing

- **CPU/Memory:** Pay for compute time (provisioned containers)
- **Build:** Pay for build minutes
- **Data Transfer:** Standard AWS data transfer rates

**Estimated Monthly Cost (1 vCPU, 2GB RAM):**
- ~$50-100/month for production workload
- Paused instances: Pay only for storage

### Optimization Tips

1. **Right-size your instances:**
   - Start with 1 vCPU, 2GB RAM
   - Monitor and adjust based on metrics

2. **Use caching:**
   - CDN for static assets
   - Redis for session/data caching

3. **Auto-scaling:**
   - Configure min/max instances based on traffic patterns
   - Set concurrency appropriately

---

## 📊 Health Check Endpoint

Create a health check endpoint for App Runner:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown'
  });
}
```

---

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database accessible from App Runner
- [ ] NEXTAUTH_URL set to correct domain
- [ ] AWS credentials have minimal required permissions
- [ ] Image scanning enabled on ECR
- [ ] Health check endpoint working
- [ ] Logging configured (CloudWatch)
- [ ] Auto-scaling settings configured
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS certificate added (optional)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## 🆘 Support & Resources

### Official Documentation

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Amazon ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Useful Commands

```bash
# View all App Runner services
aws apprunner list-services

# Get service details
aws apprunner describe-service --service-arn <arn>

# Delete service
aws apprunner delete-service --service-arn <arn>

# List ECR images
aws ecr list-images --repository-name wedding-platform

# Delete old ECR images
aws ecr batch-delete-image \
  --repository-name wedding-platform \
  --image-ids imageTag=old-tag
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS App Runner

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
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: wedding-platform
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to App Runner
        run: |
          aws apprunner start-deployment --service-arn ${{ secrets.APP_RUNNER_SERVICE_ARN }}
```

---

## 📝 Notes

- **Build time:** Expect 5-10 minutes for initial builds
- **Deploy time:** App Runner deployment takes 3-5 minutes
- **Cold starts:** First request may be slower (1-2 seconds)
- **Logs:** Accessible via CloudWatch Logs
- **Custom domains:** Configure via App Runner console

---

**Created:** 2026-01-31  
**Version:** 1.0.0  
**Maintained by:** Wedding Platform Team
