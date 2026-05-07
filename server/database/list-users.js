const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    const users = await User.find({}, 'username email role');
    console.log('Users in DB:');
    users.forEach(u => console.log(` - ${u.username} (${u.email}) [${u.role}]`));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error listing users:', err.message);
    process.exit(1);
  }
})();
