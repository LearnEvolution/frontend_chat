// src/services/api.js
import axios from "axios";

export const API_URL = "https://backend-chat-fcvm.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

/**
 * login(email, password)
 * Retorna { token, user } (lança erro se credenciais inválidas)
 */
export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

/**
 * getUsers(token)
 * Retorna array de usuários (exceto o usuário logado).
 * Header Authorization Bearer <token>
 */
export async function getUsers(token) {
  if (!token) throw new Error("token ausente");
  const res = await api.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
