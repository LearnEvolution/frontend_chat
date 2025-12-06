// src/services/socket.js
import { io } from "socket.io-client";
import { API_URL } from "./api";

let socket = null;

/**
 * Conecta (ou reconecta) o socket com o token passado.
 * - Sempre devolve a instância ativa.
 */
export function connectSocket(token) {
  // limpa socket antigo se existir
  if (socket && socket.connected) {
    try { socket.disconnect(); } catch (e) { /* ignore */ }
    socket = null;
  }

  // cria nova conexão com autenticação
  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch (e) { /* ignore */ }
    socket = null;
  }
}
