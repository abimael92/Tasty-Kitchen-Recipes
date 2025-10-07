import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { t } from '../utils/i18n';

export default function LoginWrapper({ locale }) {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
			if (!response.ok)
				throw new Error(
					data.error || t('auth.errors.loginFailed', locale) || 'Login failed'
				);
			localStorage.setItem(
				'userData',
				JSON.stringify({ uid: data.uid, email: data.email, token: data.token })
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
		setLoading(true);
		setError('');
		try {
			const response = await fetch('/api/registerUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify(userData),
			});
			const data = await response.json();
			if (!response.ok)
				throw new Error(
					data.error ||
						t('auth.errors.registrationFailed', locale) ||
						'Registration failed'
				);
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
		setIsDropdownOpen(false);
	};

	async function fetchUserProfile(uid, token) {
		try {
			const res = await fetch(`/api/getUserProfile?uid=${uid}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok)
				throw new Error(
					t('auth.errors.profileFetchFailed', locale) ||
						`Failed to fetch user profile: ${res.status}`
				);
			return await res.json();
		} catch (err) {
			throw new Error(
				err.message ||
					t('auth.errors.networkProfileFetchFailed', locale) ||
					'Network error fetching profile'
			);
		}
	}

	// Close dropdown on outside click
	React.useEffect(() => {
		function handleClickOutside(event) {
			if (!event.target.closest('#userDropdown')) {
				setIsDropdownOpen(false);
			}
		}
		if (isDropdownOpen) {
			document.addEventListener('click', handleClickOutside);
		}
		return () => document.removeEventListener('click', handleClickOutside);
	}, [isDropdownOpen]);

	if (loading) {
		return <div>{t('auth.loading', locale) || 'Loading...'}</div>;
	}

	return (
		<>
			{isLoggedIn ? (
				<div
					id='userDropdown'
					style={{ position: 'relative', display: 'inline-block' }}
				>
					<button
						onClick={() => setIsDropdownOpen((prev) => !prev)}
						className='dropdown-button'
						aria-haspopup='true'
						aria-expanded={isDropdownOpen}
					>
						{user?.name && user?.lastname
							? `${user.name} ${user.lastname}`
							: user?.email || t('auth.user', locale)}{' '}
						{isDropdownOpen ? '▲' : '▼'}
					</button>

					{isDropdownOpen && (
						<div className='dropdown-menu'>
							<a href='/profile' className='menu-link'>
								{t('home.nav.profile', locale) || 'Profile'}
							</a>
							<a href='/favorites' className='menu-link'>
								{t('home.nav.favorites', locale) || 'Favorites'}
							</a>
							<a href='/grocery-list' className='menu-link'>
								{t('home.nav.groceryList', locale) || 'My Grocery List'}
							</a>
							<hr />
							<button onClick={logout} className='logout-button'>
								{t('auth.logout', locale) || 'Logout'}
							</button>
						</div>
					)}
				</div>
			) : (
				<button
					onClick={() => setIsModalOpen(true)}
					className='dropdown-button'
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

			<style>{`
        .dropdown-button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-decoration: underline;
          padding: 0;
          transition: color 0.2s ease;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ccc;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          padding: 0.5rem;
          z-index: 1000;
          min-width: 160px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .menu-link {
          text-decoration: none;
          color: var(--color-primary);
          padding: 0.25rem 0.5rem;
        }

        .menu-link:hover {
          background-color: #eee;
        }

        hr {
          margin: 0.5rem 0;
          border-color: #eee;
        }

        .logout-button {
          background: none;
          border: none;
          color: red;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          text-align: left;
          font: inherit;
        }

        .logout-button:hover {
          background-color: #fee;
        }
      `}</style>
		</>
	);
}

