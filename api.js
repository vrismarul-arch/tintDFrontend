import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: backendURL,
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    // Get the authentication token from local storage
    const token = localStorage.getItem('token'); 
    
    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;