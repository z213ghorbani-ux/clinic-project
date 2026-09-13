import axios from "axios";

const api = axios.create({
  baseURL: "/api", // این دقیقاً وصل میشه به پروکسی vite.config
  headers: {
    Accept: "application/json",
  },
});

// ارسال خودکار توکن در هر درخواست
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// هندل خطای 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export default api;
