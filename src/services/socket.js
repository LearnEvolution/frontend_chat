// src/services/socket.js
import { io } from "socket.io-client";
import { API_URL } from "./api";

let socket = null;

/**
 * Conecta o socket usando token JWT (enviado na query, backend espera token na query).
 * Retorna a instância do socket.
 */
export function connectSocket(token) {
  // desconecta socket anterior
  if (socket) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
  }

  // cria nova conexão (query token porque backend usa socket.handshake.query.token)
  socket = io(API_URL, {
    transports: ["websocket"],
    autoConnect: true,
    query: { token },
  });

  return socket;
}

/**
 * Envia mensagem privada para o backend: objeto { to, text }.
 * O backend grava em DB e envia para o destinatário (io.to(to).emit(...))
 */
export function sendPrivateMessage(to, text) {
  if (!socket || !socket.connected) return false;
  socket.emit("private_message", { to, text });
  return true;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
  }
}
