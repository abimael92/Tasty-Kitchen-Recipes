import React, { useState } from 'react';

export default function LoginModal({
	isOpen,
	onClose,
	onLogin,
	error,
	loading,
}) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		await onLogin(email, password);
	};

	if (!isOpen) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 9999,
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: 'white',
					padding: '2rem',
					borderRadius: '8px',
					width: '90%',
					maxWidth: '400px',
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 style={{ marginTop: 0 }}>Login</h2>

				{error && (
					<div
						style={{
							color: 'red',
							marginBottom: '1rem',
							padding: '0.5rem',
							backgroundColor: '#ffeeee',
							borderRadius: '4px',
						}}
					>
						{error}
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
				>
					<div>
						<label htmlFor='email'>Email:</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							style={{ width: '100%', padding: '0.5rem' }}
							required
							disabled={loading}
						/>
					</div>

					<div>
						<label htmlFor='password'>Password:</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							style={{ width: '100%', padding: '0.5rem' }}
							required
							minLength={6}
							disabled={loading}
						/>
					</div>

					<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
						<button
							type='button'
							onClick={onClose}
							disabled={loading}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: '#f0f0f0',
								border: '1px solid #ccc',
								borderRadius: '4px',
								cursor: 'pointer',
								flex: 1,
								opacity: loading ? 0.7 : 1,
							}}
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={loading}
							style={{
								padding: '0.5rem 1rem',
								backgroundColor: loading ? '#ccc' : 'var(--color-accent)',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: loading ? 'not-allowed' : 'pointer',
								flex: 1,
							}}
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
