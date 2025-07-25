// /api/toggle-grocery
router.post('/toggle-grocery', async (req, res) => {
	const { userId, recipeId, newItems } = req.body;

	try {
		const user = await User.findById(userId);
		const currentList = user.groceryList || [];
		const currentRecipes = user.recipes || [];

		// 1. Check if recipe exists (toggle logic)
		const recipeIndex = currentRecipes.findIndex((r) => r._id === recipeId);
		const isAdding = recipeIndex === -1;

		// 2. Merge items (only when adding)
		if (isAdding) {
			newItems.forEach((newItem) => {
				const existingItem = currentList.find(
					(item) =>
						item.name === newItem.name &&
						item.unit === newItem.unit &&
						!item.completed
				);

				if (existingItem) {
					// Merge quantities
					existingItem.quantity = mergeQuantities(
						existingItem.quantity,
						newItem.quantity
					);
					existingItem.originalText += `, ${newItem.originalText}`;
				} else {
					currentList.push(newItem);
				}
			});
		}

		// 3. Update recipes list
		if (isAdding) {
			currentRecipes.push({ _id: recipeId });
		} else {
			currentRecipes.splice(recipeIndex, 1);
			// Optional: Remove recipe's ingredients?
		}

		await user.save();
		res.json({ success: true, groceryList: currentList });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

// Utility function (backend-only)
function mergeQuantities(q1, q2) {
	if (!q1 || !q2) return q1 || q2;

	// Convert to numbers (safe eval)
	const toNumber = (q) => {
		if (q.includes('/')) {
			const [n, d] = q.split('/');
			return parseInt(n) / parseInt(d);
		}
		return parseFloat(q) || 0;
	};

	const total = toNumber(q1) + toNumber(q2);

	// Convert back to readable format
	if (total % 1 === 0) return total.toString();
	if (total === 0.5) return '1/2';
	if (total === 0.25) return '1/4';
	if (total === 0.75) return '3/4';
	return total.toFixed(2).replace(/\.?0+$/, ''); // "1.5" not "1.50"
}
