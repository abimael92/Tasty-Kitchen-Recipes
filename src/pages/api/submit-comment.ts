// src/pages/api/submit-comment.ts
import type { APIRoute } from 'astro';
import { contentModerator } from '../../utils/contentModeration';
import { serverSanityClient as client } from '../../lib/sanity';
import { broadcastToRecipeClients } from './comments-stream';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';
import { RateLimiter } from '../../utils/rateLimiter';

const rateLimiter = new RateLimiter();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { content, recipeId, parentCommentId } = await request.json();

		// Basic validation
		if (!content || !recipeId) {
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

		if (rateLimiter.isRateLimited(auth.uid, 'submit-comment', MAX_ATTEMPTS, WINDOW_MS)) {
			return new Response(
				JSON.stringify({ success: false, error: 'Too many requests' }),
				{ status: 429 }
			);
		}

		const sanityUser = await requireSanityUserByUid(auth.uid);

		if (!sanityUser) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'User not found in system',
				}),
				{ status: 404 }
			);
		}

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

		const result = await client.create(commentData);

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
