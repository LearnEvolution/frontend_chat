import { useState } from "react";
import { login } from "./services/api";

export default function Login({ onLogin }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

async function handleLogin(e) {
e.preventDefault();

try {
  const res = await login(email, password);

  localStorage.setItem("token", res.token);
  localStorage.setItem("user", JSON.stringify(res.user));

  onLogin(res.user);
} catch (err) {
  alert("Erro ao fazer login: " + (err.response?.data?.message || err.message));
}

}

return (
<div style={{ padding: 20 }}>
<h2>Login</h2>

  <form onSubmit={handleLogin}>
    <input
      type="email"
      placeholder="Seu email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Senha"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    <button type="submit">Entrar</button>
  </form>
</div>

);
}
