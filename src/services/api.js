import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-chat-fcvm.onrender.com/api", // backend rodando no Termux na porta 3000
  timeout: 10000,
});

export default api;


/*import axios from "axios";

// Usa variável de ambiente, cai no localhost se não definida
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

export default api;
*/
