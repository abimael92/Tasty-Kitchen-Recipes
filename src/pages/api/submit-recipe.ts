import { client } from '../../lib/sanity';

export const prerender = false;

export const POST = async ({ request }) => {
	try {
		const formData = await request.formData();

		const title = formData.get('title')?.toString() || '';
		const ingredients = formData.get('ingredients')?.toString() || '';
		const instructions = formData.get('instructions')?.toString() || '';

		if (!title) {
			return new Response(
				JSON.stringify({ success: false, message: 'Missing title' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Upload image if present
		let imageRef = undefined;
		const imageFile = formData.get('image');
		if (imageFile && imageFile instanceof File) {
			const arrayBuffer = await imageFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const filename = imageFile.name || 'upload.jpg'; // fallback filename
			const imageAsset = await client.assets.upload('image', buffer, {
				filename,
				contentType: imageFile.type || 'image/jpeg',
			});
			imageRef = {
				_type: 'image',
				asset: { _type: 'reference', _ref: imageAsset._id },
			};
		}
		// Upload video if present
		let videoRef = undefined;
		const videoFile = formData.get('video');
		if (videoFile && videoFile instanceof File) {
			const arrayBuffer = await videoFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const filename = videoFile.name || 'upload.mp4'; // fallback filename
			const videoAsset = await client.assets.upload('file', buffer, {
				filename,
				contentType: videoFile.type || 'video/mp4',
			});
			videoRef = {
				_type: 'file',
				asset: { _type: 'reference', _ref: videoAsset._id },
			};
		}

		const doc = {
			_type: 'recipe',
			title,
			ingredients,
			instructions,
			image: imageRef,
			video: videoRef,
		};

		const created = await client.create(doc);

		return new Response(JSON.stringify({ success: true, id: created._id }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error(err);
		return new Response(
			JSON.stringify({ success: false, message: 'Server error' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
};
