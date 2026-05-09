<<<<<<< HEAD
const mongoose = require('mongoose');
const { initializeDatabase } = require('./init');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    await initializeDatabase();
    await mongoose.disconnect();
    console.log('init run complete');
    process.exit(0);
  } catch (err) {
    console.error('init run error:', err.message);
    process.exit(1);
  }
})();
=======
const mongoose = require('mongoose');
const { initializeDatabase } = require('./init');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    await initializeDatabase();
    await mongoose.disconnect();
    console.log('init run complete');
    process.exit(0);
  } catch (err) {
    console.error('init run error:', err.message);
    process.exit(1);
  }
})();
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
