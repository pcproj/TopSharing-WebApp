import WhipWhepPlayer from '@/components/WhipWhepPlayer';
import { db } from "@/prisma/db";
import { notFound, redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// A mesma chave secreta que vais usar no Go
const secretKey = new TextEncoder().encode(process.env.STREAM_TOKEN_SECRET);

export async function generateStreamToken(userId: string) {
	const jwt = await new SignJWT({ sub: userId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('30s') // Validade muito curta para máxima segurança
		.sign(secretKey);

	return jwt;
}
interface PageProps {
	params: Promise<{
		username: string;
	}>;
}
export default async function Page({ params }: PageProps) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user?.id) {
		redirect("/login");
	}
	const { username } = await params;
	const user = await db.orm.public.Users.where({ name: username }).first()
	if (!user) {
		console.log("O utilizador não existe.");
		notFound()
	}

	const streamToken = await generateStreamToken(session.user.id)

	return <WhipWhepPlayer username={username} streamToken={streamToken} />;
}
