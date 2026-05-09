const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
<<<<<<< HEAD
const path = require('path');
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

// Load environment variables
dotenv.config();

const app = express();

// Middleware
<<<<<<< HEAD
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
};
app.use(cors(corsOptions));
=======
app.use(cors());
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
app.use(express.json());

// Database connection
const { connectDB, setupConnectionHandlers } = require('./database/connection');
const { initializeDatabase } = require('./database/init');

// Setup connection handlers
setupConnectionHandlers();

// Connect to database and initialize
<<<<<<< HEAD
// In serverless (Vercel) environments, the process is short-lived and we must
// avoid exiting the process on transient DB issues.
const IS_VERCEL = process.env.VERCEL === '1';
let dbInitPromise = null;

function initDbOnce() {
  if (dbInitPromise) return dbInitPromise;
  dbInitPromise = connectDB()
    .then(async (conn) => {
      if (conn) {
        await initializeDatabase();
        console.log('✅ Database initialized');
      } else {
        console.log('🔧 Running in MOCK MODE - no database connection');
      }
      return conn;
    })
    .catch((error) => {
      console.error('❌ Database init failed:', error);
      if (!IS_VERCEL) {
        process.exit(1);
      }
      return null;
    });
  return dbInitPromise;
}

// Kick off initialization early (safe for both local + serverless).
initDbOnce();
=======
connectDB().then(async (conn) => {
  if (conn) {
    await initializeDatabase();
    console.log('✅ Database initialized');
  } else {
    console.log('🔧 Running in MOCK MODE - no database connection');
  }
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/dues', require('./routes/dues'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Pharmacy Management API is running!' });
});

<<<<<<< HEAD
// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  
  // Catchall handler for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Local/dev server entrypoint. In Vercel serverless, we export the app instead.
let server = null;
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
=======
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

// Setup Socket.io for real-time notifications
try {
  const { Server } = require('socket.io');
<<<<<<< HEAD
  if (!server) throw new Error('Socket.io disabled (serverless mode)');
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Attach io to app so routes can emit
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('A client connected to socket.io:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
} catch (e) {
  console.warn('Socket.io failed to initialize:', e.message || e);
}

<<<<<<< HEAD
//shawon

module.exports = app;
=======
//shawon
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
