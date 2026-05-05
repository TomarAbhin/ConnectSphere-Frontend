import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const plainApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const { refreshToken, logout, login, user } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await plainApi.post('/auth/refresh', { refreshToken }, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const payload = response.data;
        login({
          user: payload.user || user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken || refreshToken,
        });
        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { plainApi };
export default api;
