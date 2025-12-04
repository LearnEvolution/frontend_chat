import { useState } from "react";
import api from "./services/api";

function App() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");
const [token, setToken] = useState(localStorage.getItem("token") || "");
const [user, setUser] = useState(null);
const [isRegister, setIsRegister] = useState(false);

// Função de login
const handleLogin = async () => {
try {
const res = await api.post("/auth/login", { email, password });
if (res.data.token) {
localStorage.setItem("token", res.data.token);
setToken(res.data.token);
setUser(res.data.user);
alert("Login feito com sucesso!");
} else {
alert("Erro ao logar!");
}
} catch (err) {
console.log(err);
alert("Falha na conexão com o servidor.");
}
};

// Função de cadastro
const handleRegister = async () => {
try {
const res = await api.post("/auth/register", { name, email, password });
if (res.data.user) {
alert("Cadastro realizado com sucesso! Faça login.");
setIsRegister(false);
setName("");
setEmail("");
setPassword("");
} else {
alert("Erro ao cadastrar!");
}
} catch (err) {
console.log(err);
alert("Falha na conexão com o servidor.");
}
};

// Botão de teste de backend (ping)
const handlePing = async () => {
try {
const res = await api.get("/ping");
console.log(res.data);
alert("Ping OK: " + JSON.stringify(res.data));
} catch (err) {
console.log(err);
alert("Falha na conexão com backend");
}
};

// Tela de login ou cadastro
if (!token) {
return (
<div style={{ padding: 30, color: "white" }}>
<h1>{isRegister ? "Cadastro" : "Login"}</h1>

    {isRegister && (
      <input
        type="text"
        placeholder="Nome"
        style={{ display: "block", marginBottom: 10, width: "100%" }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    )}

    <input
      type="email"
      placeholder="Email"
      style={{ display: "block", marginBottom: 10, width: "100%" }}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Senha"
      style={{ display: "block", marginBottom: 10, width: "100%" }}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button onClick={isRegister ? handleRegister : handleLogin}>
      {isRegister ? "Cadastrar" : "Entrar"}
    </button>

    <p style={{ marginTop: 10 }}>
      {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
      <span
        style={{ color: "lightblue", cursor: "pointer" }}
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? "Login" : "Cadastre-se"}
      </span>
    </p>

    <button
      style={{ marginTop: 10, background: "orange" }}
      onClick={handlePing}
    >
      Testar Backend
    </button>
  </div>
);

}

// Tela quando está logado
return (
<div style={{ padding: 30, color: "white" }}>
<h1>Chat conectado! 🔥</h1>
<p>Bem-vindo, {user?.name || "usuário"}!</p>
<p>Token salvo no navegador!</p>
<button
onClick={() => {
localStorage.removeItem("token");
setToken("");
setUser(null);
}}
>
Sair
</button>
</div>
);
}

export default App;

