"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // Evita o redirecionamento automático para poderes tratar erros
    });

    if (result?.error) {
      alert("Erro no login: " + result.error);
    } else {
      router.push("/dashboard"); // Redireciona para a página protegida
      router.refresh();
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
