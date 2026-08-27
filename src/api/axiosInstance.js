import axios from 'axios';
import { auth } from '../firebase/config';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Request interceptor to inject Firebase ID Token
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
