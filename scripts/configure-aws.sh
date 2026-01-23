#!/bin/bash

# AWS Configuration Helper Script
# This script helps configure AWS CLI for account: 676467514398

set -e

echo "🔧 AWS Configuration Setup"
echo "Account ID: 676467514398"
echo ""

# Create .aws directory if it doesn't exist
mkdir -p ~/.aws

# Check if credentials already exist
if [ -f ~/.aws/credentials ]; then
    echo "⚠️  Existing credentials found at ~/.aws/credentials"
    read -p "Do you want to overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Prompt for credentials
echo "Please provide your AWS credentials:"
read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -sp "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""
read -p "Default region (e.g., us-east-1) [us-east-1]: " AWS_DEFAULT_REGION
AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}
read -p "Default output format [json]: " AWS_DEFAULT_OUTPUT
AWS_DEFAULT_OUTPUT=${AWS_DEFAULT_OUTPUT:-json}

# Write credentials file
cat > ~/.aws/credentials <<EOF
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOF

# Write config file
cat > ~/.aws/config <<EOF
[default]
region = ${AWS_DEFAULT_REGION}
output = ${AWS_DEFAULT_OUTPUT}
EOF

# Set proper permissions
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config

echo ""
echo "✅ AWS configuration complete!"
echo ""
echo "Testing connection..."
aws sts get-caller-identity

echo ""
echo "Configuration saved to:"
echo "  ~/.aws/credentials"
echo "  ~/.aws/config"