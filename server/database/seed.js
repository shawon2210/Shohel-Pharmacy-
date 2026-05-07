const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./init');

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/shohel_pharmacy';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ Connected to MongoDB for seeding');

    // Initialize database
    await initializeDatabase();

    console.log('🌱 Database seeding completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };