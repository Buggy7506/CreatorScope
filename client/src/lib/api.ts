import axios from 'axios';
import { getToken } from './auth';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? getToken() : null;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
