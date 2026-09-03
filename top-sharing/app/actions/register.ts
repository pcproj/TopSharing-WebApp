'use server';

import { db } from '@/prisma/db'; // Ajuste o caminho para o seu cliente Prisma 8
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Temporal } from 'temporal-polyfill';
import 'temporal-polyfill/global';

// Esquema de validação idêntico à estrutura do Goose
const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
});

export type RegisterState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
};

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Extrair e validar dados do formulário
  const rawFields = Object.fromEntries(formData);
  const validatedFields = registerSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Verificar duplicados (a coluna 'name' é UNIQUE no seu banco)
    const existingUser = await db.orm.public.Users
      .where({ name })
      .first() ?? await db.orm.public.Users.where({ email }).first();

    if (existingUser) {
      return {
        success: false,
        message: "O email ou o nome de utilizador já estão em uso.",
      };
    }

    // Encriptar a password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir os dados (o ID usa uuid clássico)
    const insertPlan = db.sql.public.users
      .insert([{
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        created_at: Temporal.PlainDateTime.from(new Date().toISOString().slice(0, 19)),
        updated_at: Temporal.PlainDateTime.from(new Date().toISOString().slice(0, 19)),
        stream_token: generateSecureStreamKey()
      }])
      .build();
    await db.runtime().execute(insertPlan);

    return { success: true, message: "Utilizador registado com sucesso!" };

  } catch (error) {
    console.error("Erro na Server Action:", error);
    return {
      success: false,
      message: "Ocorreu um erro interno no servidor ao tentar registar.",
    };
  }
}


function generateSecureStreamKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(24));
  const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `live_${hex}`;
}
