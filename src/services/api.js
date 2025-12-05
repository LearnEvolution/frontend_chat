import axios from "axios";
import { io } from "socket.io-client";

// Conexão Socket.IO
const token = localStorage.getItem("token");
const socket = io("https://backend-chat-fcvm.onrender.com", {
  auth: { token },
});

// Conexão Axios
const api = axios.create({
  baseURL: "https://backend-chat-fcvm.onrender.com",
});

export { api, socket };
