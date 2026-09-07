import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import FriendList from "@/components/Friendlist";
import { db } from "@/prisma/db";
import { or } from "@prisma/orm-postgres/orm-client"

export default async function DashboardPage() {
  // Obtém a sessão diretamente no servidor
  const session = await getServerSession(authOptions);

  // Se o utilizador não estiver autenticado, redireciona para o login
  if (!session) {
    redirect("/login");
  }
  const currentUserId = session.user.id;
 
  const friendshipRecords = await db.orm.public.FriendList.where((p) =>
    or(p.userId.eq(currentUserId), p.friendId.eq(currentUserId))
  ).all();

  const friendIds = friendshipRecords.map((record) =>
    record.userId === currentUserId ? record.friendId : record.userId
  );

  const usersData = await db.orm.public.Users.where((u) =>
    u.id.in(friendIds)
  ).all();

  const usersMap = new Map(usersData.map((u) => [u.id, u]));

  const formattedFriends = friendshipRecords.map((record) => {
    const targetFriendId = record.userId === currentUserId ? record.friendId : record.userId;

    const friendProfile = usersMap.get(targetFriendId);

    return {
      username: friendProfile?.name ? `@${friendProfile.name}` : "@utilizador",
      avatar: "", // Ajuste para o nome da coluna da foto na sua DB
      status: "Online",
    };
  });

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
        <FriendList friends={formattedFriends} />
      </Card>
    </div>
  );
}
