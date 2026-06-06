import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Skip adding Bearer prefix if it's a demo token (to prevent backend crashes on demo mode)
  if (token && !token.startsWith('demo.')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
