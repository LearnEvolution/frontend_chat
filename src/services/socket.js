// src/services/socket.js
import { io } from "socket.io-client";
import { API_URL } from "./api";

let socket = null;

/**
 * Conecta passando o token na QUERY (igual backend exige).
 */
export function connectSocket(token) {
  // se já existe socket antigo, desconecta
  if (socket) {
    try { socket.disconnect(); } catch (e) {}
    socket = null;
  }

  socket = io(API_URL, {
    transports: ["websocket"],
    autoConnect: true,
    query: { token }  // <<=== AQUI O SEGREDO !!!
  });

  return socket;
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
