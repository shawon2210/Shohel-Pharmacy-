# MongoDB Setup Guide

This guide will help you set up MongoDB for the Shohel Pharmacy Management System.

## Option 1: Local MongoDB Installation (Recommended for Development)

### Windows Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and run the installer

2. **Install MongoDB**
   - Run the installer as Administrator
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```cmd
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

5. **Test Connection**
   ```cmd
   mongo
   ```

### Alternative: MongoDB with Docker

```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d --name pharmacy-mongo -p 27017:27017 mongo:latest

# Connect to MongoDB
docker exec -it pharmacy-mongo mongo
```

## Option 2: MongoDB Atlas (Cloud Database)

1. **Create Account**
   - Visit: https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to you
   - Create cluster

3. **Setup Database Access**
   - Create database user
   - Add IP address to whitelist (0.0.0.0/0 for development)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Update `.env` file with your connection string

## Database Configuration

### Using Local MongoDB (Default)
The application is configured to use local MongoDB by default:
```env
MONGODB_URI=mongodb://localhost:27017/shohel_pharmacy
```

### Using Cloud MongoDB
Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shohel_pharmacy?retryWrites=true&w=majority
```

## Initialize Database

After setting up MongoDB, initialize the database with sample data:

```bash
# Navigate to server directory
cd server

# Run database initialization
npm run seed
```

## Verify Setup

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Check logs for successful connection**
   Look for: `✅ MongoDB connected successfully`

3. **Test API endpoint**
   Visit: http://localhost:5000/api/health

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MongoDB service is running
   - Check if port 27017 is available

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check database user permissions

3. **Network Timeout**
   - Check firewall settings
   - Verify IP whitelist in MongoDB Atlas

### MongoDB Commands

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Stop MongoDB service (Windows)
net stop MongoDB

# Connect to MongoDB shell
mongo

# Show databases
show dbs

# Use pharmacy database
use shohel_pharmacy

# Show collections
show collections

# Count documents in medicines collection
db.medicines.countDocuments()
```

## Database Structure

The application uses the following collections:
- `medicines` - Medicine inventory
- `sales` - Sales transactions
- `purchases` - Purchase records
- `dues` - Customer dues
- `expenses` - Business expenses

## Backup and Restore

### Backup Database
```bash
mongodump --db shohel_pharmacy --out ./backup
```

### Restore Database
```bash
mongorestore --db shohel_pharmacy ./backup/shohel_pharmacy
```

## Security Best Practices

1. **Use strong passwords** for database users
2. **Limit IP access** in production
3. **Enable authentication** for production deployments
4. **Regular backups** of important data
5. **Monitor database** performance and logs