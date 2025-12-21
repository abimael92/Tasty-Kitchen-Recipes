// src/pages/api/submit-comment.ts
import type { APIRoute } from 'astro';
import { contentModerator } from '../../utils/contentModeration';
import { serverSanityClient as client } from '../../lib/sanity';
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

		// VERIFY USER EXISTS IN SANITY
		const userQuery = `*[_type == "user" && uid == $userId][0]{
			_id,
			name,
			lastname,
			email,
			image
		}`;

		const sanityUser = await client.fetch(userQuery, { userId });

		if (!sanityUser) {
			console.error('User not found in Sanity:', userId);
			return new Response(
				JSON.stringify({
					success: false,
					error: 'User not found in system',
				}),
				{ status: 404 }
			);
		}

		console.log('Found user in Sanity:', sanityUser._id);

		// Check profanity for auto-moderation
		const profanityCheck = contentModerator.checkForProfanity(content);
		const requiresModeration = !contentModerator.shouldAutoApprove(content);

		// Submit to Sanity - use Sanity user ID, not Firebase UID
		const commentData = {
			_type: 'comment',
			author: { _type: 'reference', _ref: sanityUser._id }, // Use Sanity user ID
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

		// Prepare comment for real-time broadcast
		const broadcastComment = {
			_id: result._id,
			content: content,
			author: {
				_id: sanityUser._id,
				name: sanityUser.name,
				lastname: sanityUser.lastname,
				email: sanityUser.email,
				image: sanityUser.image,
			},
			publishedAt: new Date().toISOString(),
			isApproved: !requiresModeration,
			parentCommentId: parentCommentId || null,
		};

		// Broadcast real-time update for approved comments
		if (!requiresModeration) {
			console.log('Broadcasting comment to clients...');
			broadcastToRecipeClients(recipeId, {
				type: 'NEW_COMMENT',
				comment: broadcastComment,
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
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error submitting comment:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error',
			}),
			{ status: 500 }
		);
	}
};
