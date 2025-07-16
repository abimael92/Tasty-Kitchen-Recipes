import { useState } from 'react';

interface Recipe {
	_id?: string;
	[key: string]: any;
}

export function useRecipe(initialRecipe: Recipe | null) {
	const [recipe] = useState<Recipe | null>(initialRecipe || null);

	return {
		recipe,
		recipeId: recipe?._id ?? null,
	};
}
