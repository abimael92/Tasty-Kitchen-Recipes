import { useState } from 'react';

export default function RecipeCard({ recipe, splitRegex }) {
	const [expanded, setExpanded] = useState(false);
	const [activeSection, setActiveSection] = useState(null);

	const toggleExpanded = () => setExpanded((prev) => !prev);
	const toggleSection = (section) => {
		setActiveSection(activeSection === section ? null : section);
	};

	const handleCardClick = () => {
		if (recipe.slug) {
			window.location.href = `/recipes/${recipe.slug}`;
		}
	};

	const handleButtonClick = (e) => {
		e.stopPropagation();
		toggleExpanded();
	};

	const handleSectionClick = (e, section) => {
		e.stopPropagation();
		toggleSection(section);
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
					{/* Ingredients Accordion */}
					<div className='accordion-section'>
						<button
							className={`accordion-header ${
								activeSection === 'ingredients' ? 'active' : ''
							}`}
							onClick={(e) => handleSectionClick(e, 'ingredients')}
						>
							<span>Ingredients</span>
							<svg
								className={`accordion-arrow ${
									activeSection === 'ingredients' ? 'expanded' : ''
								}`}
								width='16'
								height='16'
								viewBox='0 0 16 16'
							>
								<path
									fill='currentColor'
									d='M8 12L3 7l1.4-1.4L8 9.2l3.6-3.6L13 7z'
								/>
							</svg>
						</button>
						<div
							className={`accordion-content ${
								activeSection === 'ingredients' ? 'expanded' : ''
							}`}
						>
							<div className='ingredients-list'>
								{ingredients.filter(Boolean).map((ingredient, i) => (
									<div key={i} className='ingredient-item'>
										{ingredient}
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Instructions Accordion */}
					<div className='accordion-section'>
						<button
							className={`accordion-header ${
								activeSection === 'instructions' ? 'active' : ''
							}`}
							onClick={(e) => handleSectionClick(e, 'instructions')}
						>
							<span>Instructions</span>
							<svg
								className={`accordion-arrow ${
									activeSection === 'instructions' ? 'expanded' : ''
								}`}
								width='16'
								height='16'
								viewBox='0 0 16 16'
							>
								<path
									fill='currentColor'
									d='M8 12L3 7l1.4-1.4L8 9.2l3.6-3.6L13 7z'
								/>
							</svg>
						</button>
						<div
							className={`accordion-content ${
								activeSection === 'instructions' ? 'expanded' : ''
							}`}
						>
							<div className='instructions-list'>
								{instructions.filter(Boolean).map((step, i) => (
									<div key={i} className='instruction-step'>
										<span className='step-number'>{i + 1}.</span>
										<span className='step-text'>{step}</span>
									</div>
								))}
							</div>
						</div>
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
					height: 150px;
					object-fit: cover;
				}

				.recipe-content {
					padding: 12px;
					display: flex;
					flex-direction: column;
					flex-grow: 1;
				}

				.recipe-title {
					margin: 0 0 8px;
					color: #d2691e;
					font-size: 1.3rem;
					font-weight: 600;
				}

				.recipe-details {
					margin-top: 10px;
					flex-grow: 1;
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				/* Accordion Styles */
				.accordion-section {
					border: 1px solid #f5c6c6;
					border-radius: 8px;
					overflow: hidden;
					background: #fff6f6;
				}

				.accordion-header {
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 12px 15px;
					background: transparent;
					border: none;
					cursor: pointer;
					font-size: 1rem;
					font-weight: 600;
					color: #d2691e;
					transition: background-color 0.2s;
				}

				.accordion-header:hover {
					background: #ffecec;
				}

				.accordion-header.active {
					background: #ffecec;
					border-bottom: 1px solid #f5c6c6;
				}

				.accordion-arrow {
					transition: transform 0.3s ease;
				}

				.accordion-arrow.expanded {
					transform: rotate(180deg);
				}

				.accordion-content {
					max-height: 0;
					overflow: hidden;
					transition: max-height 0.3s ease;
				}

				.accordion-content.expanded {
					max-height: 100px;
					overflow-y: auto;
				}

				/* List Styles */
				.ingredients-list,
				.instructions-list {
					padding: 15px;
					background: white;
				}

				.ingredient-item {
					padding: 6px 0;
					color: #5a2e2e;
					border-bottom: 1px solid #f0f0f0;
					line-height: 1.4;
				}

				.ingredient-item:last-child {
					border-bottom: none;
				}

				.instruction-step {
					display: flex;
					gap: 10px;
					padding: 10px 0;
					color: #5a2e2e;
					line-height: 1.5;
				}

				.instruction-step:not(:last-child) {
					border-bottom: 1px solid #f0f0f0;
				}

				.step-number {
					font-weight: 600;
					color: #d2691e;
					min-width: 20px;
				}

				.step-text {
					flex: 1;
				}

				/* Scrollbars */
				.accordion-content.expanded::-webkit-scrollbar {
					width: 6px;
				}

				.accordion-content.expanded::-webkit-scrollbar-thumb {
					background: #f08080;
					border-radius: 3px;
				}

				.accordion-content.expanded::-webkit-scrollbar-track {
					background: #ffecec;
				}

				/* Mobile Styles */
				@media (max-width: 768px) {
					.recipe-image {
						height: 120px;
					}

					.recipe-content {
						padding: 12px;
					}

					.recipe-title {
						font-size: 1.1rem;
						margin-bottom: 12px;
					}

					.accordion-header {
						padding: 10px 12px;
						font-size: 0.95rem;
					}

					.ingredients-list,
					.instructions-list {
						padding: 12px;
					}

					.accordion-content.expanded {
						max-height: 90px;
					}
				}
			`}</style>
		</div>
	);
}
