#!/bin/bash

# Pharmacy Management System - Deploy Script
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
echo "🚀 Deploying to: $ENV"

# Build frontend
echo "📦 Building frontend..."
cd client
npm run build
cd ..

# Copy build to server directory (if needed)
echo "📋 Copying build files..."
mkdir -p server/public
# Uncomment if you want to copy build to server folder:
# cp -r client/build/* server/public/

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production
cd ..

# Restart with PM2
echo "🔄 Restarting with PM2..."
if pm2 list | grep -q "pharmacy-server"; then
  pm2 reload ecosystem.config.js --env $ENV
else
  pm2 start ecosystem.config.js --env $ENV
  pm2 save
fi

echo "✅ Deploy complete!"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs pharmacy-server"