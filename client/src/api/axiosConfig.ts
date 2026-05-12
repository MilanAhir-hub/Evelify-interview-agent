import axios from 'axios';

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For handling cookies/sessions if needed
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
