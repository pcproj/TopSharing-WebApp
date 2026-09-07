"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
/*
// Dados fictícios vindos da sua base de dados (SQL)
const friends = [
	{ id: 1, name: "Lucas Silva", username: "@lucas", avatar: "https://github.com", status: "Online" },
	{ id: 2, name: "Beatriz Costa", username: "@biacosta", avatar: "", status: "Offline" },
	{ id: 3, name: "Pedro Santos", username: "@pedros", avatar: "https://unsplash.com", status: "Ausente" },
]*/
export interface Friend {
	username: string;
	avatar: string;
	status: string;
}
interface FriendListProps {
	friends: Friend[];
}

export default function FriendList({ friends }: FriendListProps) {
	return (
		<div className="w-full max-w-md mx-auto p-4 bg-background border rounded-xl shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold tracking-tight">Amigos ({friends.length})</h2>
				<Button variant="link" className="text-xs px-0">Ver todos</Button>
			</div>

			{/* Contentor da Lista */}
			<div className="space-y-4">
				{friends.map((friend) => (
					<div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
						{/* Esquerda: Avatar e Informações */}
						<div className="flex items-center gap-3">
							<div className="relative">
								<Avatar className="h-10 w-10 border">
									<AvatarImage src={friend.avatar} alt={friend.username} />
									<AvatarFallback>{friend.username.charAt(0)}</AvatarFallback>
								</Avatar>
								{/* Indicador de Status Visual */}
								<span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${friend.status === "Online" ? "bg-green-500" : friend.status === "Ausente" ? "bg-amber-500" : "bg-muted-foreground"
									}`} />
							</div>

							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground mt-1">{friend.username}</span>
							</div>
						</div>

						{/* Direita: Ações Rápidas */}
						<div className="flex items-center gap-1">
							<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
								<span className="sr-only">Enviar Mensagem</span>
							</Button>
							<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
								<span className="sr-only">Opções</span>
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
