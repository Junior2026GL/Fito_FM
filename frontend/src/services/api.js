import axios from "axios";
import { env } from "../config/env.js";

export const api = axios.create({
  baseURL: env.API_URL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fito_fm_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido y NO es el endpoint de login,
    // limpiamos la sesión y redirigimos al login.
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("fito_fm_token");
      localStorage.removeItem("fito_fm_user");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);
