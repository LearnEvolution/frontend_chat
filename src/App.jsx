import React, { useState } from "react";
import { login, getUsers } from "./services/api";
import {
connectSocket,
sendPrivateMessage,
} from "./services/socket";

export default function App() {
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");

const [user, setUser] = useState(null);
const [users, setUsers] = useState([]);
const [messages, setMessages] = useState([]);
const [selectedUser, setSelectedUser] = useState(null);
const [text, setText] = useState("");

async function handleLogin() {
const res = await login(email, senha);
setUser(res.user);

const s = connectSocket(res.token);

s.on("private_message", (msg) => {
  setMessages((prev) => [...prev, msg]);
});

loadUsers(res.token);

}

async function loadUsers(token) {
const list = await getUsers(token);
setUsers(list.filter((u) => u._id !== user._id));
}

function handleSend() {
if (!selectedUser) return alert("Selecione um usuário!");
if (!text.trim()) return;

sendPrivateMessage(selectedUser._id, text);
setText("");

}

return (
<div style={{ padding: 20 }}>
<h1>Chat</h1>

  {!user && (
    <div>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="Senha"
        value={senha}
        type="password"
        onChange={(e) => setSenha(e.target.value)}
        style={{ padding: 10, display: "block", marginBottom: 10 }}
      />

      <button onClick={handleLogin}>Entrar</button>
    </div>
  )}

  {user && (
    <div>
      <h2>Usuários</h2>

      {users.map((u) => (
        <div
          key={u._id}
          style={{
            padding: 10,
            marginBottom: 5,
            background: selectedUser?._id === u._id ? "#ccc" : "#eee",
            cursor: "pointer",
          }}
          onClick={() => setSelectedUser(u)}
        >
          {u.name}
        </div>
      ))}

      <h2>Chat</h2>

      <div
        style={{
          width: "100%",
          height: 200,
          border: "1px solid #aaa",
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.from === user._id ? "Você:" : "Ele:"}</b> {m.text}
          </div>
        ))}
      </div>

      <input
        style={{ width: "80%", padding: 10 }}
        placeholder="Mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleSend} style={{ marginLeft: 10, padding: 10 }}>
        Enviar
      </button>
    </div>
  )}
</div>

);
}
