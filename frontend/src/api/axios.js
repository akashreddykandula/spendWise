import axios from "axios";

const api = axios.create({
  baseURL: 'https://spendwise-backend-j54p.onrender.com',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("user");
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export default api;
