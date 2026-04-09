import axios from "axios";

/** In dev, call the API directly so Vite does not proxy (avoids proxy errors when the API is down). CORS is enabled on the backend for localhost:5173. */
const defaultDevApi = "http://127.0.0.1:8000";
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? defaultDevApi : "http://localhost:8000");

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
