import axios from "axios";

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: backendURL,
});
/* base */
// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    // Check if this is a partner API request
    const isPartner = config.url?.includes("/api/partners");

    // Get the correct token
    const token = isPartner
      ? localStorage.getItem("partnerToken")
      : localStorage.getItem("token");

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
