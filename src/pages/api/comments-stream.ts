// src/pages/api/comments-stream.ts
import type { APIRoute } from 'astro';

// Simple in-memory store for demo (use Redis in production)
const clients = new Map<
	string,
	{ controller: ReadableStreamDefaultController; recipeId: string }
>();

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
			clients.set(clientId, { controller, recipeId });

			// Send initial connection message
			const encoder = new TextEncoder();
			controller.enqueue(
				encoder.encode(
					`data: ${JSON.stringify({
						type: 'CONNECTED',
						message: 'Connected to comment updates',
						clientId,
					})}\n\n`
				)
			);

			// Cleanup on client disconnect
			request.signal.addEventListener('abort', () => {
				clients.delete(clientId);
			});
		},

		cancel() {
			// Cleanup when stream is cancelled
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

	clients.forEach((client, clientId) => {
		if (client.recipeId === recipeId) {
			try {
				client.controller.enqueue(encodedMessage);
				connectedClients++;
			} catch (error) {
				// Remove disconnected client
				clients.delete(clientId);
			}
		}
	});
}
