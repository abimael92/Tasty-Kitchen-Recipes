import { useState } from 'react';
import RecipeFilters from './RecipeFilters.jsx';
import RecipeCard from './RecipeCard.jsx';
import { t, getLocale } from '../utils/i18n.js';

export default function RecipeList({ recipes, splitRegex }) {
	const [filtered, setFiltered] = useState(recipes);
	const [visibleCount, setVisibleCount] = useState(9);

	const loadMore = () => {
		setVisibleCount((prev) => prev + 3);
	};

	const visibleRecipes = filtered.slice(0, visibleCount);
	const hasMore = visibleRecipes.length < filtered.length;

	// Get the current locale
	const currentLocale = getLocale();

	return (
		<div>
			<RecipeFilters recipes={recipes} onFilter={setFiltered} />

			<div className='recipes-grid'>
				{visibleRecipes.map((recipe) => (
					<RecipeCard
						key={recipe._id || recipe.slug || recipe.id}
						recipe={recipe}
						splitRegex={splitRegex}
					/>
				))}
			</div>

			{hasMore && (
				<div className='load-more-container'>
					<button className='load-more-button' onClick={loadMore}>
						{t('loadMoreRecipes')}
					</button>
				</div>
			)}

			<style>{`
				.recipes-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
					gap: 30px;
					padding: 20px;
					max-width: 1400px;
					margin: 0 auto;
				}

				.load-more-container {
					text-align: center;
					margin: 20px 0;
				}

				.load-more-button {
					background-color: #d2691e;
					color: white;
					border: none;
					padding: 12px 24px;
					border-radius: 8px;
					font-weight: bold;
					cursor: pointer;
					font-size: 1rem;
					transition: all 0.2s;
				}

				.load-more-button:hover {
					background-color: #b3591b;
					transform: translateY(-2px);
				}

				@media (max-width: 768px) {
					.recipes-grid {
						grid-template-columns: 1fr;
						padding: 10px;
						gap: 20px;
					}
				}
			`}</style>
		</div>
	);
}
