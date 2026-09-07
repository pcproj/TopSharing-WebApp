"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function LoginPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		if (status === "authenticated") {
			router.push("/dashboard");
		}
	}, [status, router]);

	if (status === "loading" || status == "authenticated") {
		return null; // ou um esqueleto de carregamento
	}

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const result = await signIn("credentials", {
			email,
			password,
			redirect: false, // Evita o redirecionamento automático para poderes tratar erros
		});

		if (result?.error) {
			alert("Erro no login: " + result.error);
		} else {
			router.push("/dashboard"); // Redireciona para a página protegida
			router.refresh();
		}
	};
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-3xl">Login</CardTitle>
					<CardAction>
						<Button variant="link"> Sign Up </Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<form id="form-login" onSubmit={handleSubmit}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email" className="text-lg">Email</Label>
								<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password" className="text-lg">Password</Label>
								<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
							</div>
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex-col">
					<Button type="submit" form="form-login" className="w-full text-lg">
						Login
					</Button>
				</CardFooter>
			</Card>
		</div >
	)
}
