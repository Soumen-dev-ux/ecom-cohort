import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

let accessToken = localStorage.getItem("accessToken");

export const setAccessToken = (token) => {
  accessToken = token;

  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  refreshToken: () => api.post("/auth/refresh-token"),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me")
};

export const productApi = {
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`)
};

export const fakeStoreApi = {
  getAll: () => axios.get("/fakestore/products")
};

export default api;
