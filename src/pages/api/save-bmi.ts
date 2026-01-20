import { serverSanityClient } from '../../lib/sanity';

export const POST = async ({ request }) => {
	try {
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const { userId, bmiData } = await request.json();

		// Buscar usuario actual
		const userQuery = `*[_type == "user" && _id == $userId][0]`;
		const currentUser = await serverSanityClient.fetch(userQuery, { userId });

		if (!currentUser) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Preparar nuevo registro de BMI
		const newBMIEntry = {
			_key: `bmi_${Date.now()}`,
			bmi: parseFloat(bmiData.bmi),
			category: bmiData.category,
			weight: parseFloat(bmiData.weight),
			height: parseFloat(bmiData.height),
			age: parseInt(bmiData.age),
			gender: bmiData.gender,
			date: new Date().toISOString(),
			notes: bmiData.notes || '',
		};

		// **CORRECCIÓN IMPORTANTE**: Usar patch con inc para actualizar solo los campos necesarios
		await serverSanityClient
			.patch(userId)
			.setIfMissing({ bmiHistory: [] })
			.insert('after', 'bmiHistory[-1]', [newBMIEntry])
			.set({
				latestBMI: parseFloat(bmiData.bmi),
				bmiCategory: bmiData.category,
			})
			.commit();

		// **ACTUALIZACIÓN**: Obtener el usuario actualizado para devolver todos los datos
		const updatedUser = await serverSanityClient.fetch(userQuery, { userId });

		return new Response(
			JSON.stringify({
				success: true,
				message: 'BMI saved successfully',
				user: updatedUser, // Devuelve el usuario completo actualizado
				bmi: bmiData,
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	} catch (error) {
		console.error('Error saving BMI:', error);
		return new Response(
			JSON.stringify({
				error: error.message || 'Failed to save BMI',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
};
