import axios from "axios";

export const API_URL = "https://backend-chat-fcvm.onrender.com";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
