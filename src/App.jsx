import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Conecta ao backend assim que o componente carrega
  useEffect(() => {
    const newSocket = io("http://localhost:3000"); 
    setSocket(newSocket);

    // Recebe mensagens do backend
    newSocket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "" && socket) {
      socket.emit("chat_message", input);
      setInput("");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Chat em Tempo Real</h1>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            {msg}
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button style={styles.button} onClick={sendMessage}>
          Enviar
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: 600,
    margin: "0 auto",
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  chatBox: {
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 10,
    height: 400,
    overflowY: "auto",
    background: "#f7f7f7",
    marginBottom: 20,
  },
  message: {
    padding: 8,
    marginBottom: 10,
    background: "white",
    borderRadius: 5,
    boxShadow: "0 0 4px rgba(0,0,0,0.1)",
  },
  inputContainer: {
    display: "flex",
    gap: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};
