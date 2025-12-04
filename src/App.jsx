import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const login = async () => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        alert("Login feito com sucesso!");
      } else {
        alert("Erro ao logar!");
      }
    } catch (err) {
      console.log(err);
      alert("Falha na conexão com o servidor.");
    }
  };

  if (!token) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        <h1>Login</h1>

        <input
          style={{ display: "block", marginBottom: 10, width: "100%" }}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={{ display: "block", marginBottom: 10, width: "100%" }}
          placeholder="Senha"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Chat conectado! 🔥</h1>
      <p>Token salvo no navegador!</p>
    </div>
  );
}

export default App;
