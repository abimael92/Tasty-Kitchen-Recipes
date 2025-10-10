// src/hooks/useCommentUpdates.ts
import { useEffect, useRef, useCallback } from 'react';

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

	useEffect(() => {
		if (!recipeId) return;

		// Setup Server-Sent Events connection
		const eventSource = new EventSource(
			`/api/comments-stream?recipeId=${recipeId}`
		);
		eventSourceRef.current = eventSource;

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				switch (data.type) {
					case 'NEW_COMMENT':
						console.log('New comment received:', data.comment);
						onNewComment?.(data.comment);
						break;
					case 'COMMENT_UPDATED':
						onCommentUpdate?.(data.comment);
						break;
					case 'COMMENT_DELETED':
						// Handle comment deletion
						break;
					default:
						console.log('COMMENT_EVENT:', data.type);
				}
			} catch (error) {
				console.error('Error parsing SSE message:', error);
			}
		};

		eventSource.onerror = (error) => {
			console.error('SSE error:', error);
		};

		return () => {
			eventSource.close();
		};
	}, [recipeId, onNewComment, onCommentUpdate]);

	return {
		disconnect: () => eventSourceRef.current?.close(),
	};
}
