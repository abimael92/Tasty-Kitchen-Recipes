import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadUser() {
			const stored = localStorage.getItem('userData');
			if (!stored) {
				setLoading(false);
				return;
			}

			try {
				const parsed = JSON.parse(stored);
				if (!parsed.uid || !parsed.token) {
					console.warn('Stored user data incomplete, clearing');
					localStorage.removeItem('userData');
					setLoading(false);
					return;
				}

				const res = await fetch(`/api/getUserProfile?uid=${parsed.uid}`, {
					headers: { Authorization: `Bearer ${parsed.token}` },
				});

				if (!res.ok) {
					console.error('Failed to fetch user profile:', res.status);
					localStorage.removeItem('userData');
					setLoading(false);
					return;
				}

				const fullUser = await res.json();
				fullUser.token = parsed.token;

				setUser(fullUser);
			} catch (err) {
				console.error('Error loading user profile:', err);
				localStorage.removeItem('userData');
			} finally {
				setLoading(false);
			}
		}
		loadUser();
	}, []);

	const login = (data) => {
		if (!data?.uid || !data?.token) {
			console.error('Login data missing uid or token', data);
			return;
		}
		localStorage.setItem(
			'userData',
			JSON.stringify({
				uid: data.uid,
				email: data.email,
				token: data.token,
			})
		);
		setUser(data);
		setLoading(false);
	};

	const logout = () => {
		localStorage.removeItem('userData');
		setUser(null);
		setLoading(false);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
}
