import { useState } from 'react';

export default function RecipeCard({ recipe, splitRegex }) {
	const [expanded, setExpanded] = useState(false);

	const toggleExpanded = () => setExpanded((prev) => !prev);

	const handleCardClick = () => {
		// Navigate to recipe detail page when card is clicked
		if (recipe.slug) {
			window.location.href = `/recipes/${recipe.slug}`;
		}
	};

	const handleButtonClick = (e) => {
		// Stop propagation so card click doesn't trigger when button is clicked
		e.stopPropagation();
		toggleExpanded();
	};

	const ingredients = Array.isArray(recipe.ingredients)
		? recipe.ingredients
		: recipe.ingredients?.split('\n') || [];

	const instructions = Array.isArray(recipe.instructions)
		? recipe.instructions
		: recipe.instructions?.split('\n') || [];

	return (
		<div className='recipe-card' onClick={handleCardClick}>
			{recipe.image && (
				<img
					src={recipe.image}
					alt={recipe.title}
					className='recipe-image'
					loading='lazy'
				/>
			)}
			<div className='recipe-content'>
				<h2 className='recipe-title'>
					{recipe.title.split(splitRegex).map((part, i) => (
						<span key={i}>
							{i % 2 === 1 ? (
								<>
									{part.trim()}
									<br />
								</>
							) : (
								part.trim()
							)}
						</span>
					))}
				</h2>

				<div className='recipe-details'>
					<div className={`toggle-content ${expanded ? 'expanded' : ''}`}>
						<h3>Ingredients</h3>
						<div className='ingredients-list'>
							{(Array.isArray(recipe.ingredients)
								? recipe.ingredients
								: recipe.ingredients?.split?.('\n') || []
							)
								.filter(Boolean)
								.map((ingredient, i) => (
									<span key={i}>
										{ingredient}
										<br />
									</span>
								))}
						</div>

						<h3>Instructions</h3>
						<div className='instructions-list'>
							{(Array.isArray(recipe.instructions)
								? recipe.instructions
								: recipe.instructions?.split?.('\n') || []
							)
								.filter(Boolean)
								.map((step, i) => (
									<span key={i}>
										{step}
										<br />
										<br />
									</span>
								))}
						</div>
					</div>

					<div className='mobile-only-toggle'>
						<button
							className='mobile-toggle-button'
							onClick={handleButtonClick}
						>
							{expanded ? 'View Less' : 'View More'}
						</button>
					</div>
				</div>
			</div>

			<style jsx>{`
				.recipe-card {
					background: white;
					border: 1px solid #f5c6c6;
					border-radius: 12px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
					overflow: hidden;
					display: flex;
					flex-direction: column;
					transition: transform 0.2s, box-shadow 0.2s;
					cursor: pointer;
				}

				.recipe-card:hover {
					transform: translateY(-5px);
					box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
				}

				.recipe-image {
					width: 100%;
					height: 200px;
					object-fit: cover;
				}

				.recipe-content {
					padding: 15px;
					display: flex;
					flex-direction: column;
					flex-grow: 1;
				}

				.recipe-title {
					margin: 0 0 10px;
					color: #d2691e;
					font-size: 1.3rem;
				}

				.recipe-details {
					margin-top: 10px;
					flex-grow: 1;
					display: flex;
					flex-direction: column;
				}

				.recipe-details h3 {
					margin: 10px 0 5px;
					font-size: 1.1rem;
					color: #d2691e;
				}

				.toggle-content {
					max-height: none;
					overflow: visible;
					transition: max-height 0.3s ease;
				}

				.ingredients-list,
				.instructions-list {
					background: #fff6f6;
					border: 1px solid #f5c6c6;
					border-radius: 8px;
					padding: 10px 15px;
					margin: 5px 0;
					max-height: 150px;
					overflow-y: auto;
					color: #5a2e2e;
					line-height: 1.5;
				}

				/* Remove list styling since we're using div/span instead of ul/ol/li */
				.ingredients-list {
					list-style-type: none;
					padding-left: 15px;
				}

				.instructions-list {
					list-style-type: none;
					padding-left: 15px;
				}

				/* Scrollbars */
				.ingredients-list::-webkit-scrollbar,
				.instructions-list::-webkit-scrollbar {
					width: 8px;
				}

				.ingredients-list::-webkit-scrollbar-thumb,
				.instructions-list::-webkit-scrollbar-thumb {
					background: #f08080;
					border-radius: 4px;
				}

				.ingredients-list::-webkit-scrollbar-track,
				.instructions-list::-webkit-scrollbar-track {
					background: #ffecec;
					border-radius: 4px;
				}

				.mobile-only-toggle {
					display: none;
					margin-top: 10px;
					text-align: center;
				}

				.mobile-toggle-button {
					background-color: #d2691e;
					color: white;
					border: none;
					padding: 0.5rem 1rem;
					border-radius: 5px;
					font-weight: bold;
					cursor: pointer;
				}

				@media (max-width: 768px) {
					.recipe-image {
						height: 160px;
					}

					.toggle-content {
						max-height: 0;
						overflow: hidden;
					}

					.toggle-content.expanded {
						max-height: 1000px;
						overflow: visible;
					}

					.mobile-only-toggle {
						display: block;
					}

					.ingredients-list,
					.instructions-list {
						max-height: none;
						overflow-y: visible;
					}
				}
			`}</style>
		</div>
	);
}
