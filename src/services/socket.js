import { io } from "socket.io-client";
import { API_URL } from "./api";

let socket = null;

/**

* Conecta passando o token na QUERY.
*/
export function connectSocket(token) {
if (socket) {
try { socket.disconnect(); } catch (e) {}
socket = null;
}

socket = io(API_URL, {
transports: ["websocket"],
autoConnect: true,
query: { token },
});

return socket;
}

/**

* Envia mensagem privada para o backend.
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
