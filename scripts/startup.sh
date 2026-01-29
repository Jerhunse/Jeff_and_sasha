#!/bin/bash

# Wedding Platform Startup Script
# This script sets up and starts the development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_info "Dependencies already installed, skipping..."
    fi
}

# Setup environment file
setup_env() {
    print_info "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating template..."
        
        # Generate a secure secret
        NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-secret-$(date +%s)")
        
        cat > .env << EOF
# Database
# Update with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/wedding_platform?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email Provider (Optional)
EMAIL_PROVIDER="auto"
RESEND_API_KEY=""
EMAIL_FROM="noreply@yourdomain.com"

# AWS Configuration (Optional)
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""
AWS_S3_PUBLIC_URL=""
AWS_SES_FROM_EMAIL="noreply@yourdomain.com"

# App Configuration
NODE_ENV="development"
EOF
        
        print_warning "Created .env file with default values"
        print_warning "⚠️  IMPORTANT: Update DATABASE_URL in .env before continuing!"
        echo ""
        read -p "Press Enter to continue after updating .env, or Ctrl+C to exit..."
    else
        print_success ".env file exists"
    fi
}

# Generate Prisma client
generate_prisma() {
    print_info "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    
    # Check if DATABASE_URL is set and not the default
    if grep -q 'postgresql://user:password@localhost' .env 2>/dev/null; then
        print_warning "DATABASE_URL appears to be a placeholder"
        print_warning "Please update .env with your actual database connection string"
        echo ""
        read -p "Have you updated DATABASE_URL? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Database setup skipped. Please update .env and run migrations manually."
            return
        fi
    fi
    
    # Try to push schema
    print_info "Pushing database schema..."
    if npx prisma db push --accept-data-loss 2>/dev/null; then
        print_success "Database schema pushed"
    else
        print_warning "Database push failed. This might be normal if migrations are needed."
        print_info "Trying migrations instead..."
        if npx prisma migrate dev --name init 2>/dev/null; then
            print_success "Database migrations completed"
        else
            print_warning "Could not run migrations. You may need to set up your database manually."
            print_info "Run: npx prisma migrate dev"
        fi
    fi
}

# Seed database (optional)
seed_database() {
    print_info "Checking if database seeding is needed..."
    
    if [ -f "prisma/seed.ts" ]; then
        echo ""
        read -p "Would you like to seed the database with sample data? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Seeding database..."
            npm run seed || print_warning "Seed script failed or not configured"
        fi
    fi
}

# Start development server
start_dev_server() {
    print_info "Starting development server..."
    print_success "Setup complete! Starting server..."
    echo ""
    print_info "🌐 Public Site: http://localhost:3000"
    print_info "🔐 Admin Dashboard: http://localhost:3000/admin"
    echo ""
    
    npm run dev
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Wedding Platform - Development Startup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Get the script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Run setup steps
    check_prerequisites
    install_dependencies
    setup_env
    generate_prisma
    setup_database
    seed_database
    start_dev_server
}

# Run main function
main
