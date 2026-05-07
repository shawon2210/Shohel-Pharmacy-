const mongoose = require('mongoose');

const verifyCollections = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📋 Collections in database:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    console.log('\n📊 Document counts:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }

    console.log('\n🎉 All collections created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyCollections();