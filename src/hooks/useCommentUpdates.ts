// src/hooks/useCommentUpdates.ts
import { useEffect, useRef, useCallback, useState } from 'react';

interface Comment {
	_id: string;
	content: string;
	author: {
		_id: string;
		name: string;
		image?: string;
	};
	publishedAt: string;
	isApproved: boolean;
	parentCommentId?: string;
}

export function useCommentUpdates(
	recipeId: string,
	onNewComment?: (comment: Comment) => void,
	onCommentUpdate?: (comment: Comment) => void
) {
	const eventSourceRef = useRef<EventSource | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const cleanup = useCallback(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
			setIsConnected(false);
		}
	}, []);

useEffect(() => {
	if (!recipeId) return;
	cleanup();

	try {
		let retryCount = 0;
		const maxRetries = 3;

		const connect = () => {
			console.log(`Connecting to SSE for recipe: ${recipeId}`);

			try {
				const eventSource = new EventSource(
					`/api/comments-stream?recipeId=${recipeId}`
				);
				eventSourceRef.current = eventSource;

				eventSource.onopen = () => {
					console.log('SSE connection opened');
					setIsConnected(true);
					setError(null);
					retryCount = 0;
				};

				eventSource.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);
						if (data.type === 'NEW_COMMENT') {
							onNewComment?.(data.comment);
						} else if (data.type === 'COMMENT_UPDATED') {
							onCommentUpdate?.(data.comment);
						}
					} catch (error) {
						console.error('Error parsing SSE message:', error);
					}
				};

				eventSource.onerror = (error) => {
					console.error('SSE connection error:', error);
					setIsConnected(false);
					if (retryCount < maxRetries) {
						retryCount++;
						setTimeout(() => {
							if (eventSource.readyState === EventSource.CLOSED) {
								eventSource.close();
								connect();
							}
						}, 3000 * retryCount);
					} else {
						setError('Failed to connect');
					}
				};
			} catch (err) {
				console.log('SSE failed');
				return;
			}
		};

		connect();
	} catch (err) {
		console.error('Failed:', err);
	}

	return cleanup;
}, [recipeId, onNewComment, onCommentUpdate, cleanup]);

	return {
		isConnected,
		error,
		disconnect: cleanup,
	};
}
