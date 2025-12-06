// src/App.jsx
import { useEffect, useState, useRef } from "react";
import { api, API_URL } from "./services/api";
import { connectSocket, getSocket, disconnectSocket } from "./services/socket";

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
  const messagesDivRef = useRef(null);

  // Connect socket when token is set
  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);

    function onPrivateMessage(msg) {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        if (messagesDivRef.current) messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
      }, 50);
    }

    s.on("connect", () => console.log("🔌 socket conectado", s.id));
    s.on("private_message", onPrivateMessage);
    s.on("disconnect", (r) => console.log("❌ socket desconectado", r));
    s.on("connect_error", (err) => console.warn("Erro conexão socket:", err?.message || err));

    return () => {
      try {
        s.off("private_message", onPrivateMessage);
        s.off();
        // don't disconnect here if you want keep alive across re-renders — we created per token, so safe to disconnect:
        s.disconnect();
      } catch (e) {}
    };
  }, [token]);

  // If token+user present (from localStorage), go to chat
  useEffect(() => {
    if (token && user) setPhase("chat");
  }, [token, user]);

  // Register
  const handleRegister = async () => {
    try {
      if (!name.trim() || !email.trim() || !password) return alert("Preencha nome, email e senha.");
      const res = await api.post("/auth/register", { name, email, password });
      if (res.data.user) {
        alert("Cadastro OK — agora faça login.");
        setIsRegister(false);
        setName(""); setEmail(""); setPassword("");
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
        setEmail(""); setPassword("");
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
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(""); setUser(null); setMessages([]); setPhase("auth");
  };

  // Send message
  const handleSend = () => {
    if (!text.trim()) return;
    const s = getSocket();
    if (!s || !s.connected) return alert("Socket desconectado — faça login novamente.");
    s.emit("private_message", text);
    setMessages((prev) => [...prev, { from: user?._id || "me", text }]);
    setText("");
    setTimeout(() => { if (messagesDivRef.current) messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight; }, 50);
  };

  // UI — AUTH
  if (phase === "auth") {
    return (
      <div style={{ padding: 20, color: "#fff", maxWidth: 640, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginTop: 0 }}>{isRegister ? "Cadastro" : "Login"}</h2>

        {isRegister && (
          <input placeholder="Nome" value={name} onChange={(e)=>setName(e.target.value)} style={{ width:"100%", padding:8, marginBottom:8 }} />
        )}

        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width:"100%", padding:8, marginBottom:8 }} />
        <input placeholder="Senha" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ width:"100%", padding:8, marginBottom:8 }} />

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={isRegister ? handleRegister : handleLogin} style={{ padding:"8px 16px" }}>{isRegister ? "Cadastrar" : "Entrar"}</button>
          <button onClick={()=>setIsRegister(!isRegister)} style={{ padding:"8px 12px", background:"transparent", color:"#9ecbff", border:"1px solid #9ecbff" }}>{isRegister ? "Ir para Login" : "Cadastre-se"}</button>
        </div>

        <small style={{ marginTop:12, display:"block" }}>Backend: <code>{API_URL}</code></small>
      </div>
    );
  }

  // UI — CHAT
  return (
    <div style={{ padding:20, color:"#fff", maxWidth:900, margin:"10px auto", fontFamily:"Arial, sans-serif" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ margin:0 }}>Chat Privado</h2>
        <div>
          <strong>{user?.name || "usuário"}</strong>
          <button onClick={handleLogout} style={{ marginLeft:12, padding:"6px 10px" }}>Sair</button>
        </div>
      </div>

      <div ref={messagesDivRef} style={{ marginTop:12, height:300, border:"1px solid #666", padding:12, overflowY:"auto", background:"#111" }}>
        {messages.length === 0 && <div style={{ color:"#888" }}>Sem mensagens ainda</div>}
        {messages.map((m, idx) => {
          const from = m?.from ?? "anon";
          const txt = m?.text ?? (typeof m === "string" ? m : "");
          const mine = user && from === user._id;
          return (
            <div key={idx} style={{ marginBottom:8 }}>
              <div style={{ color: mine ? "#8fffb0" : "#9ecbff", fontSize:13 }}>{mine ? "Você" : from}</div>
              <div style={{ color:"#fff" }}>{txt}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:12, display:"flex", gap:8 }}>
        <input placeholder="Digite a mensagem e tecle Enter..." value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&handleSend()} style={{ flex:1, padding:8 }} />
        <button onClick={handleSend} style={{ padding:"8px 12px" }}>Enviar</button>
      </div>
    </div>
  );
}

