import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000", // Fallback to localhost
  withCredentials: true, // Include cookies in requests
});

export default axiosInstance;
