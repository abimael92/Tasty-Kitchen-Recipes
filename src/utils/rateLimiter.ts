// src/utils/rateLimiter.ts
export class RateLimiter {
	private attempts = new Map<string, { count: number; lastAttempt: number }>();

	isRateLimited(
		userId: string,
		action: string,
		maxAttempts: number,
		windowMs: number
	): boolean {
		const key = `${userId}:${action}`;
		const now = Date.now();
		const userAttempts = this.attempts.get(key);

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
}
