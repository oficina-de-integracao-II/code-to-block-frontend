import axios from 'axios';

export const TOKEN_KEY = 'code-to-blocks-token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

const UNAUTHENTICATED_PATHS = ['/auth/login', '/auth/register', '/auth/google'];

function isUnauthenticatedRequest(url?: string) {
  return UNAUTHENTICATED_PATHS.some((path) => url?.includes(path));
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint = isUnauthenticatedRequest(error.config?.url);

    if (isUnauthorized && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return Promise.reject(error);
  },
);