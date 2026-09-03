
'use client';

import { useActionState } from 'react';
import { registerUser, type RegisterState } from '@/app/actions/register';

const initialState: RegisterState = { success: false };

export default function RegisterForm() {
	// Conecta a Server Action ao estado do formulário no cliente
	const [state, formAction, isPending] = useActionState(registerUser, initialState);

	return (
		<div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
			<h1>Criar Conta</h1>

			<form action={formAction}>
				{/* Campo Nome */}
				<div style={{ marginBottom: '15px' }}>
					<label htmlFor="name" style={{ display: 'block' }}>Nome de Utilizador</label>
					<input type="text" id="name" name="name" required style={{ width: '100%', padding: '8px' }} />
					{state?.errors?.name && (
						<p style={{ color: 'red', fontSize: '12px' }}>{state.errors.name[0]}</p>
					)}
				</div>

				{/* Campo Email */}
				<div style={{ marginBottom: '15px' }}>
					<label htmlFor="email" style={{ display: 'block' }}>Email</label>
					<input type="email" id="email" name="email" required style={{ width: '100%', padding: '8px' }} />
					{state?.errors?.email && (
						<p style={{ color: 'red', fontSize: '12px' }}>{state.errors.email[0]}</p>
					)}
				</div>

				{/* Campo Password */}
				<div style={{ marginBottom: '15px' }}>
					<label htmlFor="password" style={{ display: 'block' }}>Palavra-passe</label>
					<input type="password" id="password" name="password" required style={{ width: '100%', padding: '8px' }} />
					{state?.errors?.password && (
						<p style={{ color: 'red', fontSize: '12px' }}>{state.errors.password[0]}</p>
					)}
				</div>

				{/* Mensagens Globais de Sucesso ou Erro Crítico */}
				{state?.message && (
					<p style={{ color: state.success ? 'green' : 'red', fontWeight: 'bold' }}>
						{state.message}
					</p>
				)}

				<button type="submit" disabled={isPending} style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
					{isPending ? 'A processar...' : 'Registar Conta'}
				</button>
			</form>
		</div>
	);
}

