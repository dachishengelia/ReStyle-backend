import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000", // Fallback to localhost
  withCredentials: true, // Include cookies in requests
});

// Log the base URL for debugging
console.log("Axios Base URL:", import.meta.env.VITE_API_BASE || "http://localhost:3000");

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
