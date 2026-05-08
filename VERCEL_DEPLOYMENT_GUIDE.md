# Vercel Deployment Guide - Shohel Pharmacy Management

## 🚀 Quick Deploy to Vercel

### Prerequisites
1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at https://vercel.com (free tier works)
3. **MongoDB Atlas Account** - For cloud database (recommended over local MongoDB)

---

## Step 1: Push Code to GitHub

```bash
cd "/mnt/d/all files/Project/Pharmacy"

# Initialize git (if not done)
git init
git add -A
git commit -m "Ready for Vercel deployment"

# Create GitHub repo and push
# Go to https://github.com/new and create a repo named "shohel-pharmacy"
git remote add origin https://github.com/yourusername/shohel-pharmacy.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas (Cloud Database)

1. Go to https://www.mongodb.com/atlas
2. Create free account and cluster (M0 Free tier)
3. Create database user (username/password)
4. Whitelist IP: Add `0.0.0.0/0` (allow access from anywhere)
5. Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/pharmacy`

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `shohel-pharmacy`
3. Configure project:
   - **Framework Preset**: Create React App (for client)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Environment Variables** - Add these:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pharmacy
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   NODE_ENV=production
   ```

5. Click **Deploy** 🚀

---

## Step 4: Configure API Routes (Serverless)

Since Vercel uses serverless functions, your Express API needs to be in the `api/` folder.

### Current Setup Status:
✅ Created `vercel.json` - Vercel configuration
✅ Created `api/index.js` - Serverless API wrapper

### Verify API is Working:
After deployment, test:
```
https://your-app.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-05-09T..."
}
```

---

## Step 5: Update Frontend API URL

After deployment, update the frontend to use the Vercel URL:

### Create `client/.env.production`:
```
REACT_APP_API_URL=https://your-app.vercel.app/api
```

### Update axios base URL in your frontend:
In `client/src/` files that use axios, change:
```javascript
// Before (local development)
const API_URL = 'http://localhost:5001/api';

// After (production)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

---

## Environment Variables Checklist

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your_secret_key` | Secret for JWT tokens |
| `NODE_ENV` | `production` | Production mode |
| `CLIENT_URL` | `https://your-app.vercel.app` | Frontend URL |

---

## Common Issues & Fixes

### Issue 1: "Cannot find module '../server/...'"
**Fix**: Vercel's serverless functions can't access files outside `api/`. You need to:
- Copy server code into `api/` folder, OR
- Use Vercel's `builds` config to include server files

### Issue 2: MongoDB Connection Fails
**Fix**: 
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check `MONGO_URI` environment variable is set correctly
- Use mock mode as fallback (already implemented in your code)

### Issue 3: CORS Errors
**Fix**: Already handled in `api/index.js` with cors middleware

---

## Verify Deployment

After deployment, check:
1. **Frontend**: `https://your-app.vercel.app` ✅
2. **API Health**: `https://your-app.vercel.app/api/health` ✅
3. **Login**: Use mock credentials `admin` / `admin123` ✅

---

## Next Steps

1. **Custom Domain** (optional): Vercel Dashboard → Domains
2. **SSL Certificate**: Automatic with Vercel
3. **Monitoring**: Vercel Dashboard → Deployments → View Function Logs

---

## Project Structure for Vercel

```
shohel-pharmacy/
├── client/              # React frontend (deployed to Vercel)
│   ├── build/          # Build output (auto-generated)
│   └── package.json
├── api/                 # Serverless API functions (Vercel)
│   └── index.js        # Express app wrapper
├── server/              # Original Express backend (reference)
├── vercel.json          # Vercel configuration ✅
└── package.json         # Root package.json
```

---

**Need Help?** Check Vercel logs: Dashboard → Deployments → Click on deployment → View Function Logs
