import { useState, useEffect } from "react";
import api from "./services/api";
import { io } from "socket.io-client";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Conecta Socket.IO quando há token
  useEffect(() => {
    if (token) {
      const socketIo = io("https://backend-chat-fcvm.onrender.com", {
        auth: { token },
      });

      socketIo.on("connect", () => {
        console.log("🔌 Socket conectado:", socketIo.id);
      });

      socketIo.on("private_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socketIo.on("disconnect", () => {
        console.log("❌ Socket desconectado");
      });

      setSocket(socketIo);

      return () => socketIo.disconnect();
    }
  }, [token]);

  // LOGIN
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        alert("Login feito com sucesso!");
      }
    } catch (err) {
      console.log(err);
      alert("Falha na conexão com o servidor ou credenciais inválidas.");
    }
  };

  // CADASTRO
  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data.user) {
        alert("Cadastro realizado com sucesso! Faça login.");
        setIsRegister(false);
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.log(err);
      alert("Falha na conexão com o servidor ou email já cadastrado.");
    }
  };

  // TESTAR BACKEND
  const handlePing = async () => {
    try {
      const res = await api.get("/ping");
      alert("Ping OK: " + JSON.stringify(res.data));
    } catch (err) {
      console.log(err);
      alert("Falha na conexão com backend");
    }
  };

  // ENVIAR MENSAGEM PRIVADA
  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit("private_message", {
        from: user._id,
        to: user._id, // substitua pelo ID do destinatário real
        text: newMessage,
      });
      setNewMessage("");
    }
  };

  // PÁGINA LOGIN / CADASTRO
  if (!token) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        <h1>{isRegister ? "Cadastro" : "Login"}</h1>

        {isRegister && (
          <input
            type="text"
            placeholder="Nome"
            style={{ display: "block", marginBottom: 10, width: "100%" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          style={{ display: "block", marginBottom: 10, width: "100%" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          style={{ display: "block", marginBottom: 10, width: "100%" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={isRegister ? handleRegister : handleLogin}>
          {isRegister ? "Cadastrar" : "Entrar"}
        </button>

        <p style={{ marginTop: 10 }}>
          {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
          <span
            style={{ color: "lightblue", cursor: "pointer" }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Cadastre-se"}
          </span>
        </p>

        <button
          style={{ marginTop: 10, background: "orange" }}
          onClick={handlePing}
        >
          Testar Backend
        </button>
      </div>
    );
  }

  // PÁGINA DO CHAT
  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Chat conectado! 🔥</h1>
      <p>Bem-vindo, {user?.name || "usuário"}!</p>

      <div>
        <input
          type="text"
          placeholder="Digite a mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {messages.map((m, idx) => (
          <p key={idx}>
            <strong>{m.from}:</strong> {m.text} <em>({new Date(m.createdAt).toLocaleTimeString()})</em>
          </p>
        ))}
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          setToken("");
          setUser(null);
          setMessages([]);
        }}
        style={{ marginTop: 20 }}
      >
        Sair
      </button>
    </div>
  );
}

export default App;

