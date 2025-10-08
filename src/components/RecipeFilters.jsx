import { useState, useEffect } from 'react';

export default function RecipeFilters({ recipes, onFilter }) {
	const [filters, setFilters] = useState({
		text: '',
		ingredients: [],
		chef: '',
		tags: [],
		rating: null,
	});

	const handleChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	useEffect(() => {
		let filtered = [...recipes];

		// text
		if (filters.text) {
			filtered = filtered.filter((r) =>
				r.title.toLowerCase().includes(filters.text.toLowerCase())
			);
		}

		// ingredients
		if (filters.ingredients.length > 0) {
			filtered = filtered.filter((r) => {
				const recipeIngredients = Array.isArray(r.ingredients)
					? r.ingredients
					: r.ingredients?.split?.('\n') || [];
				return filters.ingredients.every((i) =>
					recipeIngredients.some((ri) =>
						ri.toLowerCase().includes(i.toLowerCase())
					)
				);
			});
		}

		// chef
		if (filters.chef) {
			filtered = filtered.filter(
				(r) => r.chef && r.chef.toLowerCase() === filters.chef.toLowerCase()
			);
		}

		// tags
		if (filters.tags.length > 0) {
			filtered = filtered.filter(
				(r) =>
					Array.isArray(r.tags) &&
					filters.tags.every((t) =>
						r.tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())
					)
			);
		}

		// rating
		if (filters.rating) {
			filtered = filtered.filter(
				(r) => Number(r.rating) >= Number(filters.rating)
			);
		}

		onFilter(filtered);
	}, [filters, recipes]);

	return (
		<div className='recipe-filters-bar'>
			<input
				type='text'
				placeholder='Search...'
				value={filters.text}
				onChange={(e) => handleChange('text', e.target.value)}
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
			/>

			<input
				type='text'
				placeholder='Chef'
				value={filters.chef}
				onChange={(e) => handleChange('chef', e.target.value)}
			/>

			<input
				type='text'
				placeholder='Tags (comma separated)'
				onChange={(e) =>
					handleChange(
						'tags',
						e.target.value
							.split(',')
							.map((v) => v.trim())
							.filter(Boolean)
					)
				}
			/>

			<select
				value={filters.rating || ''}
				onChange={(e) => handleChange('rating', e.target.value)}
			>
				<option value=''>Min Rating</option>
				<option value='1'>1+</option>
				<option value='2'>2+</option>
				<option value='3'>3+</option>
				<option value='4'>4+</option>
				<option value='5'>5</option>
			</select>
		</div>
	);
}
