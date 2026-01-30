import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';
import { toSafeErrorResponse } from '../../shared/utils/apiError';

export const POST = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { bmiData } = await request.json();

		const currentUser = await requireSanityUserByUid(auth.uid);

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
			.patch(currentUser._id)
			.setIfMissing({ bmiHistory: [] })
			.insert('after', 'bmiHistory[-1]', [newBMIEntry])
			.set({
				latestBMI: parseFloat(bmiData.bmi),
				bmiCategory: bmiData.category,
			})
			.commit();

		// **ACTUALIZACIÓN**: Obtener el usuario actualizado para devolver todos los datos
		const userQuery = `*[_type == "user" && _id == $userId][0]`;
		const updatedUser = await serverSanityClient.fetch(userQuery, {
			userId: currentUser._id,
		});

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
		return toSafeErrorResponse(error, {
			status: 500,
			context: 'save-bmi',
			defaultMessage: 'Failed to save BMI',
		});
	}
};
