export const deduplicateGroceryItems = (items) => {
	if (!Array.isArray(items)) {
		console.error('Expected array but got:', typeof items);
		return [];
	}

	const itemMap = new Map();

	items.forEach((item) => {
		try {
			if (!item || typeof item !== 'object') {
				console.warn('Skipping invalid item:', item);
				return;
			}

			const name = item.name?.toLowerCase().trim();
			if (!name) {
				console.warn('Skipping item with missing name:', item);
				return;
			}

			const quantity = parseFloat(item.quantity) || 0;
			const unit = (item.unit || '').toLowerCase().trim();

			// Create unique key by name + unit
			const key = unit ? `${name}_${unit}` : name;

			if (itemMap.has(key)) {
				// Merge with existing item
				const existing = itemMap.get(key);

				// Handle quantity addition with unit validation
				if (existing.unit === unit) {
					existing.quantity += quantity;
				} else {
					// Different units - convert to "and" format
					existing.quantity =
						`${existing.quantity} ${existing.unit} and ${quantity} ${unit}`.trim();
					existing.unit = ''; // Clear unit since we have mixed units
				}

				// Preserve completion status (if any is completed, keep it completed)
				existing.completed = existing.completed || item.completed;

				// Track source recipes
				if (
					item.recipeTitle &&
					!existing.sourceRecipes?.includes(item.recipeTitle)
				) {
					existing.sourceRecipes = [
						...(existing.sourceRecipes || []),
						item.recipeTitle,
					];
				}
			} else {
				// New item
				itemMap.set(key, {
					...item,
					quantity,
					unit,
					sourceRecipes: item.recipeTitle ? [item.recipeTitle] : [],
					_key: key, // Use consistent key for React
				});
			}
		} catch (error) {
			console.error('Error processing item:', item, error);
			// Continue with other items instead of breaking
		}
	});

	return Array.from(itemMap.values());
};
