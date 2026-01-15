import React, { createContext, useContext, useState, useEffect } from 'react';
import { setLocale } from '../utils/i18n';

const AuthContext = createContext();

export function AuthProvider({ children, locale }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (locale) setLocale(locale);
	}, [locale]);

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
					localStorage.removeItem('userData');
					setLoading(false);
					return;
				}

				const res = await fetch(`/api/getUserProfile?uid=${parsed.uid}`, {
					headers: { Authorization: `Bearer ${parsed.token}` },
				});

				if (!res.ok) {
					localStorage.removeItem('userData');
					setLoading(false);
					return;
				}

				const fullUser = await res.json();
				fullUser.token = parsed.token;
				setUser(fullUser);
			} catch {
				localStorage.removeItem('userData');
			} finally {
				setLoading(false);
			}
		}
		loadUser();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
