import { getAdminAuth } from './firebaseAdmin';
import { SESSION_COOKIE_NAME } from './sessionCookie';

type AuthResult =
	| { ok: true; uid: string }
	| { ok: false; response: Response };

const getTokenFromCookies = (cookieHeader: string | null) => {
	if (!cookieHeader) return null;
	const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
	for (const cookie of cookies) {
		const [name, ...rest] = cookie.split('=');
		if (name === SESSION_COOKIE_NAME) {
			return rest.join('=');
		}
	}
	return null;
};

const getBearerToken = (authorization: string | null) => {
	if (!authorization?.startsWith('Bearer ')) return null;
	return authorization.slice('Bearer '.length);
};

export const requireAuth = async (request: Request): Promise<AuthResult> => {
	const bearerToken = getBearerToken(request.headers.get('Authorization'));
	const cookieToken = getTokenFromCookies(request.headers.get('cookie'));
	const token = bearerToken || cookieToken;

	if (!token) {
		return {
			ok: false,
			response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			}),
		};
	}

	try {
		const decoded = await getAdminAuth().verifyIdToken(token);
		return { ok: true, uid: decoded.uid };
	} catch (error) {
		return {
			ok: false,
			response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			}),
		};
	}
};
