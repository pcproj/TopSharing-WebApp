import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Ajuste o caminho do seu authOptions
import { db } from "@/prisma/db";
import { Temporal } from "temporal-polyfill";

const nowTemporal = Temporal.Now.plainDateTimeISO();

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Atualiza ou insere o last_seen_at usando o Prisma (UPSERT)
    await db.orm.public.UsersPresence.upsert({
      update: { lastSeen: nowTemporal },
      create: {
        userId: session.user.id,
        lastSeen: nowTemporal,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar presença:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
