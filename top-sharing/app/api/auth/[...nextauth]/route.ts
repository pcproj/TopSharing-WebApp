import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/prisma/db";
import * as bcrypt from "bcryptjs"; // Se usares hash para as passwords

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				// 1. Validar se os campos foram preenchidos
				if (!credentials?.username || !credentials?.password) {
					throw new Error("Preenche todos os campos");
				}
				console.log("Credentials: " + credentials.username)
				// 2. Procurar o utilizador na base de dados
				// Nota: Garante que usas 'await' se a tua BD for assíncrona
				try {
					const user = await db.orm.public.Users.where({ name: credentials.username }).first();
					console.log("User: " + user)
					
					if (!user) {
						throw new Error("Utilizador não encontrado");
					}

					const isValidPassword = await bcrypt.compare(credentials.password, user.password);
					if (!isValidPassword) {
						throw new Error("Password incorreta");
					}

					return {
						id: user.id,
						name: user.name,
						email: user.email,
					};
				} catch (error: any) {
					console.error("ERRO DETALHADO NA BD:", error);
					throw new Error(error.message || "Erro ao consultar a base de dados");
				}
			}
		})
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60 //30 dias
	},
	pages: {
		signIn: "/login", // Opcional: se quiseres usar uma página de login personalizada
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		}
	}
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
