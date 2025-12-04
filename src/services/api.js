import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-chat-fcvm.onrender.com/api", // backend rodando no Termux na porta 3000
  timeout: 10000,
});

export default api;
