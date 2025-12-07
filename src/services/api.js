import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-chat-fcvm.onrender.com",
});

// LOGIN
export async function login(email, password) {
  return api.post("/auth/login", { email, password });
}

// REGISTER
export async function register(name, email, password) {
  return api.post("/auth/register", { name, email, password });
}

// BUSCAR USUÁRIOS
export async function getUsers(token) {
  const res = await api.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// BUSCAR HISTÓRICO DE MENSAGENS
export async function getMessages(token, from, to) {
  const res = await api.get(`/messages/${from}/${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ENVIAR MENSAGEM
export async function sendMessage(token, to, message) {
  return api.post(
    "/messages/send",
    { to, message },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export default api;
