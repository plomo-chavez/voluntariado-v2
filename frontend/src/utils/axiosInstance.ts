import { getTokenUser } from "@/utils/authHelper";
import axios, { AxiosRequestConfig } from "axios";

// Vite define esto automáticamente
const isProd = import.meta.env.PROD;

// Variable inyectada por Vite en build-time
const baseURL = import.meta.env.VITE_API_URL;

// Validación clara y correcta para frontend
if (!baseURL) {
  throw new Error(
    "La variable VITE_API_URL no está definida. Revisa config/.env.frontend o config/.env.frontend.prod",
  );
}

console.log("Base URL =>", baseURL, "| PROD:", isProd);

// ===============================
// INSTANCIA AXIOS
// ===============================
const axiosInstance = axios.create({
  baseURL, // Ya incluye protocolo y puerto desde el .env
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 600000,
});

// ===============================
// INTERCEPTOR DE REQUEST
// ===============================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenUser();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ===============================
// CUSTOM REQUEST
// ===============================
function customRequest(
  configOrUrl: string | AxiosRequestConfig,
  additionalConfig: AxiosRequestConfig = {},
) {
  let finalConfig: AxiosRequestConfig;

  if (typeof configOrUrl === "string") {
    finalConfig = {
      url: configOrUrl,
      method: "post",
      data: {},
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 600000,
      ...additionalConfig,
    };
  } else {
    finalConfig = {
      ...configOrUrl,
      ...additionalConfig,
    };
  }

  return axiosInstance.request(finalConfig);
}

export { axiosInstance, customRequest };
