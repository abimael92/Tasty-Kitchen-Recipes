// src/pages/api/submit-comment.ts
import type { APIRoute } from 'astro';
import { contentModerator } from '../../utils/contentModeration';

import { serverClient as client } from '../../lib/sanity';

import { broadcastToRecipeClients } from './comments-stream';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { content, recipeId, parentCommentId, userId } = await request.json();

		console.log('Received comment submission:', { content, recipeId, userId });

		// Basic validation
		if (!content || !recipeId || !userId) {
			return new Response(
				JSON.stringify({
					success: false,
					error:
						'Missing required fields: content, recipeId, and userId are required',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
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
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Check profanity for auto-moderation
		const profanityCheck = contentModerator.checkForProfanity(content);

		const requiresModeration = !contentModerator.shouldAutoApprove(content);

		// Submit to Sanity
		const commentData = {
			_type: 'comment',
			author: { _type: 'reference', _ref: userId },
			recipe: { _type: 'reference', _ref: recipeId },
			content: content,
			isApproved: !requiresModeration,
			containsProfanity: profanityCheck.hasProfanity,
			publishedAt: new Date().toISOString(),
			...(parentCommentId && {
				parentComment: { _type: 'reference', _ref: parentCommentId },
			}),
		};

		console.log('Creating comment in Sanity:', commentData);
		const result = await client.create(commentData);
		console.log('Comment created successfully:', result._id);

		// Broadcast real-time update for approved comments
		if (!requiresModeration) {
			console.log('Broadcasting comment to clients...');
			broadcastToRecipeClients(recipeId, {
				type: 'NEW_COMMENT',
				comment: {
					_id: result._id,
					content: content,
					author: { _id: userId },
					publishedAt: new Date().toISOString(),
					isApproved: true,
					parentCommentId: parentCommentId || null,
				},
				recipeId: recipeId,
			});
		}

		return new Response(
			JSON.stringify({
				success: true,
				commentId: result._id,
				requiresModeration: requiresModeration,
				message: requiresModeration
					? 'Comment submitted and awaiting moderation'
					: 'Comment posted successfully',
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error submitting comment:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error',
				...(process.env.NODE_ENV === 'development' && {
					details: error.message,
				}),
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
};
