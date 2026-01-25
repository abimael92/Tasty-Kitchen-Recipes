import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { SimpleRating } from '../../../components/SimpleRating.jsx';

export const InteractiveRating = ({ recipeId }) => {
	const { user, loading } = useAuth();
	const [rating, setRating] = useState(0);
	const [loadingRating, setLoadingRating] = useState(true);

	useEffect(() => {
		if (!user || !recipeId) return;

		const cleanId = recipeId.replace(/^drafts\./, '');

		async function fetchUserRating() {
			try {
				const res = await fetch(`/api/get-user-rating?recipeId=${cleanId}`, {
					credentials: 'same-origin',
				});
				const data = await res.json();
				if (data.rating != null) {
					setRating(data.rating);
				}
			} catch (error) {
				console.error('Failed to fetch user rating:', error);
			} finally {
				setLoadingRating(false);
			}
		}

		fetchUserRating();
	}, [user, recipeId]);

	const handleRatingChange = async (newRating) => {
		setRating(newRating);

		if (!user) return;

		try {
			await fetch('/api/submit-rating', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ recipeId, rating: newRating }),
			});
		} catch (error) {
			console.error('Failed to submit rating:', error);
		}
	};

	if (loading || loadingRating) return <div>Loading user rating...</div>;

	return (
		<SimpleRating
			totalRatings={5}
			defaultRating={rating}
			getCurrentRatings={handleRatingChange}
		/>
	);
};

