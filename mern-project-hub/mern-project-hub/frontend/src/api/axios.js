import axios from "axios";

// In development, Vite's proxy (vite.config.js) forwards "/api" to localhost:5000.
// In production there's no dev proxy, so we point straight at the deployed backend
// via VITE_API_URL (set this in Vercel/Netlify env vars, e.g.
// https://project-hub-backend.onrender.com/api).
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ph_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ph_token");
      localStorage.removeItem("ph_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
