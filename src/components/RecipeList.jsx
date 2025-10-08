import { useState } from 'react';
import RecipeFilters from './RecipeFilters.jsx';

export default function RecipeList({ recipes, splitRegex }) {
	const [filtered, setFiltered] = useState(recipes);

	return (
		<>
			<RecipeFilters recipes={recipes} onFilter={setFiltered} />
			<div className='recipes-grid'>
				{filtered.map((recipe) => (
					<a
						href={`/recipes/${recipe.slug}`}
						className='recipe-card'
						key={recipe.slug}
					>
						{recipe.image && (
							<img src={recipe.image} alt={recipe.title} loading='lazy' />
						)}
						<div className='recipe-content'>
							<h2>
								{recipe.title.split(splitRegex).map((part, i) => (
									<span key={i}>
										{i % 2 === 1 ? (
											<>
												{part.trim()} <br />
											</>
										) : (
											part.trim()
										)}
									</span>
								))}
							</h2>
							{/* ...ingredients/instructions here */}
						</div>
					</a>
				))}
			</div>
		</>
	);
}
