/*import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-chat-fcvm.onrender.com/api", // backend rodando no Termux na porta 3000
  timeout: 10000,
});

export default api;
*/
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://backend-chat-fcvm.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para enviar token em todas requisições que precisarem
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
