import axios from "axios";
import { API_BASE } from "../utils/constants";
import { storage } from "../utils/storage";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = storage.get("token");
  if (token) config.headers.authorization = token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      storage.clear();
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;
