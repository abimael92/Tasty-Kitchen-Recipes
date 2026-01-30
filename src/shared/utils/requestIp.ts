/**
 * Extracts a best-effort client identifier for rate limiting.
 *
 * SECURITY: All headers below can be spoofed by clients. We use a tiered approach:
 * - Prefer x-forwarded-for (first IP = original client when behind proxies)
 * - Fall back to x-real-ip, cf-connecting-ip (Cloudflare)
 * - Last resort: 'anonymous'
 *
 * For authenticated endpoints, use the user's UID instead (much harder to spoof).
 * For login/register, we have no UID yet, so IP is the only option.
 */
export function getRateLimitKey(request: Request, authenticatedUid?: string | null): string {
	// Prefer authenticated user ID - cannot be spoofed
	if (authenticatedUid) {
		return `user:${authenticatedUid}`;
	}

	// Extract client IP from headers (in order of reliability)
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		// x-forwarded-for can be "client, proxy1, proxy2" - first is original client
		const clientIp = forwardedFor.split(',')[0]?.trim() || 'unknown';
		return `ip:${clientIp}`;
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) return `ip:${realIp.trim()}`;

	const cfConnectingIp = request.headers.get('cf-connecting-ip');
	if (cfConnectingIp) return `ip:${cfConnectingIp.trim()}`;

	return 'ip:anonymous';
}
