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
