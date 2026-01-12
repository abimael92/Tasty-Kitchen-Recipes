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

	useEffect(() => {
		const open = () => setIsModalOpen(true);
		window.addEventListener('open-login', open);
		return () => window.removeEventListener('open-login', open);
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
				throw new Error(data.error || t('auth.errors.loginFailed', locale));
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
			setError(err.message || t('auth.errors.loginFailed', locale));
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
					data.error || t('auth.errors.registrationFailed', locale)
				);
			setIsRegistering(false);
			setIsModalOpen(false);
		} catch (err) {
			console.error('Registration error:', err);
			setError(err.message || t('auth.errors.registrationFailed', locale));
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
			if (!res.ok) throw new Error(t('auth.errors.profileFetchFailed', locale));
			return await res.json();
		} catch (err) {
			throw new Error(
				err.message || t('auth.errors.networkProfileFetchFailed', locale)
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
		return <div className='loading-text'>{t('auth.loading', locale)}</div>;
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
						aria-label={t('auth.user', locale)}
					>
						{user?.name && user?.lastname
							? `${user.name} ${user.lastname}`
							: user?.email || t('auth.user', locale)}{' '}
						{isDropdownOpen ? '▲' : '▼'}
					</button>

					{isDropdownOpen && (
						<div className='dropdown-menu'>
							<a href='/profile' className='menu-link'>
								{t('nav.profile', locale)}
							</a>
							<a href='/favorites' className='menu-link'>
								{t('nav.favorites', locale)}
							</a>
							<a href='/grocery-list' className='menu-link'>
								{t('nav.groceryList', locale)}
							</a>
							<hr />
							<button onClick={logout} className='logout-button'>
								{t('auth.logout', locale)}
							</button>
						</div>
					)}
				</div>
			) : (
				<button
					onClick={() => setIsModalOpen(true)}
					className='dropdown-button login-btn'
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
        .dropdown-button, .login-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font: inherit;
          padding: 8px 12px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        
        .login-btn {
          text-decoration: underline;
        }

        .dropdown-button:hover, .login-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ccc;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 8px 0;
          z-index: 1000;
          min-width: 180px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-link {
          text-decoration: none;
          color: var(--color-primary, #333);
          padding: 8px 16px;
          transition: background-color 0.2s ease;
        }

        .menu-link:hover {
          background-color: #f5f5f5;
          color: var(--color-primary-dark, #000);
        }

        hr {
          margin: 8px 0;
          border: none;
          border-top: 1px solid #e0e0e0;
        }

        .logout-button {
          background: none;
          border: none;
          color: #d32f2f;
          cursor: pointer;
          padding: 8px 16px;
          text-align: left;
          font: inherit;
          transition: background-color 0.2s ease;
        }

        .logout-button:hover {
          background-color: #ffebee;
        }
        
        .loading-text {
          padding: 8px 12px;
          color: #666;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .dropdown-menu {
            position: fixed;
            top: auto;
            right: 16px;
            left: 16px;
            bottom: 16px;
            min-width: auto;
          }
        }
      `}</style>
		</>
	);
}
