/**
 * Shared auth store for cross-island state in Astro.
 * React Context doesn't work across islands - this module singleton does.
 */

type User = Record<string, unknown> | null;

type Listener = (user: User) => void;

let user: User = null;
const listeners = new Set<Listener>();

export const authStore = {
	getUser: () => user,
	setUser: (u: User) => {
		user = u;
		listeners.forEach((fn) => fn(user));
	},
	subscribe: (fn: Listener) => {
		listeners.add(fn);
		return () => listeners.delete(fn);
	},
};
