# Troubleshooting Guide

## Issues Fixed

### 1. React Router Future Flag Warnings
**Problem**: React Router v6 showing warnings about upcoming v7 changes
**Solution**: Added future flags to router configuration:
- `v7_startTransition: true`
- `v7_relativeSplatPath: true`

### 2. Token Verification Failed (AxiosError)
**Problem**: Frontend cannot connect to backend for token verification
**Possible Causes**:
- Backend server not running on port 5001
- Network connectivity issues
- CORS configuration problems

**Solutions**:
1. **Start Backend Server**:
   ```bash
   cd server
   npm run dev
   # OR
   node index.js
   ```

2. **Use Startup Script**:
   ```bash
   # From root directory
   start-app.bat
   # OR
   npm run dev
   ```

3. **Check Backend Status**:
   - Visit: http://localhost:5001/api/health
   - Should return: `{"message": "Pharmacy Management API is running!"}`

### 3. setState During Render Warning
**Problem**: Layout component calling `navigate('/login')` during render
**Solution**: Moved navigation logic to `useEffect` hook

## Quick Fixes Applied

### App.js
- Migrated from `BrowserRouter` to `createBrowserRouter`
- Added future flags for React Router v7 compatibility
- Restructured routing configuration

### Layout.js
- Fixed setState during render by using `useEffect`
- Added proper loading state handling
- Improved authentication flow

### AuthContext.js
- Enhanced error handling for token verification
- Added timeout configuration for API calls
- Better distinction between network and auth errors

## How to Start the Application

### Method 1: Using Batch File (Recommended)
```bash
start-app.bat
```

### Method 2: Manual Start
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

### Method 3: Concurrent Start
```bash
# From root directory
npm run dev
```

## Verification Steps

1. **Backend Health Check**:
   - Open: http://localhost:5001/api/health
   - Should see: "Pharmacy Management API is running!"

2. **Frontend Access**:
   - Open: http://localhost:3000
   - Should redirect to login page if not authenticated

3. **Authentication Test**:
   - Try logging in with default credentials
   - Check browser console for any remaining errors

## Default Login Credentials
- Username: `admin`
- Password: `password`

## Common Issues

### Backend Not Starting
- Check if MongoDB is running
- Verify port 5001 is not in use
- Check `.env` file in server directory

### Frontend Connection Issues
- Verify proxy setting in `client/package.json`: `"proxy": "http://localhost:5001"`
- Clear browser cache and localStorage
- Check network tab in DevTools for failed requests

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET in server `.env` file
- Verify user exists in database