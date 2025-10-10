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

		console.log('🔍 Deleting comment:', { commentId, userId });

		// Fetch the comment with author's uid field
		const query = `*[_type == "comment" && _id == $commentId][0]{
			_id,
			author->{
				_id,
				uid  // This is the Firebase user ID
			}
		}`;

		const comment = await client.fetch(query, { commentId });

		if (!comment) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Comment not found',
				}),
				{ status: 404 }
			);
		}

		// Check if user is authorized to delete - compare with uid field
		if (!comment.author || comment.author.uid !== userId) {
			console.log('❌ Authorization failed:', {
				commentAuthorUid: comment.author?.uid,
				requestUserId: userId,
			});
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
		console.log('✅ Comment deleted successfully');

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Comment deleted successfully',
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('❌ Error deleting comment:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error',
			}),
			{ status: 500 }
		);
	}
};
