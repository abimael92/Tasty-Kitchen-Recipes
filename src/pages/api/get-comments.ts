// src/pages/api/get-comments.ts
import type { APIRoute } from 'astro';
import { client } from '../../lib/sanity.ts'; // FIX THIS IMPORT

// Remove this duplicate client creation
// const sanityClient = createClient({
//   projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
//   dataset: import.meta.env.PUBLIC_SANITY_DATASET,
//   apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2023-06-25',
//   useCdn: import.meta.env.PUBLIC_SANITY_USE_CDN === 'true',
// });

console.log(
	'Sanity client configured with project ID:',
	import.meta.env.PUBLIC_SANITY_PROJECT_ID
);

export const GET: APIRoute = async ({ url }) => {
	try {
		const recipeId = url.searchParams.get('recipeId');

		if (!recipeId) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Recipe ID is required',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		console.log('Fetching comments for recipe:', recipeId);

		// Simple query for testing
		const query = `*[_type=="comment" && recipe._ref==$recipeId && !defined(parentComment)] | order(publishedAt desc){
      _id,
      content,
      publishedAt,
      isApproved,
      author->{_id,name,lastname,email,image},
      "replies": *[_type=="comment" && parentComment._ref==^._id]{
        _id,
        content,
        publishedAt,
        isApproved,
        author->{_id,name,lastname,email,image}
      }
    }`;

		// Use the imported client, not a new one
		const comments = await client.fetch(query, { recipeId });
		console.log('Found comments:', comments?.length || 0);

		return new Response(
			JSON.stringify({
				success: true,
				comments: comments || [],
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error fetching comments:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Failed to fetch comments',
				details:
					process.env.NODE_ENV === 'development' ? error.message : undefined,
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
};
