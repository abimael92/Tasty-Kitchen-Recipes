import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import FavoritesList from './FavoritesList.jsx';
import { t } from '../utils/i18n';

export default function FavoritesFetcher({ locale = 'es' }) {
	const { user, loading } = useAuth();
	const [recipes, setRecipes] = useState([]);
	const [title, setTitle] = useState(t('favorites.title', locale));
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
					setError(t('favorites.fetchError', locale));
				} finally {
					setIsLoading(false);
				}
			};

			fetchFavorites();
		}
	}, [user, loading, locale]); // Añadí locale a las dependencias

	// Actualizar el título cuando cambia el locale
	useEffect(() => {
		setTitle(t('favorites.title', locale));
	}, [locale]);

	if (loading) return <p>{t('auth.loading', locale)}</p>;
	if (!user) return <p>{t('favorites.loginRequired', locale)}</p>;
	if (isLoading) return <p>{t('favorites.loading', locale)}</p>;
	if (error) return <p className='error'>{error}</p>;

	return <FavoritesList recipes={recipes} title={title} locale={locale} />;
}
