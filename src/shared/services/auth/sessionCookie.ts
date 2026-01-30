export const SESSION_COOKIE_NAME = 'session';

const isProd = import.meta.env.PROD;

/**
 * Gets the cookie domain for the current environment.
 * - Production: Use COOKIE_DOMAIN env (e.g. .yourdomain.com) or omit for host-only
 * - Development: Omit Domain so cookie works on localhost (host-only)
 */
function getCookieDomain(): string {
	if (!isProd) return '';
	const domain = import.meta.env.COOKIE_DOMAIN;
	return domain ? `; Domain=${domain}` : '';
}

/**
 * Builds a secure session cookie string for the login response.
 * - HttpOnly: Prevents XSS access to cookie
 * - Path=/: Available app-wide
 * - SameSite=Lax: Cookies sent on same-origin POST (login) and top-level navigations
 * - Secure: HTTPS only in production
 * - Domain: Optional, for production with custom domain
 *
 * Same-origin POST from the login form will include this cookie on subsequent requests.
 */
export const buildSessionCookie = (token: string, maxAgeSeconds = 60 * 60) => {
	const domain = getCookieDomain();
	const secureFlag = isProd ? '; Secure' : '';
	return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${domain}${secureFlag}`;
};

export const clearSessionCookie = () => {
	const domain = getCookieDomain();
	const secureFlag = isProd ? '; Secure' : '';
	return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${domain}${secureFlag}`;
};
