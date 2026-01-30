/**
 * Standardized API error handling - prevents information disclosure.
 *
 * - Logs full error details server-side
 * - Returns generic messages to clients
 * - Maps known error types to appropriate status codes
 */

const SAFE_MESSAGES: Record<string, string> = {
	// Auth
	'auth/invalid-credential': 'Invalid email or password',
	'auth/user-not-found': 'Invalid email or password',
	'auth/wrong-password': 'Invalid email or password',
	'auth/invalid-email': 'Invalid email format',
	'auth/email-already-in-use': 'Email already in use',
	'auth/weak-password': 'Password is too weak',
	'auth/too-many-requests': 'Too many attempts. Try again later',
	'auth/network-request-failed': 'Network error. Please try again',

	// Generic
	Unauthorized: 'Unauthorized',
	'Not authorized': 'Not authorized',
	'User not found': 'User not found',
};

/**
 * Returns a safe, client-facing error message.
 * Logs the original error server-side.
 */
export function toSafeErrorResponse(
	error: unknown,
	options: {
		status?: number;
		context?: string;
		defaultMessage?: string;
		log?: boolean;
	} = {}
): Response {
	const { status = 500, context = 'API', defaultMessage = 'An error occurred', log = true } = options;

	const err = error instanceof Error ? error : new Error(String(error));
	const message = err.message;
	const code = (err as { code?: string }).code ?? '';

	// Log server-side (never send to client)
	if (log) {
		console.error(`[${context}]`, err.name, code || message, err.stack);
	}

	// Find safe message (check both code and message - Firebase uses .code)
	const searchText = `${code} ${message}`;
	let safeMessage = defaultMessage;
	for (const [key, value] of Object.entries(SAFE_MESSAGES)) {
		if (searchText.includes(key)) {
			safeMessage = value;
			break;
		}
	}

	return new Response(
		JSON.stringify({ error: safeMessage }),
		{
			status,
			headers: { 'Content-Type': 'application/json' },
		}
	);
}
