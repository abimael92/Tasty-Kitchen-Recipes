import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import FavoritesList from './FavoritesList.jsx';

export default function FavoritesFetcher() {
	const { user, loading } = useAuth();
	const [recipes, setRecipes] = useState([]);
	const [title, setTitle] = useState('Your Favorite Recipes');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Only fetch if we have a user and they're done loading
		if (!loading && user?._id) {
			const fetchFavorites = async () => {
				setIsLoading(true);
				setError(null);

				try {
					const res = await fetch('/api/get-favorites', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ userId: user._id }),
					});

					if (!res.ok) {
						throw new Error(`Failed to fetch: ${res.status}`);
					}

					const data = await res.json();
					setRecipes(Array.isArray(data?.recipes) ? data.recipes : []);
				} catch (err) {
					console.error('Fetch error:', err);
					setError('Failed to load favorites. Please refresh the page.');
				} finally {
					setIsLoading(false);
				}
			};

			fetchFavorites();
		}
	}, [user, loading]); // Run when user or loading state changes

	if (loading) return <p>Loading user info...</p>;
	if (!user) return <p>Please log in to see your favorites.</p>;
	if (isLoading) return <p>Loading your favorites...</p>;
	if (error) return <p className='error'>{error}</p>;

	return <FavoritesList recipes={recipes} title={title} />;
}
