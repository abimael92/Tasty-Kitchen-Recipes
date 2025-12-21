import { serverSanityClient } from '../../lib/sanity';
import { Buffer } from 'node:buffer';

export const prerender = false;

export const POST = async ({ request }) => {
	try {
		const formData = await request.formData();

		const title = String(formData.get('title') || '');
		const ingredients = String(formData.get('ingredients') || '');
		const instructions = String(formData.get('instructions') || '');

		if (!title) {
			return new Response(
				JSON.stringify({ success: false, message: 'Missing title' }),
				{ status: 400 }
			);
		}

		let imageRef = null;
		let videoRef = null;

		// IMAGE (OPTIONAL)
		const imageFile = formData.get('image');
		if (imageFile && imageFile.size > 0) {
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			const asset = await serverSanityClient.assets.upload('image', buffer, {
				filename: imageFile.name,
				contentType: imageFile.type,
			});

			imageRef = {
				_type: 'image',
				asset: { _type: 'reference', _ref: asset._id },
			};
		}

		// VIDEO (OPTIONAL)
		const videoFile = formData.get('video');
		if (videoFile && videoFile.size > 0) {
			const buffer = Buffer.from(await videoFile.arrayBuffer());
			const asset = await serverSanityClient.assets.upload('file', buffer, {
				filename: videoFile.name,
				contentType: videoFile.type,
			});

			videoRef = {
				_type: 'file',
				asset: { _type: 'reference', _ref: asset._id },
			};
		}

		const doc = {
			_type: 'recipe',
			title,
			ingredients,
			instructions,
			...(imageRef && { image: imageRef }),
			...(videoRef && { video: videoRef }),
		};

	const created = await serverSanityClient.create(doc);

		return new Response(JSON.stringify({ success: true, id: created._id }), {
			status: 200,
		});
	} catch (err) {
		console.error('SUBMIT RECIPE ERROR:', err);
		return new Response(
			JSON.stringify({ success: false, message: 'Server error' }),
			{ status: 500 }
		);
	}
};
