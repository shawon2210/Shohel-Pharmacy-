# Dockerfile for Express Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY server/ .

# Create data directory for MongoDB (if using local Mongo in container)
# For production, we'll use external MongoDB or MongoDB Atlas
# VOLUME ["/data/db"]

# Expose port
EXPOSE 5001

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=development
ENV PORT=5001
ENV MONGO_URI=mongodb://mongo:27017/pharmacy
ENV JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Start the server
CMD ["npm", "run", "dev"]