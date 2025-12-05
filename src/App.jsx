import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_URL = "https://backend-chat-fcvm.onrender.com";

export default function App() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");
const [token, setToken] = useState(localStorage.getItem("token") || "");
const [user, setUser] = useState(null);
const [isRegister, setIsRegister] = useState(false);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");
const [socket, setSocket] = useState(null);

useEffect(() => {
if (token) {
const s = io(API_URL, {
auth: { token },
transports: ["websocket"],
});
setSocket(s);

  s.on("connect", () => console.log("🔌 Socket conectado:", s.id));
  s.on("private_message", (msg) => setMessages((prev) => [...prev, msg]));
  s.on("disconnect", () => console.log("❌ Socket desconectado"));

  return () => s.disconnect();
}

}, [token]);

const handleRegister = async () => {
try {
const res = await axios.post("${API_URL}/auth/register", { name, email, password });
if (res.data.user) {
alert("Cadastro feito! Agora faça login.");
setIsRegister(false);
setName("");
setEmail("");
setPassword("");
}
} catch (err) {
alert(err.response?.data?.error || "Erro no cadastro");
}
};

const handleLogin = async () => {
try {
const res = await axios.post("${API_URL}/auth/login", { email, password });
if (res.data.token) {
localStorage.setItem("token", res.data.token);
setToken(res.data.token);
setUser(res.data.user);
setEmail("");
setPassword("");
}
} catch (err) {
alert(err.response?.data?.error || "Erro no login");
}
};

const sendMessage = () => {
if (!newMessage.trim() || !socket) return;
socket.emit("private_message", newMessage);
setNewMessage("");
};

const logout = () => {
localStorage.removeItem("token");
setToken("");
setUser(null);
setMessages([]);
if (socket) socket.disconnect();
setSocket(null);
};

if (!token) {
return (
<div style={{ padding: 20, color: "white" }}>
<h1>{isRegister ? "Cadastro" : "Login"}</h1>
{isRegister && <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />}
<input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
<input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
<button onClick={isRegister ? handleRegister : handleLogin}>
{isRegister ? "Cadastrar" : "Entrar"}
</button>
<p>
{isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
<span style={{ color: "lightblue", cursor: "pointer" }} onClick={() => setIsRegister(!isRegister)}>
{isRegister ? "Login" : "Cadastre-se"}
</span>
</p>
</div>
);
}

return (
<div style={{ padding: 20, color: "white" }}>
<h1>Chat Online 🔥</h1>
<p>Bem-vindo, {user?.name || "usuário"}!</p>

  <div style={{ height: 200, border: "1px solid #999", padding: 10, overflowY: "scroll", marginBottom: 10 }}>
    {messages.map((m, i) => (
      <p key={i}>
        <strong>{m.from}:</strong> {m.text || m}
      </p>
    ))}
  </div>

  <input
    placeholder="Digite sua mensagem..."
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />
  <button onClick={sendMessage}>Enviar</button>
  <br /><br />
  <button onClick={logout}>Sair</button>
</div>

);
}
