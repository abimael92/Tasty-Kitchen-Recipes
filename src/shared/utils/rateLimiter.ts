export class RateLimiter {
	private attempts = new Map<string, { count: number; lastAttempt: number }>();
	private cleanupInterval: NodeJS.Timeout | null = null;
	private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

	constructor() {
		// Start periodic cleanup to prevent memory leaks
		this.startCleanup();
	}

	private startCleanup() {
		if (this.cleanupInterval) return;
		
		this.cleanupInterval = setInterval(() => {
			this.cleanup();
		}, this.CLEANUP_INTERVAL_MS);
	}

	private cleanup() {
		const now = Date.now();
		const maxAge = 60 * 60 * 1000; // 1 hour - remove entries older than this

		for (const [key, value] of this.attempts.entries()) {
			if (now - value.lastAttempt > maxAge) {
				this.attempts.delete(key);
			}
		}
	}

	isRateLimited(
		userId: string,
		action: string,
		maxAttempts: number,
		windowMs: number
	): boolean {
		const key = `${userId}:${action}`;
		const now = Date.now();
		const userAttempts = this.attempts.get(key);

		// Clean up expired entries on access
		if (userAttempts && now - userAttempts.lastAttempt > windowMs) {
			this.attempts.delete(key);
		}

		if (!userAttempts || now - userAttempts.lastAttempt > windowMs) {
			this.attempts.set(key, { count: 1, lastAttempt: now });
			return false;
		}

		if (userAttempts.count >= maxAttempts) {
			return true;
		}

		userAttempts.count++;
		userAttempts.lastAttempt = now;
		return false;
	}

	// Cleanup method for graceful shutdown
	destroy() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.attempts.clear();
	}
}
