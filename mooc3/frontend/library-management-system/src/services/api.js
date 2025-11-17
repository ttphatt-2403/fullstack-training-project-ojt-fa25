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
    return Promise.reject(error);
  }
);

export default api;
