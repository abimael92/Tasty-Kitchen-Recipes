// src/pages/api/get-nested-replies.ts
import type { APIRoute } from 'astro';
import { publicSanityClient } from '../../lib/sanity.ts';

export const GET: APIRoute = async ({ url }) => {
	try {
		const parentCommentId = url.searchParams.get('parentCommentId');

		if (!parentCommentId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Parent comment ID is required',
				}),
				{ status: 400 }
			);
		}

		// Fetch nested replies for a specific comment
		const query = `*[_type == "comment" && parentComment._ref == $parentCommentId] | order(publishedAt asc){
      _id,
      content,
      publishedAt,
      isApproved,
      editedAt,
      author->{
        _id,
        name,
        lastname,
        email,
        image
      },
      // Also check if these replies have nested replies
      "hasNestedReplies": count(*[_type == "comment" && parentComment._ref == ^._id]) > 0
    }`;

		const nestedReplies = await publicSanityClient.fetch(query, {
			parentCommentId,
		});
		return new Response(
			JSON.stringify({
				success: true,
				replies: nestedReplies || [],
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('❌ Error fetching nested replies:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to fetch nested replies',
			}),
			{ status: 500 }
		);
	}
};
