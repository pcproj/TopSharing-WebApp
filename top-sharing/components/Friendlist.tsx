"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export interface Friend {
	id: string;
	username: string;
	avatar: string;
	status: "Online" | "Offline" | "Ausente";
}

interface FriendListProps {
	initialFriends: Friend[];
}

export default function FriendList({ initialFriends }: FriendListProps) {
	const [friends, setFriends] = useState<Friend[]>(initialFriends);

	useEffect(() => {
		const fetchFriendsStatus = async () => {
			try {
				const response = await fetch("/api/friends");
				if (response.ok) {
					const data = await response.json();
					setFriends(data);
				}
			} catch (error) {
				console.error("Erro ao atualizar o status dos amigos:", error);
			}
		};

		// Polling a cada 30 segundos
		const interval = setInterval(fetchFriendsStatus, 30000);

		// Limpa o intervalo ao desmontar o componente
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="w-full max-w-md mx-auto p-4 bg-background border rounded-xl shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold tracking-tight">Amigos ({friends.length})</h2>
				<Button variant="link" className="text-xs px-0">Ver todos</Button>
			</div>

			<div className="space-y-4">
				{friends.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-4">Ainda não tens amigos adicionados.</p>
				) : (
					friends.map((friend) => (
						<div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
							<div className="flex items-center gap-3">
								<div className="relative">
									<Avatar className="h-10 w-10 border">
										<AvatarImage src={friend.avatar} alt={friend.username} />
										<AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${friend.status === "Online"
											? "bg-green-500"
											: friend.status === "Ausente"
												? "bg-amber-500"
												: "bg-muted-foreground"
										}`} />
								</div>

								<div className="flex flex-col">
									<span className="text-sm font-medium leading-none">{friend.username}</span>
									<span className="text-xs text-muted-foreground mt-1">{friend.status}</span>
								</div>
							</div>

							<div className="flex items-center gap-1">
								<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
									<span className="sr-only">Enviar Mensagem</span>
								</Button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
