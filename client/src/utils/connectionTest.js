import axios from 'axios';

export const testBackendConnection = async () => {
  try {
    const response = await axios.get('/api/health', { timeout: 3000 });
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on port 5001');
    }
    return false;
  }
};

export const testAuthEndpoint = async () => {
  try {
    const response = await axios.post('/api/auth/login', {
      username: 'test',
      password: 'test'
    }, { timeout: 3000 });
    console.log('✅ Auth endpoint accessible');
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Auth endpoint accessible (expected 401 for invalid credentials)');
      return true;
    }
    console.error('❌ Auth endpoint failed:', error.message);
    return false;
  }
};