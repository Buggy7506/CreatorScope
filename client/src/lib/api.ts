import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (token) {
      config.headers = config.headers ?? {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);