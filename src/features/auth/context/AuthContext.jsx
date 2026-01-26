import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLocale } from '../../../shared/utils/i18n';

const AuthContext = createContext({
	user: null,
	loading: true,
	login: () => {},
	logout: async () => {},
});

export function AuthProvider({ children, locale }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (locale) setLocale(locale);
	}, [locale]);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const res = await fetch('/api/get-user-profile', {
					credentials: 'same-origin',
				});

				if (!res.ok) {
					setUser(null);
					return;
				}

				const fullUser = await res.json();
				setUser(fullUser);
			} catch {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	const login = (userData) => {
		setUser(userData);
	};

	const logout = async () => {
		try {
			await fetch('/api/logout', {
				method: 'POST',
				credentials: 'same-origin',
			});
		} finally {
			setUser(null);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		// Fallback if context is undefined (shouldn't happen, but safety check)
		return {
			user: null,
			loading: true,
			login: () => {},
			logout: async () => {},
		};
	}
	return context;
}
