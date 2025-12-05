import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "https://backend-chat-fcvm.onrender.com";

const token = localStorage.getItem("token");

export const api = axios.create({
baseURL: API_URL,
});

export const socket = io(API_URL, {
auth: { token },
});
