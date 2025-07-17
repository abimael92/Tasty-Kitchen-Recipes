import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

export default function FavoriteButton({ recipeId }) {
	const { user } = useAuth();
	const [isFavorite, setIsFavorite] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchFavoriteStatus = async () => {
			if (!user) return;

			try {
				const res = await fetch('/api/get-favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: user._id }),
				});
				const data = await res.json();

				if (Array.isArray(data?.recipes)) {
					setIsFavorite(data.recipes.some((r) => r._id === recipeId));
				}
			} catch (error) {
				console.error('Failed to fetch favorites:', error);
			}
		};

		fetchFavoriteStatus();
	}, [user, recipeId]);

	const toggleFavorite = async () => {
		if (loading || !user) return;
		setLoading(true);

		try {
			await fetch('/api/toggle-favorite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: user._id, recipeId }),
			});

			setIsFavorite((prev) => !prev); // Flip visual after success
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<span
			onClick={toggleFavorite}
			style={{
				cursor: loading ? 'not-allowed' : 'pointer',
				color: isFavorite ? 'red' : 'gray',
				fontSize: '1.8rem',
				alignSelf: 'flex-start',
			}}
		>
			{isFavorite ? <FaHeart /> : <FaRegHeart />}
		</span>
	);
}
