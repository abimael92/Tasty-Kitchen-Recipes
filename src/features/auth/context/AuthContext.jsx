import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLocale } from '../../../shared/utils/i18n';
import { authStore } from '../../../shared/store/authStore';

const AuthContext = createContext({
	user: null,
	loading: true,
	login: () => {},
	logout: async () => {},
});

export function AuthProvider({ children, locale }) {
	const [user, setUser] = useState(authStore.getUser());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (locale) setLocale(locale);
	}, [locale]);

	// Sync with authStore - keeps LoginWrapper (separate island) in sync
	useEffect(() => {
		const unsub = authStore.subscribe(setUser);
		return unsub;
	}, []);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const res = await fetch('/api/get-user-profile', {
					credentials: 'include',
				});

				if (!res.ok) {
					setUser(null);
					authStore.setUser(null);
					return;
				}

				const fullUser = await res.json();
				setUser(fullUser);
				authStore.setUser(fullUser);
			} catch {
				setUser(null);
				authStore.setUser(null);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	const login = (userData) => {
		setUser(userData);
		authStore.setUser(userData);
	};

	const logout = async () => {
		try {
			await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			setUser(null);
			authStore.setUser(null);
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
