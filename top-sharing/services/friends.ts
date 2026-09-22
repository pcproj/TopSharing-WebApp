import { db } from "@/prisma/db";
import { or } from "@prisma/orm-postgres/orm-client";
import { Temporal } from "temporal-polyfill";

export async function getFriendsWithPresence(currentUserId: string) {
	// 1. Busca as amizades
	const friendshipRecords = await db.orm.public.FriendList.where((p) =>
		or(p.userId.eq(currentUserId), p.friendId.eq(currentUserId))
	).all();

	if (friendshipRecords.length === 0) {
		return [];
	}

	const friendIds = friendshipRecords.map((record) =>
		record.userId === currentUserId ? record.friendId : record.userId
	);

	// 2. Busca os perfis dos amigos
	const usersData = await db.orm.public.Users.where((u) =>
		u.id.in(friendIds)
	).all();

	const usersMap = new Map(usersData.map((u) => [u.id, u]));

	// 3. Busca o estado de presença (heartbeat) dos amigos
	const presencesData = await db.orm.public.UsersPresence.where((p) =>
		p.userId.in(friendIds)
	).all();

	const presencesMap = new Map(presencesData.map((p) => [p.userId, p.lastSeen]));

	// CORREÇÃO: Cria o limite de 2 minutos atrás usando o Temporal
	const now = Temporal.Now.plainDateTimeISO();
	const twoMinutesAgo = now.subtract({ minutes: 2 });

	// 4. Monta a lista formatada comparando com Temporal.PlainDateTime.compare
	const formattedFriends = friendshipRecords.map((record) => {
		const targetFriendId = record.userId === currentUserId ? record.friendId : record.userId;
		const friendProfile = usersMap.get(targetFriendId);

		const lastSeen = presencesMap.get(targetFriendId);

		// Temporal.PlainDateTime.compare(a, b) devolve:
		//  1 se 'a' for posterior a 'b'
		//  0 se forem iguais
		// -1 se 'a' for anterior a 'b'
		const isOnline = lastSeen
			? Temporal.PlainDateTime.compare(lastSeen, twoMinutesAgo) > 0
			: false;
		console.log(isOnline)
		return {
			id: targetFriendId,
			username: friendProfile?.name ? `${friendProfile.name}` : "@utilizador",
			avatar: "",
			status: (isOnline ? "Online" : "Offline") as "Online" | "Offline",
		};
	});

	return formattedFriends;
}
