// src/pages/api/delete-comment.ts
import type { APIRoute } from 'astro';
import { serverSanityClient as client } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';

export const DELETE: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { commentId } = await request.json();

		if (!commentId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Missing comment ID or user ID',
				}),
				{ status: 400 }
			);
		}

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
		if (!comment.author || comment.author.uid !== auth.uid) {
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
