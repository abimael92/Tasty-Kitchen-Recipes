// src/pages/api/edit-comment.ts
import type { APIRoute } from 'astro';
import { serverClient as client } from '../../lib/sanity';
import { contentModerator } from '../../utils/contentModeration';

export const PUT: APIRoute = async ({ request }) => {
	try {
		const { commentId, userId, content } = await request.json();

		if (!commentId || !userId || !content) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Missing required fields',
				}),
				{ status: 400 }
			);
		}

		// Validate content
		const validation = contentModerator.validateComment(content);
		if (!validation.isValid) {
			return new Response(
				JSON.stringify({
					success: false,
					error: validation.errors[0],
				}),
				{ status: 400 }
			);
		}

		// Verify the comment exists and user owns it - FIXED AUTHORIZATION
		const query = `*[_type == "comment" && _id == $commentId][0]{
			_id,
			publishedAt,
			author->{
				_id,
				uid  // Compare with Firebase UID
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

		// Check authorization using uid field
		if (!comment.author || comment.author.uid !== userId) {
			console.log('❌ Authorization failed:', {
				commentAuthorUid: comment.author?.uid,
				requestUserId: userId,
			});
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Not authorized to edit this comment',
				}),
				{ status: 403 }
			);
		}

		// Check if comment was edited today (within 24 hours)
		const commentDate = new Date(comment.publishedAt);
		const now = new Date();
		const hoursDiff =
			(now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);

		if (hoursDiff > 24) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Comments can only be edited within 24 hours of posting',
				}),
				{ status: 403 }
			);
		}

		// Update the comment
		const result = await client
			.patch(commentId)
			.set({
				content: content,
				editedAt: new Date().toISOString(),
				isApproved: contentModerator.shouldAutoApprove(content),
			})
			.commit();

		return new Response(
			JSON.stringify({
				success: true,
				comment: result,
				message: 'Comment updated successfully',
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error editing comment:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error',
			}),
			{ status: 500 }
		);
	}
};
