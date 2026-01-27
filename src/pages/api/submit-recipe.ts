import { serverSanityClient } from '../../lib/sanity';
import { Buffer } from 'node:buffer';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { RateLimiter } from '../../utils/rateLimiter';

const rateLimiter = new RateLimiter();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

const MAX_TITLE_LEN = 200;
const MAX_INGREDIENTS_LEN = 50_000;
const MAX_INSTRUCTIONS_LEN = 50_000;
const MAX_TEXT_TOTAL_LEN = 60_000;

function sanitize(str: string): string {
	const s = String(str || '').trim();
	return s
		.replace(/<[^>]*>/g, '')
		.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

function err(message: string, status: number) {
	return new Response(JSON.stringify({ success: false, message }), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const prerender = false;

export const POST = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		if (rateLimiter.isRateLimited(auth.uid, 'submit-recipe', MAX_ATTEMPTS, WINDOW_MS)) {
			return new Response(
				JSON.stringify({ success: false, message: 'Too many requests' }),
				{ status: 429 }
			);
		}

		const formData = await request.formData();

		const rawTitle = String(formData.get('title') ?? '').trim();
		const rawIngredients = String(formData.get('ingredients') ?? '');
		const rawInstructions = String(formData.get('instructions') ?? '');

		if (!rawTitle) {
			return err('Missing title', 400);
		}
		if (rawTitle.length > MAX_TITLE_LEN) {
			return err(`Title must be at most ${MAX_TITLE_LEN} characters`, 400);
		}
		if (rawIngredients.length > MAX_INGREDIENTS_LEN) {
			return err(`Ingredients must be at most ${MAX_INGREDIENTS_LEN} characters`, 400);
		}
		if (rawInstructions.length > MAX_INSTRUCTIONS_LEN) {
			return err(`Instructions must be at most ${MAX_INSTRUCTIONS_LEN} characters`, 400);
		}
		const totalLen = rawTitle.length + rawIngredients.length + rawInstructions.length;
		if (totalLen > MAX_TEXT_TOTAL_LEN) {
			return err('Total text size exceeds limit', 413);
		}

		const title = sanitize(rawTitle);
		const ingredients = sanitize(rawIngredients);
		const instructions = sanitize(rawInstructions);

		if (!title) {
			return err('Title is required and cannot be empty after sanitization', 400);
		}

		let imageRef = null;
		let videoRef = null;

		// IMAGE (OPTIONAL)
		const imageFile = formData.get('image');
		if (imageFile && imageFile.size > 0) {
			if (imageFile.size > MAX_IMAGE_BYTES) {
				return new Response(
					JSON.stringify({ success: false, message: 'Image too large' }),
					{ status: 400 }
				);
			}
			if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
				return new Response(
					JSON.stringify({ success: false, message: 'Invalid image type' }),
					{ status: 400 }
				);
			}
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
			if (videoFile.size > MAX_VIDEO_BYTES) {
				return new Response(
					JSON.stringify({ success: false, message: 'Video too large' }),
					{ status: 400 }
				);
			}
			if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
				return new Response(
					JSON.stringify({ success: false, message: 'Invalid video type' }),
					{ status: 400 }
				);
			}
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
	} catch (e) {
		console.error('SUBMIT RECIPE ERROR:', e);
		return new Response(
			JSON.stringify({ success: false, message: 'Server error' }),
			{ status: 500 }
		);
	}
};
