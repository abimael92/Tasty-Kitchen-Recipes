// src/pages/api/comments-stream.ts
import type { APIRoute } from 'astro';

// Simple in-memory store for demo (use Redis in production)
const clients = new Map<
	string,
	{ 
		controller: ReadableStreamDefaultController; 
		recipeId: string;
		connectedAt: number;
		timeoutId: NodeJS.Timeout;
	}
>();

// Connection timeout: 30 minutes
const CONNECTION_TIMEOUT_MS = 30 * 60 * 1000;

// Cleanup interval: every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Periodic cleanup to remove stale connections
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
	if (cleanupInterval) return;
	
	cleanupInterval = setInterval(() => {
		const now = Date.now();
		for (const [clientId, client] of clients.entries()) {
			// Remove connections older than timeout
			if (now - client.connectedAt > CONNECTION_TIMEOUT_MS) {
				cleanupClient(clientId);
			}
		}
	}, CLEANUP_INTERVAL_MS);
}

function cleanupClient(clientId: string) {
	const client = clients.get(clientId);
	if (client) {
		try {
			// Clear timeout if it exists
			if (client.timeoutId) {
				clearTimeout(client.timeoutId);
			}
			// Try to close the stream gracefully
			client.controller.close();
		} catch (error) {
			// Stream may already be closed, ignore
		}
		clients.delete(clientId);
	}
}

// Start cleanup on module load
startCleanup();

// Export the GET handler for the SSE endpoint
export const GET: APIRoute = async ({ request, url }) => {
	const recipeId = url.searchParams.get('recipeId');

	if (!recipeId) {
		return new Response('Recipe ID required', { status: 400 });
	}

	// Create a new SSE stream
	const stream = new ReadableStream({
		start(controller) {
			// Store the controller for this client
			const clientId = Math.random().toString(36).substring(2, 11);
			const connectedAt = Date.now();
			
			// Set up timeout to auto-close connection
			const timeoutId = setTimeout(() => {
				cleanupClient(clientId);
			}, CONNECTION_TIMEOUT_MS);

			clients.set(clientId, { controller, recipeId, connectedAt, timeoutId });

			// Send initial connection message
			const encoder = new TextEncoder();
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
			} catch (error) {
				// Stream may be closed, cleanup
				cleanupClient(clientId);
				return;
			}

			// Cleanup on client disconnect
			request.signal.addEventListener('abort', () => {
				cleanupClient(clientId);
			});
		},

		cancel() {
			// Cleanup when stream is cancelled - find and remove this client
			// Note: We can't identify which client this is from cancel(), 
			// but abort handler should catch most cases
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
