import { useEffect, useState } from "react";
import api from "../services/api";

function Chat({ user }) {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState("");

  const testarToken = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/ping", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResposta("Token válido! Backend respondeu ✔");
    } catch (err) {
      setResposta("Token INVÁLIDO ❌");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Chat</h1>
      <p>Usuário logado: <strong>{user?.name}</strong></p>

      <button onClick={testarToken}>Testar comunicação com o backend</button>

      {resposta && (
        <p style={{ marginTop: 15, color: "yellow" }}>{resposta}</p>
      )}
    </div>
  );
}

export default Chat;

