import { useState, useEffect } from "react";
import { api, socket } from "./services/api";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (token) {
      socket.on("connect", () => console.log("🔌 Socket conectado:", socket.id));
      socket.on("private_message", (msg) => setMessages((prev) => [...prev, msg]));
      socket.on("disconnect", () => console.log("❌ Socket desconectado"));
    }

    return () => socket.off("private_message");
  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        alert("Login feito com sucesso!");
      }
    } catch {
      alert("Falha na conexão com o servidor ou credenciais inválidas.");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data.user) {
        alert("Cadastro realizado com sucesso! Faça login.");
        setIsRegister(false);
      }
    } catch {
      alert("Falha na conexão com o servidor ou email já cadastrado.");
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("private_message", { from: user?._id, text: newMessage });
      setNewMessage("");
    }
  };

  if (!token) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        <h1>{isRegister ? "Cadastro" : "Login"}</h1>
        {isRegister && <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />}
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={isRegister ? handleRegister : handleLogin}>
          {isRegister ? "Cadastrar" : "Entrar"}
        </button>
        <p>
          {isRegister ? "Já tem conta?" : "Não tem conta?"}
          <span style={{ color: "lightblue", cursor: "pointer" }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Cadastre-se"}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Chat conectado! 🔥</h1>
      <p>Bem-vindo, {user?.name || "usuário"}!</p>
      <input placeholder="Digite a mensagem..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
      <button onClick={sendMessage}>Enviar</button>
      <div>
        {messages.map((m, idx) => (
          <p key={idx}>
            <strong>{m.from}:</strong> {m.text}
          </p>
        ))}
      </div>
      <button onClick={() => { localStorage.removeItem("token"); setToken(""); setUser(null); setMessages([]); }}>
        Sair
      </button>
    </div>
  );
}

export default App;
