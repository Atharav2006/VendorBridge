import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Attach bearer token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Recursively map _id to id in responses to match frontend models
const mapIds = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(mapIds);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (let key in obj) {
      if (key === '_id') {
        newObj['id'] = obj[key];
        newObj['_id'] = obj[key];
      } else {
        newObj[key] = mapIds(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

// Global interceptor to handle actual network responses and map IDs
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = mapIds(response.data);
    }
    return response;
  },
  (error) => {
    console.error("API Network Error:", error.response?.data || error.message);
    
    // Automatically log out if token is invalid or expired
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
