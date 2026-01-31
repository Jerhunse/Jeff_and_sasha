#!/bin/bash

# AWS ECR Push Script for Wedding Platform
# This script builds and pushes your Docker image to AWS ECR

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
APP_NAME="wedding-platform"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first:"
        echo "  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI is installed"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop or Docker daemon."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to get AWS account ID
get_account_id() {
    aws sts get-caller-identity --query Account --output text
}

# Function to create ECR repository if it doesn't exist
create_ecr_repo() {
    local repo_name=$1
    local account_id=$2
    
    print_info "Checking if ECR repository exists..."
    
    if aws ecr describe-repositories --repository-names "$repo_name" --region "$AWS_REGION" &> /dev/null; then
        print_success "ECR repository '$repo_name' already exists"
    else
        print_info "Creating ECR repository '$repo_name'..."
        aws ecr create-repository \
            --repository-name "$repo_name" \
            --region "$AWS_REGION" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
        print_success "ECR repository created"
    fi
}

# Function to authenticate Docker with ECR
ecr_login() {
    print_info "Authenticating Docker with ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ECR_REGISTRY"
    print_success "Docker authenticated with ECR"
}

# Function to build Docker image
build_image() {
    print_info "Building Docker image..."
    docker build -t "$APP_NAME:$IMAGE_TAG" .
    print_success "Docker image built successfully"
}

# Function to tag image for ECR
tag_image() {
    print_info "Tagging image for ECR..."
    docker tag "$APP_NAME:$IMAGE_TAG" "$ECR_URI:$IMAGE_TAG"
    
    # Also tag with git commit hash if in a git repo
    if git rev-parse --git-dir > /dev/null 2>&1; then
        GIT_COMMIT=$(git rev-parse --short HEAD)
        docker tag "$APP_NAME:$IMAGE_TAG" "$ECR_URI:$GIT_COMMIT"
        print_success "Tagged with commit hash: $GIT_COMMIT"
    fi
    
    print_success "Image tagged for ECR"
}

# Function to push image to ECR
push_image() {
    print_info "Pushing image to ECR..."
    docker push "$ECR_URI:$IMAGE_TAG"
    
    # Also push git commit tag if it exists
    if git rev-parse --git-dir > /dev/null 2>&1; then
        GIT_COMMIT=$(git rev-parse --short HEAD)
        docker push "$ECR_URI:$GIT_COMMIT"
    fi
    
    print_success "Image pushed to ECR successfully"
}

# Function to display summary
display_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Deployment Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📦 ECR Repository: $ECR_REGISTRY/$APP_NAME"
    echo "🏷️  Image Tag: $IMAGE_TAG"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "🔖 Git Commit: $(git rev-parse --short HEAD)"
    fi
    echo "🌍 Region: $AWS_REGION"
    echo ""
    echo "🚀 To deploy to App Runner:"
    echo "   1. Go to AWS App Runner console"
    echo "   2. Create a new service or update existing service"
    echo "   3. Select 'Container registry' as source"
    echo "   4. Enter this image URI: $ECR_URI:$IMAGE_TAG"
    echo "   5. Configure port 3000"
    echo "   6. Add environment variables (see .env.example)"
    echo ""
    echo "📝 Or use AWS CLI:"
    echo "   aws apprunner create-service \\"
    echo "     --service-name $APP_NAME \\"
    echo "     --source-configuration '{\"ImageRepository\":{\"ImageIdentifier\":\"$ECR_URI:$IMAGE_TAG\",\"ImageRepositoryType\":\"ECR\",\"ImageConfiguration\":{\"Port\":\"3000\"}}}' \\"
    echo "     --instance-configuration '{\"Cpu\":\"1 vCPU\",\"Memory\":\"2 GB\"}'"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🐳 AWS ECR Docker Build & Push"
    echo "  Wedding Platform"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check prerequisites
    check_aws_cli
    check_docker
    
    # Get AWS account ID
    print_info "Getting AWS account information..."
    ACCOUNT_ID=$(get_account_id)
    print_success "AWS Account ID: $ACCOUNT_ID"
    
    # Set ECR registry and URI
    ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
    ECR_URI="$ECR_REGISTRY/$APP_NAME"
    
    # Create ECR repository
    create_ecr_repo "$APP_NAME" "$ACCOUNT_ID"
    
    # Authenticate Docker with ECR
    ecr_login
    
    # Build the image
    build_image
    
    # Tag the image
    tag_image
    
    # Push the image
    push_image
    
    # Display summary
    display_summary
}

# Run main function
main
