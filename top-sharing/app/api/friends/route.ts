// app/api/friends/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getFriendsWithPresence } from "@/services/friends"; // A tua função de serviço anterior

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Reutiliza a lógica que criámos no serviço
    const friends = await getFriendsWithPresence(session.user.id);
    return NextResponse.json(friends);
  } catch (error) {
    console.error("Erro ao buscar lista de amigos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
