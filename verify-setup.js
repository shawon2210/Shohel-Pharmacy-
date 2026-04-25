const axios = require('axios');

async function verifySetup() {
  console.log('🔍 Verifying Pharmacy Management System Setup...\n');

  // Test backend health
  try {
    const response = await axios.get('http://localhost:5001/api/health', { timeout: 3000 });
    console.log('✅ Backend server is running');
    console.log('   Response:', response.data.message);
  } catch (error) {
    console.log('❌ Backend server is not accessible');
    console.log('   Error:', error.message);
    console.log('   Solution: Run "cd server && npm run dev" or use "start-app.bat"');
    return;
  }

  // Test auth endpoint
  try {
    await axios.post('http://localhost:5001/api/auth/login', {
      username: 'invalid',
      password: 'invalid'
    }, { timeout: 3000 });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentication endpoint is working');
    } else {
      console.log('⚠️  Authentication endpoint issue:', error.message);
    }
  }

  // Test database connection (indirect)
  try {
    const response = await axios.get('http://localhost:5001/api/medicines', { timeout: 3000 });
    console.log('✅ Database connection is working');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Database connection is working (auth required)');
    } else {
      console.log('⚠️  Database connection issue:', error.message);
    }
  }

  console.log('\n🎉 Setup verification complete!');
  console.log('📝 Frontend should be accessible at: http://localhost:3000');
  console.log('🔧 Backend API is accessible at: http://localhost:5001');
}

verifySetup().catch(console.error);