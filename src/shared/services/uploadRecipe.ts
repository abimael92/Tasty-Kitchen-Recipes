export async function uploadRecipe(data: FormData) {
	const response = await fetch('/api/submit-recipe', {
		method: 'POST',
		body: data,
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to upload recipe');
	}

	return response;
}
