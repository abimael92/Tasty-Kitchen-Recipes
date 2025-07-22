import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { t } from '../utils/i18n';

export default function LoginWrapper({ locale }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		async function loadUser() {
			const userData = localStorage.getItem('userData');
			if (userData) {
				try {
					const parsed = JSON.parse(userData);
					const fullUser = await fetchUserProfile(parsed.uid, parsed.token);
					setUser(fullUser);
					setIsLoggedIn(true);
				} catch (err) {
					console.error(err);
					logout();
				}
			}
		}
		loadUser();
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
				throw new Error(
					data.error || t('auth.errors.loginFailed', locale) || 'Login failed'
				);
			}

			localStorage.setItem(
				'userData',
				JSON.stringify({
					uid: data.uid,
					email: data.email,
					token: data.token,
				})
			);

			const fullUser = await fetchUserProfile(data.uid, data.token);
			setUser(fullUser);

			setIsLoggedIn(true);
			setIsModalOpen(false);
		} catch (err) {
			console.error('Login error:', err);
			setError(
				err.message ||
					t('auth.errors.loginFailed', locale) ||
					'Login failed. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (userData) => {
		try {
			setLoading(true);
			setError('');
			const response = await fetch('/api/registerUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify(userData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error ||
						t('auth.errors.registrationFailed', locale) ||
						'Registration failed'
				);
			}

			setIsRegistering(false);
			setIsModalOpen(false);
		} catch (err) {
			console.error('Registration error:', err);
			setError(
				err.message ||
					t('auth.errors.registrationFailed', locale) ||
					'Registration failed. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem('userData');
		setUser(null);
		setIsLoggedIn(false);
		setLoading(false);
		setError('');
	};

	async function fetchUserProfile(uid, token) {
		try {
			const res = await fetch(`/api/getUserProfile?uid=${uid}`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) {
				throw new Error(
					t('auth.errors.profileFetchFailed', locale) ||
						`Failed to fetch user profile: ${res.status}`
				);
			}

			return await res.json();

			//
		} catch (err) {
			throw new Error(
				err.message ||
					t('auth.errors.networkProfileFetchFailed', locale) ||
					'Network error fetching profile'
			);
		}
	}

	if (loading) {
		return <div>{t('auth.loading', locale) || 'Loading...'}</div>;
	}

	return (
		<>
			{isLoggedIn ? (
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					<span>
						{t('auth.welcome', locale)},{' '}
						<a
							href='/profile'
							style={{
								textDecoration: 'underline',
								color: 'var(--color-primary)',
							}}
						>
							{user?.name && user?.lastname
								? `${user.name} ${user.lastname}`
								: user?.email || t('auth.user', locale)}
						</a>
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
					setIsRegistering(false);
					setError('');
				}}
				onLogin={handleLogin}
				onRegister={handleRegister}
				error={error}
				loading={loading}
				locale={locale}
				isRegistering={isRegistering}
				setIsRegistering={setIsRegistering}
			/>
		</>
	);
}
