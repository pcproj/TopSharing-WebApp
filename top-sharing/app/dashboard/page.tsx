import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import FriendList from "@/components/Friendlist";
import { getFriendsWithPresence } from "@/services/friends";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Obtém os amigos e o status iniciais no servidor
  const formattedFriends = await getFriendsWithPresence(session.user.id);

  return (
    <div className="flex flex-wrap justify-center p-2 m-2 gap-2">
      <Card className="flex min-w-70 items-center justify-center m-2 p-2 gap-2 bg-background">
        <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
          <h1 className="text-4xl font-bold mb-6">Dashboard</h1>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-black">
            <p className="text-lg mb-2">🎉 Login efetuado com sucesso!</p>
            <hr className="my-4" />
            <p><strong>ID do Utilizador:</strong> {session.user.id}</p>
            <p><strong>Nome:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
          </div>
        </div>
      </Card>
      
      <Card className="min-w-50 bg-background">
        {/* Passa como initialFriends para alimentar o state inicial do cliente */}
        <FriendList initialFriends={formattedFriends} />
      </Card>
    </div>
  );
}
