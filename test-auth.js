const axios = require('axios');

const testAuth = async () => {
  try {
    console.log('Testing authentication...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
};

testAuth();