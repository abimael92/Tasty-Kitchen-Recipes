export const SESSION_COOKIE_NAME = 'session';

const isProd = import.meta.env.PROD;

export const buildSessionCookie = (token: string, maxAgeSeconds = 60 * 60) => {
	const secureFlag = isProd ? '; Secure' : '';
	return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`;
};

export const clearSessionCookie = () => {
	const secureFlag = isProd ? '; Secure' : '';
	return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
};
