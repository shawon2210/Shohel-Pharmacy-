import axios from 'axios';

const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('/api/health');
    console.log('Health check:', healthResponse.data);
    
    // Test login
    const loginResponse = await axios.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('Login successful:', loginResponse.data);
    
  } catch (error) {
    console.error('API test failed:', error.response?.data || error.message);
  }
};

export default testAPI;