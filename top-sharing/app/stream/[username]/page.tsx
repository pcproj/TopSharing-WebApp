import WhipWhepPlayer from '@/components/WhipWhepPlayer';
import { db } from "@/prisma/db";
import { notFound } from 'next/navigation';

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

export default async function Page({ params }: PageProps) {
	const { username } = await params;
	const user = await db.orm.public.Users.where({ name: username }).first()
	if (!user) {
		console.log("O utilizador não existe.");
		notFound()
	}

	return <WhipWhepPlayer username={username} />;
}
