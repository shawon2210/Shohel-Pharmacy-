const mongoose = require('mongoose');

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
    
    // Helper: sanitize cloud URI to remove unsupported options (e.g. bufferMaxEntries)
    const sanitizeMongoURI = (uri) => {
      if (!uri || typeof uri !== 'string') return uri;
      // remove bufferMaxEntries (case-insensitive) and its value
      const cleaned = uri.replace(/([?&])buffermaxentries=[^&]*(&?)/i, (m, p1, p2) => {
        // If there is a following param, keep the separator, otherwise remove the separator
        return p2 ? p1 : '';
      }).replace(/([?&])bufferMaxEntries=[^&]*(&?)/i, (m, p1, p2) => p2 ? p1 : '');
      if (cleaned !== uri) {
        console.log('⚙️ Sanitized MongoDB URI: removed unsupported query params');
      }
      return cleaned;
    };

    // Try local connection first
    try {
      conn = await mongoose.connect(localURI, options);
      console.log('✅ Local MongoDB connected successfully');
    } catch (localError) {
      console.log('⚠️ Local MongoDB not available, trying cloud connection...');
      
      if (cloudURI && cloudURI.includes('mongodb+srv')) {
        const cleanedCloudURI = sanitizeMongoURI(cloudURI);
        conn = await mongoose.connect(cleanedCloudURI, options);
        console.log('✅ Cloud MongoDB connected successfully');
      } else {
        throw localError;
      }
    }
    
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}:${conn.connection.port}`);
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
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