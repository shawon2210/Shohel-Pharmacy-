const mongoose = require('mongoose');
const User = require('./models/User');

const createUser = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    await User.deleteMany({ username: 'admin' });

    // Create new admin user
    const user = new User({
      username: 'admin',
      email: 'admin@pharmacy.com',
      password: 'admin123',
      role: 'admin',
      fullName: 'System Administrator',
      phone: '01700000000'
    });

    await user.save();
    console.log('✅ Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createUser();