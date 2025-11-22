import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // Backend API base URL
  withCredentials: true, // Include cookies in requests
});

export default axiosInstance;
