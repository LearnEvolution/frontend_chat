// src/App.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

/**
 * Ajuste aqui se precisar (URL do seu backend no Render).
 * Pode manter a URL hardcoded assim ou usar uma var de ambiente.
 */
const API_URL = "https://backend-chat-fcvm.onrender.com";

export default function App() {
  const [phase, setPhase] = useState("auth"); // "auth" ou "chat"
  const [isRegister, setIsRegister] = useState(false);

  // auth fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // user state
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // chat state
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const messagesDivRef = useRef(null);

  // axios instance
  const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

  // connect socket when token becomes available
  useEffect(() => {
    if (!token) return;

    // connect with token auth
    const s = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("🔌 socket conectado", s.id);
    });

    s.on("private_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      // scroll to bottom
      setTimeout(() => {
        if (messagesDivRef.current) {
          messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
        }
      }, 50);
    });

    s.on("disconnect", (reason) => {
      console.log("❌ socket desconectado", reason);
    });

    s.on("connect_error", (err) => {
      console.warn("Erro conexão socket:", err.message || err);
    });

    return () => {
      s.off(); // remove all listeners
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // If token+user present (from localStorage), go to chat
  useEffect(() => {
    if (token && user) {
      setPhase("chat");
    }
  }, [token, user]);

  // Register
  const handleRegister = async () => {
    try {
      if (!name.trim() || !email.trim() || !password) {
        return alert("Preencha nome, email e senha.");
      }
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data.user) {
        alert("Cadastro OK — agora faça login.");
        setIsRegister(false);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        alert("Resposta inesperada do servidor.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Erro no cadastro");
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      if (!email.trim() || !password) return alert("Preencha email e senha.");
      const res = await api.post("/auth/login", { email, password });

      if (res.data.token) {
        const tk = res.data.token;
        const u = res.data.user;
        localStorage.setItem("token", tk);
        localStorage.setItem("user", JSON.stringify(u));
        setToken(tk);
        setUser(u);
        setEmail("");
        setPassword("");
        setPhase("chat");
      } else {
        alert("Credenciais inválidas.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Erro no login");
    }
  };

  // Logout
  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setMessages([]);
    setPhase("auth");
  };

  // Send message (private_message)
  const handleSend = () => {
    if (!text.trim()) return;
    if (!socketRef.current || !socketRef.current.connected) {
      return alert("Socket desconectado — faça login novamente.");
    }

    // envia texto; backend coloca from=socket.userId
    socketRef.current.emit("private_message", text);

    // opcional: mostrar localmente imediatamente
    setMessages((prev) => [...prev, { from: user?._id || "me", text }]);
    setText("");
    setTimeout(() => {
      if (messagesDivRef.current) messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
    }, 50);
  };

  // Small UI: auth screen
  if (phase === "auth") {
    return (
      <div style={{ padding: 20, color: "#fff", maxWidth: 640, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginTop: 0 }}>{isRegister ? "Cadastro" : "Login"}</h2>

        {isRegister && (
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
          </div>
        )}

        <div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
        </div>

        <div>
          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={isRegister ? handleRegister : handleLogin} style={{ padding: "8px 16px" }}>
            {isRegister ? "Cadastrar" : "Entrar"}
          </button>

          <button
            onClick={() => {
              setIsRegister(!isRegister);
            }}
            style={{ padding: "8px 12px", background: "transparent", color: "#9ecbff", border: "1px solid #9ecbff" }}
          >
            {isRegister ? "Ir para Login" : "Cadastre-se"}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <small>Backend: <code>{API_URL}</code></small>
        </div>
      </div>
    );
  }

  // Chat screen
  return (
    <div style={{ padding: 20, color: "#fff", maxWidth: 900, margin: "10px auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Chat Privado</h2>
        <div>
          <strong>{user?.name || "usuário"}</strong>
          <button onClick={handleLogout} style={{ marginLeft: 12, padding: "6px 10px" }}>
            Sair
          </button>
        </div>
      </div>

      <div
        ref={messagesDivRef}
        style={{
          marginTop: 12,
          height: 300,
          border: "1px solid #666",
          padding: 12,
          overflowY: "auto",
          background: "#111",
        }}
      >
        {messages.length === 0 && <div style={{ color: "#888" }}>Sem mensagens ainda</div>}
        {messages.map((m, idx) => {
          // m may be string or object { from, text }
          const from = m?.from ?? "anon";
          const txt = m?.text ?? (typeof m === "string" ? m : "");
          const mine = user && from === user._id;
          return (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div style={{ color: mine ? "#8fffb0" : "#9ecbff", fontSize: 13 }}>
                {mine ? "Você" : from}
              </div>
              <div style={{ color: "#fff" }}>{txt}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          placeholder="Digite a mensagem e tecle Enter..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleSend} style={{ padding: "8px 12px" }}>
          Enviar
        </button>
      </div>
    </div>
  );
}

