import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { t } from '../utils/i18n';

export default function LoginWrapper({ locale }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const userData = localStorage.getItem('userData');
		if (userData) {
			try {
				const parsedData = JSON.parse(userData);
				setUser(parsedData);
				setIsLoggedIn(true);
			} catch (err) {
				console.error('Failed to parse user data:', err);
				logout();
			}
		}
	}, []);

	const handleLogin = async (email, password) => {
		setLoading(true);
		setError('');
		try {
			const response = await fetch('/api/authUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Login failed');
			}

			localStorage.setItem(
				'userData',
				JSON.stringify({
					uid: data.uid,
					email: data.email,
					token: data.token,
				})
			);
			setUser({ uid: data.uid, email: data.email });
			setIsLoggedIn(true);
			setIsModalOpen(false);
		} catch (err) {
			console.error('Login error:', err);
			setError(err.message || 'Login failed. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem('userData');
		setUser(null);
		setIsLoggedIn(false);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<>
			{isLoggedIn ? (
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					<span>
						{t('auth.welcome', locale)}, {user?.email || t('auth.user', locale)}
					</span>
					<button
						onClick={logout}
						style={{
							background: 'none',
							border: 'none',
							color: 'inherit',
							cursor: 'pointer',
							font: 'inherit',
							padding: 0,
							textDecoration: 'underline',
						}}
					>
						({t('auth.logout', locale)})
					</button>
				</div>
			) : (
				<button
					onClick={() => setIsModalOpen(true)}
					style={{
						background: 'none',
						border: 'none',
						color: 'inherit',
						cursor: 'pointer',
						font: 'inherit',
						padding: 0,
						transition: 'color 0.2s ease',
					}}
				>
					{t('auth.login', locale)} ▼
				</button>
			)}

			<LoginModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setError('');
				}}
				onLogin={handleLogin}
				error={error}
				loading={loading}
			/>
		</>
	);
}
