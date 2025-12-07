import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  login,
  register,
  getUsers,
  getMessages,
  sendMessage,
} from "./services/api";

const socket = io("https://backend-chat-fcvm.onrender.com");

export default function App() {
  const [page, setPage] = useState("login"); // login | register | chat
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // CARREGAR USUÁRIOS APÓS LOGIN
  useEffect(() => {
    if (!token) return;

    async function loadUsers() {
      const data = await getUsers(token);
      setUsers(data);
    }

    loadUsers();
  }, [token]);

  // RECEBER MENSAGENS EM TEMPO REAL
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // LOGIN
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await login(email, password);
      setToken(res.data.token);
      setUser(res.data.user);
      setPage("chat");
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer login");
    }
  }

  // REGISTER
  async function handleRegister(e) {
    e.preventDefault();
    try {
      await register(name, email, password);
      alert("Cadastro realizado! Faça login.");
      setPage("login");
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar");
    }
  }

  // SELECIONAR USUÁRIO E CARREGAR HISTÓRICO
  async function handleSelectUser(u) {
    setSelectedUser(u);

    if (!token || !user) return;

    try {
      const history = await getMessages(token, user._id, u._id);
      setMessages(history);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  }

  // ENVIAR MENSAGEM
  async function handleSend() {
    if (!message.trim()) return;
    if (!selectedUser) return;

    try {
      await sendMessage(token, selectedUser._id, message);

      socket.emit("sendMessage", {
        from: user._id,
        to: selectedUser._id,
        message,
      });

      setMessages((prev) => [
        ...prev,
        {
          from: user._id,
          to: selectedUser._id,
          message,
        },
      ]);

      setMessage("");
    } catch (err) {
      console.error(err);
    }
  }

  // TELAS

  if (page === "login") {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
        <button onClick={() => setPage("register")}>Criar conta</button>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div>
        <h2>Cadastro</h2>
        <form onSubmit={handleRegister}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Cadastrar</button>
        </form>

        <button onClick={() => setPage("login")}>Voltar</button>
      </div>
    );
  }

  // TELA DE CHAT
  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LISTA DE USUÁRIOS */}
      <div>
        <h3>Usuários</h3>
        {users.map((u) => (
          <div
            key={u._id}
            style={{
              padding: 10,
              cursor: "pointer",
              background:
                selectedUser?._id === u._id ? "#ddd" : "transparent",
            }}
            onClick={() => handleSelectUser(u)}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ flex: 1 }}>
        <h3>Chat</h3>

        <div
          style={{
            height: 300,
            overflowY: "auto",
            border: "1px solid #aaa",
            padding: 10,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                textAlign: msg.from === user._id ? "right" : "left",
                margin: 5,
              }}
            >
              {msg.message}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            style={{ width: "70%" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mensagem..."
          />
          <button onClick={handleSend}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
