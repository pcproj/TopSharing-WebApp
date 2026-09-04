import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Obtém a sessão diretamente no servidor
  const session = await getServerSession(authOptions);

  // Se o utilizador não estiver autenticado, redireciona para o login
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-black">
          <p className="text-lg mb-2">🎉 Login efetuado com sucesso!</p>
          <hr className="my-4" />
          <p><strong>ID do Utilizador:</strong> {session.user.id}</p>
          <p><strong>Nome:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
        </div>
      </div>
    </main>
  );
}
