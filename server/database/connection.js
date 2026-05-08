const mongoose = require('mongoose');

// Global mock mode flag
global.mockMode = false;

const connectDB = async () => {
  try {
    // Use local MongoDB by default, cloud as fallback
    const localURI = 'mongodb://localhost:27017/shohel_pharmacy';
    const cloudURI = process.env.MONGODB_URI;
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    };

    let conn;
    
    // Helper: sanitize cloud URI to remove unsupported options
    const sanitizeMongoURI = (uri) => {
      if (!uri || typeof uri !== 'string') return uri;
      const cleaned = uri.replace(/([?&])bufferMaxEntries=[^&]*(&?)/i, (m, p1, p2) => p2 ? p1 : '');
      return cleaned;
    };

    // Try local connection first
    try {
      conn = await mongoose.connect(localURI, options);
      console.log('✅ Local MongoDB connected successfully');
      global.mockMode = false;
      return conn;
    } catch (localError) {
      console.log('⚠️ Local MongoDB not available, trying cloud connection...');
      
      if (cloudURI && cloudURI.includes('mongodb+srv')) {
        const cleanedCloudURI = sanitizeMongoURI(cloudURI);
        conn = await mongoose.connect(cleanedCloudURI, options);
        console.log('✅ Cloud MongoDB connected successfully');
        global.mockMode = false;
        return conn;
      } else {
        throw localError;
      }
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔧 Starting server in MOCK MODE (no database)');
    global.mockMode = true;
    return null;
  }
};

// Connection event handlers
const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination');
    process.exit(0);
  });
};

module.exports = { connectDB, setupConnectionHandlers };