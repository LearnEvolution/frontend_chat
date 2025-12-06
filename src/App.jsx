// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { login, getUsers } from "./services/api";
import {
  connectSocket,
  sendPrivateMessage,
  getSocket,
  disconnectSocket,
} from "./services/socket";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const messagesRef = useRef();

  // ao token mudar, conecta socket
  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);

    s.on("connect", () => console.log("🔌 socket conectado", s.id));
    s.on("private_message", (msg) => {
      // msg vem do backend (objeto salvo no DB)
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }, 50);
    });
    s.on("disconnect", (r) => console.log("❌ socket desconectado", r));
    s.on("connect_error", (err) => console.warn("Erro conexão socket:", err?.message || err));

    return () => {
      try {
        s.off("private_message");
        s.disconnect();
      } catch (e) {}
    };
  }, [token]);

  // se já tenho token + user no localStorage, re-hidrata
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) setUser(JSON.parse(rawUser));
    const tk = localStorage.getItem("token");
    if (tk) setToken(tk);
  }, []);

  // Função de login de exemplo (você pode trocar por formulário depois)
  async function handleLoginTemp() {
    try {
      const res = await login("teste@teste.com", "123456"); // só pra TESTE
      // res = { token, user }
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      // carregar lista de usuários (exceto eu)
      const list = await getUsers(res.token);
      setUsers(list);
    } catch (err) {
      console.error(err);
      alert("Erro no login de teste: " + (err.response?.data?.message || err.message));
    }
  }

  async function handleLoadUsers() {
    if (!token) return alert("Faça login primeiro");
    try {
      const list = await getUsers(token);
      setUsers(list);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar usuários");
    }
  }

  function handleSelectUser(u) {
    setSelectedUser(u);
    // opcional: você pode limpar mensagens ou carregar histórico via /messages API
  }

  function handleSend() {
    if (!selectedUser) return alert("Selecione um usuário");
    if (!text.trim()) return;

    // envia { to, text } — backend grava e emite para o destinatário
    const ok = sendPrivateMessage(selectedUser._id, text);
    if (!ok) return alert("Socket desconectado — faça login novamente.");
    // opcional: mostrar localmente (backend também emitirá para você)
    setMessages((prev) => [...prev, { from: user._id, to: selectedUser._id, text }]);
    setText("");
    setTimeout(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, 50);
  }

  function handleLogout() {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(""); setUser(null); setUsers([]); setMessages([]); setSelectedUser(null);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat Privado</h1>

      {!user ? (
        <div>
          <p>Você não está logado.</p>
          <button onClick={handleLoginTemp}>Login de teste (teste@teste.com / 123456)</button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              Logado como: <strong>{user.name} ({user.email})</strong>
            </div>
            <div>
              <button onClick={handleLoadUsers} style={{ marginRight: 8 }}>Recarregar usuários</button>
              <button onClick={handleLogout}>Sair</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
            <div style={{ width: 220 }}>
              <h3>Usuários</h3>
              <div style={{ border: "1px solid #ddd", padding: 8 }}>
                {users.length === 0 && <div style={{ color: "#666" }}>Nenhum usuário (clique Recarregar)</div>}
                {users.map((u) => (
                  <div key={u._id} onClick={() => handleSelectUser(u)} style={{ padding: 8, cursor: "pointer", background: selectedUser?._id === u._id ? "#eef" : "transparent" }}>
                    {u.name} <br/><small>{u.email}</small>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h3>Chat{selectedUser ? ` com ${selectedUser.name}` : ""}</h3>

              <div ref={messagesRef} style={{ height: 300, overflowY: "auto", border: "1px solid #ddd", padding: 10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "#555" }}>{m.from === user._id ? "Você" : (m.fromName || m.from)}</div>
                    <div>{m.text}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <input value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: 8 }} placeholder={selectedUser ? "Digite a mensagem..." : "Selecione um usuário primeiro"} />
                <button onClick={handleSend}>Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

