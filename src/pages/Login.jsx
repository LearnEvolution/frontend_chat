import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        onLogin(res.data.user);
      } else {
        alert("Erro ao fazer login!");
      }
    } catch (err) {
      alert("Credenciais inválidas!");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        style={{ display: "block", marginBottom: 10, width: "100%" }}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        style={{ display: "block", marginBottom: 10, width: "100%" }}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}

export default Login;
