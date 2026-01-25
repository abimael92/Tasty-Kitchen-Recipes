import { useState, useEffect } from 'react';

export function useAverageRating(recipeId) {
	const [average, setAverage] = useState(null);

	useEffect(() => {
		if (!recipeId) return;

		const cleanId = recipeId.replace(/^drafts\./, '');

		const fetchAverage = async () => {
			try {
				const res = await fetch(`/api/get-average-rating?recipeId=${cleanId}`);
				const data = await res.json();

				setAverage(data.average);
			} catch (err) {
				console.error('Fetch failed:', err);
				setAverage(0);
			}
		};

		fetchAverage();
	}, [recipeId]);

	return average;
}
