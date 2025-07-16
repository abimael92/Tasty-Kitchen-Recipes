// src/components/FavoritesPage.jsx
import React from 'react';
import { AuthProvider } from '../context/AuthContext.jsx';
import FavoritesFetcher from './FavoritesFetcher.jsx';

export default function FavoritesPage() {
	return (
		<AuthProvider>
			<FavoritesFetcher />
		</AuthProvider>
	);
}
