import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  
  timeout: 30000, // 30 seconds timeout cho massive data
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 API Request with token to:', config.url);
    } else {
      console.warn('⚠️ No token found for request to:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - database might be processing large dataset');
      error.message = 'Request timeout - please try with smaller page size';
    }
    
    // Debug 401/403 errors
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized - Token might be invalid or expired');
    } else if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Insufficient permissions');
      console.error('Response data:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
