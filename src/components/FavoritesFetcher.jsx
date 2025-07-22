import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import FavoritesList from './FavoritesList.jsx';

export default function FavoritesFetcher() {
	const { user, loading } = useAuth();
	const [recipes, setRecipes] = useState([]);

	useEffect(() => {
		if (!loading && user?.uid) {
			fetch('/api/get-favorites', {
				method: 'POST',
				body: JSON.stringify({ userId: user.uid }),
				headers: { 'Content-Type': 'application/json' },
			})
				.then((res) => res.json())
				.then((data) => {
					setRecipes(data.recipes || []);
				})
				.catch((err) => {
					console.error('Failed to load favorites', err);
				});
		}
	}, [loading, user]);

	if (loading) return <p>Loading user info...</p>;
	if (!user) return <p>Please log in to see favorites.</p>;

	return <FavoritesList recipes={recipes} />;
}
