// src/pages/api/comments-stream.ts
import type { APIRoute } from 'astro';

// In-memory store for SSE clients (use Redis in production for scale)
const clients = new Map<
	string,
	{
		controller: ReadableStreamDefaultController;
		recipeId: string;
		connectedAt: number;
		timeoutId: ReturnType<typeof setTimeout>;
		heartbeatId: ReturnType<typeof setInterval>;
	}
>();

const CONNECTION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;    // 5 minutes
const HEARTBEAT_INTERVAL_MS = 60 * 1000;      // 1 minute

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function cleanupClient(clientId: string): void {
	const client = clients.get(clientId);
	if (!client) return;

	try {
		if (client.timeoutId) clearTimeout(client.timeoutId);
		if (client.heartbeatId) clearInterval(client.heartbeatId);
		client.controller.close();
	} catch {
		// Controller already closed, ignore
	}
	clients.delete(clientId);
}

function startCleanup(): void {
	if (cleanupInterval) return;
	cleanupInterval = setInterval(() => {
		const now = Date.now();
		for (const [clientId, client] of clients.entries()) {
			if (now - client.connectedAt > CONNECTION_TIMEOUT_MS) {
				cleanupClient(clientId);
			}
		}
	}, CLEANUP_INTERVAL_MS);
}

function sendHeartbeat(clientId: string): void {
	const client = clients.get(clientId);
	if (!client) return;
	try {
		const encoder = new TextEncoder();
		client.controller.enqueue(
			encoder.encode(`data: ${JSON.stringify({ type: 'ping', ts: Date.now() })}\n\n`)
		);
	} catch {
		cleanupClient(clientId);
	}
}

startCleanup();

export const GET: APIRoute = async ({ request, url }) => {
	const recipeId = url.searchParams.get('recipeId');
	if (!recipeId) {
		return new Response('Recipe ID required', { status: 400 });
	}

	const clientId = Math.random().toString(36).substring(2, 11);
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			const connectedAt = Date.now();
			const timeoutId = setTimeout(() => cleanupClient(clientId), CONNECTION_TIMEOUT_MS);
			const heartbeatId = setInterval(() => sendHeartbeat(clientId), HEARTBEAT_INTERVAL_MS);

			clients.set(clientId, {
				controller,
				recipeId,
				connectedAt,
				timeoutId,
				heartbeatId,
			});

			try {
				controller.enqueue(
					encoder.encode(
						`data: ${JSON.stringify({
							type: 'CONNECTED',
							message: 'Connected to comment updates',
							clientId,
						})}\n\n`
					)
				);
			} catch {
				cleanupClient(clientId);
				return;
			}

			request.signal.addEventListener('abort', () => cleanupClient(clientId));
		},

		cancel() {
			cleanupClient(clientId);
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Cache-Control',
		},
	});
};

// Export the broadcast function separately
export function broadcastToRecipeClients(recipeId: string, data: any) {
	const message = `data: ${JSON.stringify(data)}\n\n`;
	const encoder = new TextEncoder();
	const encodedMessage = encoder.encode(message);

	let connectedClients = 0;
	const deadClients: string[] = [];

	clients.forEach((client, clientId) => {
		if (client.recipeId === recipeId) {
			try {
				client.controller.enqueue(encodedMessage);
				connectedClients++;
			} catch (error) {
				// Mark for removal
				deadClients.push(clientId);
			}
		}
	});

	// Clean up dead clients
	deadClients.forEach(clientId => cleanupClient(clientId));
}
