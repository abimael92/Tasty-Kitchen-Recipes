/**
 * React hook for auth store - works across Astro islands.
 */
import { useState, useEffect } from 'react';
import { authStore } from './authStore';

export function useAuthStore() {
	const [user, setUser] = useState(authStore.getUser());

	useEffect(() => {
		setUser(authStore.getUser());
		const unsub = authStore.subscribe(setUser);
		return unsub;
	}, []);

	return {
		user,
		setUser: authStore.setUser,
	};
}
