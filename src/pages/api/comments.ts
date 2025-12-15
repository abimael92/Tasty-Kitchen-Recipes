// src/pages/api/comments.ts
import type { APIRoute } from 'astro';

// Mock data for now - replace with your database logic
let mockComments = [
	{
		_id: '1',
		recipeId: 'enchiladas-suizas',
		content: "This recipe looks delicious! Can't wait to try it.",
		author: {
			_id: 'user1',
			name: 'John Doe',
			image: '/avatar1.jpg',
		},
		publishedAt: '2024-01-15T10:30:00Z',
		isApproved: true,
	},
	{
		_id: '2',
		recipeId: 'enchiladas-suizas',
		content: 'I made this last night and it was amazing!',
		author: {
			_id: 'user2',
			name: 'Jane Smith',
			image: '/avatar2.jpg',
		},
		publishedAt: '2024-01-16T14:45:00Z',
		isApproved: true,
	},
];

export const GET: APIRoute = async ({ url }) => {
	const recipeId = url.searchParams.get('recipeId');

	if (!recipeId) {
		return new Response(JSON.stringify({ error: 'Recipe ID is required' }), {
			status: 400,
		});
	}

	const filteredComments = mockComments.filter(
		(comment) => comment.recipeId === recipeId && comment.isApproved
	);

	return new Response(JSON.stringify(filteredComments), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { recipeId, content, authorId, parentCommentId } = body;

		if (!recipeId || !content || !authorId) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields' }),
				{ status: 400 }
			);
		}

		// In a real app, you would:
		// 1. Validate the user
		// 2. Save to your database
		// 3. Return the saved comment

		const newComment = {
			_id: Math.random().toString(36).substring(2, 9),
			recipeId,
			content,
			author: {
				_id: authorId,
				name: 'Current User', // Fetch from user service
				image: '/avatar-default.jpg',
			},
			publishedAt: new Date().toISOString(),
			isApproved: true,
			parentCommentId: parentCommentId || null,
		};

		mockComments.unshift(newComment);

		return new Response(JSON.stringify(newComment), {
			status: 201,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error creating comment:', error);
		return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
			status: 500,
		});
	}
};
