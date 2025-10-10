// src/pages/api/delete-comment.ts
import type { APIRoute } from 'astro';
import { serverClient as client } from '../../lib/sanity';

export const DELETE: APIRoute = async ({ request }) => {
	try {
		const { commentId, userId } = await request.json();

		if (!commentId || !userId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Missing comment ID or user ID',
				}),
				{ status: 400 }
			);
		}

		// Verify the comment exists and user owns it
		const comment = await client.getDocument(commentId);

		if (!comment) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Comment not found',
				}),
				{ status: 404 }
			);
		}

		// Fix: Check author reference correctly
		if (comment.author._ref !== userId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Not authorized to delete this comment',
				}),
				{ status: 403 }
			);
		}

		// Delete the comment
		await client.delete(commentId);

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Comment deleted successfully',
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting comment:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error',
			}),
			{ status: 500 }
		);
	}
};
