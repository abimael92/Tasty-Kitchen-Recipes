export const SESSION_COOKIE_NAME = 'session';

const isProd = import.meta.env.PROD;

/**
 * Builds a secure session cookie string.
 * - HttpOnly: Prevents XSS access to cookie
 * - Secure: HTTPS only in production
 * - SameSite=Strict: CSRF protection - cookie not sent on cross-site requests
 * - Path=/: Available app-wide
 */
export const buildSessionCookie = (token: string, maxAgeSeconds = 60 * 60) => {
	const secureFlag = isProd ? '; Secure' : '';
	const sameSite = '; SameSite=Strict';
	return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}${sameSite}${secureFlag}`;
};

export const clearSessionCookie = () => {
	const secureFlag = isProd ? '; Secure' : '';
	const sameSite = '; SameSite=Strict';
	return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0${sameSite}${secureFlag}`;
};
