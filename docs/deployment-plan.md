# Pharmacy Management System - Deployment Plan

## Overview
MERN Stack application deployment guide for production environment.

## Architecture
- **Frontend**: React (Create React App) → Static build files
- **Backend**: Express.js + Socket.io → Node.js server
- **Database**: MongoDB (local or cloud via MongoDB Atlas)
- **Serving**: Express serves React build + API endpoints

## Deployment Options

### Option A: VPS/Cloud VM (Recommended for Bangladesh SME)
- **Provider**: DigitalOcean, Linode, AWS EC2, or local Bangladesh VPS
- **Specs**: 2 vCPU, 4GB RAM, 50GB SSD (~$20-30/month)
- **Stack**: Ubuntu 22.04 LTS + Node.js + PM2 + Nginx + MongoDB

### Option B: PaaS (Easier but pricier)
- **Frontend**: Vercel, Netlify (free tier available)
- **Backend**: Render.com, Railway.app, or Heroku
- **Database**: MongoDB Atlas (free tier: 512MB)

## Pre-Deployment Checklist

### 1. Frontend Build
```bash
cd client/
npm run build
# Output: client/build/ directory
```

### 2. Environment Variables

**Server (.env.production)**:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pharmacy_prod
JWT_SECRET=<strong-random-string>
CLIENT_URL=https://yourdomain.com
```

**Client (.env.production)**:
```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

### 3. Server Configuration
- Update CORS to allow production domain
- Serve React build folder as static files
- Add security middleware (helmet, rate limiting)
- Set up PM2 for process management

## Step-by-Step Deployment (VPS)

### 1. Server Setup (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install MongoDB (optional if using Atlas)
sudo apt install -y mongodb
```

### 2. Deploy Application
```bash
# Clone repo
cd /var/www/
sudo git clone <your-repo-url> pharmacy
cd pharmacy

# Install dependencies
npm run install-all

# Build frontend
cd client && npm run build && cd ..

# Create production .env
cp server/.env.example server/.env.production
nano server/.env.production  # Edit with production values

# Start with PM2
cd server
pm2 start index.js --name "pharmacy-api"
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### 3. Configure Nginx
```nginx
# /etc/nginx/sites-available/pharmacy
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Option B: PaaS Deployment (Simpler)

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`
4. Add environment variables

### Backend (Render.com)
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && node index.js`
5. Add environment variables

## Post-Deployment

### Monitoring
```bash
pm2 monit  # View process status
pm2 logs   # View logs
```

### Backup (MongoDB)
```bash
# Daily backup cron job
0 2 * * * mongodump --uri="<mongodb-uri>" --out=/backup/$(date +\%Y\%m\%d)
```

## Bangladesh-Specific Notes
- Use local payment gateways (bKash, Nagad) for future integration
- Consider Bangladesh timezone (Asia/Dhaka) for reports
- Bengali font support already included in the app
- Local VPS providers: XeonBD, Dhaka Web Host

## Rollback Plan
```bash
# If deployment fails
pm2 restart pharmacy-api
pm2 logs pharmacy-api --lines 100  # Check errors
```
