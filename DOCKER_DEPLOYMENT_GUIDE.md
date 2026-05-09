# 🏥 Shohel Pharmacy Management System
## Complete Dockerized Solution

This Docker setup allows you to run the complete Pharmacy Management System (MERN stack) on any computer with Docker Desktop installed.

## 🐳 What's Included

- **MongoDB** (v6.0) - Database with initialization script
- **Backend** (Node.js/Express) - REST API server
- **Frontend** (React) - Served via Nginx in production mode
- **Docker Compose** - Orchestrates all services together

## 🚀 Quick Start (30 Seconds)

### Prerequisites
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed (Windows/Mac/Linux)
2. Git (to clone the repo)

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/shawon2210/Shohel-Pharmacy-.git
cd Shohel-Pharmacy-

# 2. Start all services
docker-compose up -d

# 3. Wait for initialization (~60 seconds)
#    You can check logs with: docker-compose logs -f

# 4. Access the application
#    Frontend: http://localhost
#    Backend API: http://localhost:5001/api/health
```

### Default Login
- **Username**: `admin`
- **Password**: `admin123`
- These work in mock mode until MongoDB is fully initialized

## 🔧 How It Works

### Service Configuration
| Service | Port | Description |
|---------|------|-------------|
| **mongo** | 27017 | MongoDB database |
| **backend** | 5001 | Express API server |
| **frontend** | 80 (host:3000) | React app served by Nginx |

### Environment Variables
The system uses sensible defaults but can be customized:

#### Backend (.env can override)
- `MONGO_URI`: MongoDB connection string (defaults to `mongodb://pharmacyuser:pharmacypass123@mongo:27017/pharmacy`)
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Server port (default 5001)
- `NODE_ENV`: development/production

#### Frontend
- Built statically and served by Nginx
- API calls go to relative `/api/` endpoints (proxied via nginx or direct)

## 💡 Development vs Production

### Development Mode (Recommended for Learning/Testing)
```bash
# With live reload for backend/frontend code changes
docker-compose up -d

# Make changes to code in ./server/ or ./client/
# Backend: Node.js restarts automatically (nodemon)
# Frontend: Requires manual rebuild or use npm start in container
```

### Production Mode
```bash
# For maximum performance (no file watching)
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Data Persistence
- MongoDB data persists in named volume `mongo-data`
- To reset database: `docker-compose down -v` (deletes all data!)
- To backup: `docker run --rm -v pharmacy-mongo-mongo-data:/data -v $(pwd):/backup ubuntu tar czf /backup/mongo-backup.tar.gz /data`

## 🛠️ Common Commands

```bash
# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Restart services
docker-compose restart
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (deletes data!)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Enter a container for debugging
docker-compose exec backend bash
docker-compose exec mongo mongosh -u pharmacyuser -p pharmacypass123 --authenticationDatabase pharmacy
```

## 🔒 Security Notes (Important!)

### For Local Development Only
The default credentials in this setup are **NOT secure for production**:
- MongoDB user: `pharmacyuser` / `pharmacypass123`
- JWT secret: `your_super_secret_jwt_key_change_in_production`

### Before Production Deployment
1. Change all passwords/secrets
2. Use proper environment variables or secrets management
3. Consider using MongoDB Atlas instead of local MongoDB
4. Enable HTTPS (via nginx or reverse proxy)
5. Set `NODE_ENV=production`

## 🐛 Troubleshooting

### "Container is unhealthy" or restarting constantly
```bash
# Check logs
docker-compose logs -f [service-name]

# Common fixes:
# 1. Wait longer for MongoDB to initialize (first startup takes 60-90s)
# 2. Increase resources in Docker Desktop settings
# 3. Check port conflicts (is something else using 3000, 5001, 27017?)
```

### Frontend shows blank page or won't load
```bash
# Check if nginx is serving files
docker-compose exec frontend ls -la /usr/share/nginx/html
# Should show index.html and static/ folder

# Check nginx logs
docker-compose logs -f frontend
```

### Backend can't connect to database
```bash
# Test connection from backend container
docker-compose exec backend mongosh "mongodb://pharmacyuser:pharmacypass123@mongo:27017/pharmacy" --eval "db.runCommand({ connectionStatus: 1 })"

# Verify mongo service is healthy
docker-compose ps mongo
```

## 📈 Scaling Notes

### Current Setup
- Single instance of each service (perfect for development/testing)
- MongoDB uses persistent volume for data safety

### For Higher Traffic (Future)
1. Scale backend: `docker-compose up -d --scale backend=3`
2. Add load balancer (nginx) in front of backend instances
3. Consider MongoDB Replica Set for production
4. Use Redis for session storage/cache
5. Move to Kubernetes when you need >10 nodes or advanced orchestration

## 📄 File Overview

```
shohel-pharmacy/
├── client/                 # React frontend
│   ├── Dockerfile          # Multi-stage: build with node, serve with nginx
│   ├── package.json
│   └── src/
├── server/                 # Express backend
│   ├── Dockerfile          # Node.js with nodemon for dev
│   ├── package.json
│   ├── server.js
│   └── routes/
├── mongo-init.js           # MongoDB initialization script
├── docker-compose.yml      # Main composition file
├── server/.env.example     # Example environment variables
└── README.md               # This file
```

## 🛡️ License
MIT License - Feel free to use, modify, and distribute!

---
**Need Help?** 
- Check Docker logs: `docker-compose logs -f`
- Visit: https://docs.docker.com/compose/
- MongoDB Docs: https://www.mongodb.com/docs/manual/