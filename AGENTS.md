# Pharmacy Management System (MERN Stack)

## Project Overview
Comprehensive pharmacy management system built with MongoDB, Express, React, Node.js (MERN).

## Directory Structure
- Root: `/mnt/d/all files/Project/Pharmacy` (Windows path: `D:\all files\Project\Pharmacy`)
- `server/`: Node.js/Express backend with MongoDB integration
  - Entry point: `server/index.js`
  - Environment config: `server/.env` (copy from `server/.env.example`)
  - API routes: `server/routes/`
  - Database models: `server/models/`
- `client/`: React frontend
  - Entry point: `client/src/index.js`
  - Components: `client/src/`

## Common Commands (run from project root)
- Start full dev stack (server + client concurrently): `npm run dev`
- Start server only: `npm run server` (runs `cd server && npm run dev`)
- Start client only: `npm run client` (runs `cd client && npm start`)
- Install all dependencies: `npm run install-all`
- Build client for production: `npm run build`
- Test authentication flow: `node test-auth.js`

## Environment Variables
- Server requires `server/.env` with:
  - `MONGO_URI`: MongoDB connection string
  - `PORT`: Server port (default 5000)
  - `JWT_SECRET`: For auth tokens
- Copy `server/.env.example` to `server/.env` and fill values

## Key Reference Files
- `DATABASE_STRUCTURE.md`: Database schema details
- `SETUP_COMPLETE.md`: Setup status and notes
- `TROUBLESHOOTING_GUIDE.md`: Common issues and fixes
- `UI_ENHANCEMENTS_COMPLETE.md`: Frontend update notes

## Notes
- Uses `concurrently` to run server and client together in dev mode
- MongoDB must be running locally or accessible via `MONGO_URI`
- Client runs on port 3000 by default, server on 5000