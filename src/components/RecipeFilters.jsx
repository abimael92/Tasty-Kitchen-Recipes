import { useState, useEffect } from 'react';

export default function RecipeFilters({ recipes, onFilter }) {
	const [filters, setFilters] = useState({
		text: '',
		ingredients: [],
		chef: '',
		tags: [],
		rating: null,
	});

	const handleChange = (key, value) =>
		setFilters((prev) => ({ ...prev, [key]: value }));

	// Extract unique chefs and tags for dropdowns
	const uniqueChefs = [...new Set(recipes.map((r) => r.chef).filter(Boolean))];
	const allTags = recipes
		.flatMap((r) => (Array.isArray(r.tags) ? r.tags : []))
		.filter(Boolean);
	const uniqueTags = [...new Set(allTags)];

	useEffect(() => {
		let filtered = [...recipes];

		// Text filter
		if (filters.text) {
			filtered = filtered.filter((r) =>
				r.title.toLowerCase().includes(filters.text.toLowerCase())
			);
		}

		// Ingredients filter
		if (filters.ingredients.length > 0) {
			filtered = filtered.filter((r) => {
				const recipeIngredients = Array.isArray(r.ingredients)
					? r.ingredients
					: r.ingredients?.split('\n') || [];
				return filters.ingredients.every((i) =>
					recipeIngredients.some((ri) =>
						ri.toLowerCase().includes(i.toLowerCase())
					)
				);
			});
		}

		// Chef filter
		if (filters.chef) {
			filtered = filtered.filter(
				(r) => r.chef && r.chef.toLowerCase() === filters.chef.toLowerCase()
			);
		}

		// Tags filter
		if (filters.tags.length > 0) {
			filtered = filtered.filter(
				(r) =>
					Array.isArray(r.tags) &&
					filters.tags.every((t) =>
						r.tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())
					)
			);
		}

		// Rating filter
		if (filters.rating) {
			filtered = filtered.filter(
				(r) => Number(r.rating) >= Number(filters.rating)
			);
		}

		onFilter(filtered);
	}, [filters, recipes, onFilter]);

	const clearFilters = () => {
		setFilters({
			text: '',
			ingredients: [],
			chef: '',
			tags: [],
			rating: null,
		});
	};

	return (
		<div className='recipe-filters-bar'>
			<input
				type='text'
				placeholder='Search recipes...'
				value={filters.text}
				onChange={(e) => handleChange('text', e.target.value)}
				className='filter-input'
			/>

			<input
				type='text'
				placeholder='Ingredients (comma separated)'
				onChange={(e) =>
					handleChange(
						'ingredients',
						e.target.value
							.split(',')
							.map((v) => v.trim())
							.filter(Boolean)
					)
				}
				className='filter-input'
			/>

			<select
				value={filters.chef}
				onChange={(e) => handleChange('chef', e.target.value)}
				className='filter-select'
			>
				<option value=''>All Chefs</option>
				{uniqueChefs.map((chef) => (
					<option key={chef} value={chef}>
						{chef}
					</option>
				))}
			</select>

			<select
				value={filters.tags[0] || ''}
				onChange={(e) =>
					handleChange('tags', e.target.value ? [e.target.value] : [])
				}
				className='filter-select'
			>
				<option value=''>All Tags</option>
				{uniqueTags.map((tag) => (
					<option key={tag} value={tag}>
						{tag}
					</option>
				))}
			</select>

			<select
				value={filters.rating || ''}
				onChange={(e) => handleChange('rating', e.target.value)}
				className='filter-select'
			>
				<option value=''>Min Rating</option>
				{[1, 2, 3, 4, 5].map((r) => (
					<option key={r} value={r}>
						{r}+ ⭐
					</option>
				))}
			</select>

			<button onClick={clearFilters} className='clear-filters-btn'>
				Clear
			</button>

			<style jsx>{`
				.recipe-filters-bar {
					display: flex;
					gap: 15px;
					padding: 20px;
					flex-wrap: wrap;
					justify-content: center;
					align-items: center;
					background: #fff6f6;
					border-radius: 12px;
					margin: 20px;
					border: 1px solid #f5c6c6;
				}

				.filter-input,
				.filter-select {
					padding: 10px 15px;
					border: 1px solid #f5c6c6;
					border-radius: 8px;
					font-size: 1rem;
					background: white;
					min-width: 150px;
					flex: 1;
				}

				.filter-input:focus,
				.filter-select:focus {
					outline: none;
					border-color: #d2691e;
					box-shadow: 0 0 0 2px rgba(210, 105, 30, 0.2);
				}

				.clear-filters-btn {
					padding: 10px 20px;
					background: #d2691e;
					color: white;
					border: none;
					border-radius: 8px;
					cursor: pointer;
					font-weight: bold;
					transition: all 0.2s;
				}

				.clear-filters-btn:hover {
					background: #b3591b;
					transform: translateY(-2px);
				}

				@media (max-width: 768px) {
					.recipe-filters-bar {
						flex-direction: column;
						gap: 10px;
						margin: 10px;
						padding: 15px;
					}

					.filter-input,
					.filter-select {
						width: 100%;
						min-width: auto;
					}
				}
			`}</style>
		</div>
	);
}
