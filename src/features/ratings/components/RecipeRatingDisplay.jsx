import React from 'react';
import { RatingStars } from './RatingStars.jsx';
import { useAverageRating } from '../../../hooks/useAverageRating.js';

export default function RecipeRatingDisplay({ recipeId }) {
	const average = useAverageRating(recipeId);

	if (average === null) return null;

	return <RatingStars rating={average} size={48} />;
}

