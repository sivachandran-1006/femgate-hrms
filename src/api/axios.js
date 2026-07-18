import axios from "axios";
import { API_BASE } from "../utils/constants";
import { storage } from "../utils/storage";

const api = axios.create({ baseURL: API_BASE });

// main_v1: UI-only demo branch — no backend connection is ever allowed, even accidentally.
// Every request is short-circuited here before it reaches the network; callers fall through
// to their existing `rawX?.length ? rawX : MOCK_X` mock-fallback logic exactly as if the
// request had failed. This is a deliberate, branch-specific guard — do not remove without
// also removing the mock-fallback wiring added throughout src/screens/**.
const NO_BACKEND_ON_THIS_BRANCH = true;

api.interceptors.request.use((config) => {
  if (NO_BACKEND_ON_THIS_BRANCH) {
    const err = new Error(`main_v1 is UI-only — blocked network request to ${config.url}`);
    err.isMockBranchBlock = true;
    return Promise.reject(err);
  }
  const token = storage.get("token");
  if (token) config.headers.Authorization = token;
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
