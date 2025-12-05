import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://backend-chat-fcvm.onrender.com", {
  transports: ["websocket"],
});

export default function App() {
  const [messages, setMessages] = useState([]);
  const [txt, setTxt] = useState("");

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("message");
  }, []);

  function sendMsg() {
    if (txt.trim() === "") return;
    socket.emit("message", txt);
    setTxt("");
  }

  return (
    <div>
      <h1>Chat Online</h1>

      <div style={{ height: 200, border: "1px solid #999", padding: 10 }}>
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>

      <input
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        placeholder="Digite..."
      />
      <button onClick={sendMsg}>Enviar</button>
    </div>
  );
}
