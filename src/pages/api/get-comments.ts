// src/pages/api/get-comments.ts
import type { APIRoute } from 'astro';
import { serverSanityClient } from '../../lib/sanity.ts';

// src/pages/api/get-comments.ts (Simplified)
export const GET: APIRoute = async ({ url }) => {
	try {
		const recipeId = url.searchParams.get('recipeId');

		if (!recipeId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Recipe ID is required',
				}),
				{ status: 400 }
			);
		}

		// Only fetch 1 level deep initially
		const query = `*[_type == "comment" && recipe._ref == $recipeId && !defined(parentComment)] | order(publishedAt desc){
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
      "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(publishedAt asc){
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
        // Just check if there are nested replies, don't fetch them
        "hasNestedReplies": count(*[_type == "comment" && parentComment._ref == ^._id]) > 0,
        "nestedRepliesCount": count(*[_type == "comment" && parentComment._ref == ^._id])
      }
    }`;

		const comments = await serverSanityClient.fetch(query, { recipeId });
		return new Response(
			JSON.stringify({
				success: true,
				comments: comments || [],
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('❌ Error fetching comments:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to fetch comments',
			}),
			{ status: 500 }
		);
	}
};
