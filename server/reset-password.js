const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const resetPassword = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Reset password to 'admin123'
    user.password = 'admin123';
    await user.save();

    console.log('✅ Password reset successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetPassword();