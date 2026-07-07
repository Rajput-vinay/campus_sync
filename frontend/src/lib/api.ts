import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Automatically inject X-Institute-Id header when a Super Admin has selected a campus
api.interceptors.request.use((config) => {
  const activeInstituteId = localStorage.getItem("activeInstituteId");
  if (activeInstituteId) {
    config.headers["x-institute-id"] = activeInstituteId;
  }
  return config;
});
