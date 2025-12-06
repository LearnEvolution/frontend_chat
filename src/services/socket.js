import { io } from "socket.io-client";
import { API_URL } from "./api";

// pega o token salvo no login
const token = localStorage.getItem("token");

// cria conexão única do socket
export const socket = io(API_URL, {
transports: ["websocket"],
query: { token }
});
