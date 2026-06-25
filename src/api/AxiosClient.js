import axios from "axios";
import { getPlatformConfig, isConfigured } from "../config";

export const getBaseURL = () => {
  return "https://mgate-hrms-api.local";
};

const handleApiError = (error) => {
  if (error.response?.data) {
    throw error.response.data;
  }
  throw { message: error.message || "Network error" };
};

const buildUrl = (base, endpoint) =>
  endpoint ? `${base.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}` : base;

export default class AxiosClient {
  constructor(endpoint, config = {}) {
    this.endpoint = endpoint;

    this.axiosInstance = axios.create({
      baseURL: config.baseURL ?? getBaseURL(),
      withCredentials: true,
      timeout: 30000,
    });

    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const excludeTokenEndpoints = [
          "/login",
          "/register",
        ];

        const shouldExcludeToken = excludeTokenEndpoints.some((endpoint) =>
          config.url?.includes(endpoint)
        );

        if (isConfigured()) {
          const platformConfig = getPlatformConfig();

          if (!shouldExcludeToken) {
            try {
              const accessToken = await platformConfig.getAccessToken();
              if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
              }
            } catch (error) {
              console.error("Error getting access token:", error);
            }
          } else {
            delete config.headers.Authorization;
          }

          try {
            const platformHeaders = await platformConfig.getHeaders();
            config.headers = { ...config.headers, ...platformHeaders };
          } catch (error) {
            console.error("Error getting platform headers:", error);
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    let isLoggingOut = false;
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401 && !isLoggingOut) {
          isLoggingOut = true;

          if (isConfigured()) {
            const platformConfig = getPlatformConfig();
            try {
              await platformConfig.onUnauthorized();
            } catch (err) {
              console.error("Error in unauthorized handler:", err);
            }
          }

          setTimeout(() => {
            isLoggingOut = false;
          }, 1000);
        }
        return Promise.reject(error);
      }
    );
  }

  get = async (endpoint = null, config = {}) => {
    const url = buildUrl(this.endpoint, endpoint);
    return this.axiosInstance
      .get(url, config)
      .then((res) => res.data)
      .catch(handleApiError);
  };

  post = async (data, config = {}) => {
    return this.axiosInstance
      .post(this.endpoint, data, config)
      .then((res) => res.data)
      .catch(handleApiError);
  };

  put = async (endpoint = null, data, config = {}) => {
    const url = buildUrl(this.endpoint, endpoint);
    return this.axiosInstance
      .put(url, data, config)
      .then((res) => res.data)
      .catch(handleApiError);
  };

  patch = async (endpoint = null, data, config = {}) => {
    const url = buildUrl(this.endpoint, endpoint);
    return this.axiosInstance
      .patch(url, data, config)
      .then((res) => res.data)
      .catch(handleApiError);
  };

  delete = async (endpoint = null, params) => {
    const url = buildUrl(this.endpoint, endpoint);
    return this.axiosInstance
      .delete(url, { params })
      .then((res) => res.data)
      .catch(handleApiError);
  };
}
