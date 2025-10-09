import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { parseIngredient } from '../utils/parseIngredient.js';
import { t } from '../utils/i18n.js';

export default function GroceryListToggleButton({
	ingredients,
	recipeId,
	currentLocale,
}) {
	const { user } = useAuth();
	const [isInList, setIsInList] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const checkGroceryList = async () => {
			if (!user) return;
			try {
				const res = await fetch('/api/check-grocery', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId: user._id, recipeId }),
				});
				const data = await res.json();
				if (data?.success && Array.isArray(data?.recipes)) {
					setIsInList(data.recipes.some((r) => r._id === recipeId));
				}
			} catch (err) {
				console.error('Failed to check grocery list:', err);
			}
		};
		checkGroceryList();
	}, [user, recipeId]);

	const toggleGroceryList = async () => {
		if (loading || !user) return;
		setLoading(true);

		try {
			let parsedItems = [];

			// Only parse items if we're ADDING (not removing)
			if (!isInList) {
				let rawItems = [];
				if (Array.isArray(ingredients)) {
					rawItems = ingredients.filter((i) => i && typeof i === 'string');
				} else if (typeof ingredients === 'string') {
					rawItems = ingredients
						.split('\n')
						.map((line) => line.trim())
						.filter(Boolean);
				}

				parsedItems = rawItems.map((item) => {
					try {
						const parsed = parseIngredient(item);
						return {
							name: parsed.name.toLowerCase().trim(),
							originalText: item,
							quantity: parsed.quantity,
							unit: (parsed.unit || '').toLowerCase().trim(),
							completed: false,
						};
					} catch {
						return {
							name: item.toLowerCase().trim(),
							originalText: item,
							quantity: '',
							unit: '',
							completed: false,
						};
					}
				});
			}

			const res = await fetch('/api/toggle-grocery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user._id,
					recipeId,
					items: parsedItems, // Empty array when removing
				}),
			});

			const data = await res.json();
			if (data.success) {
				setIsInList(!isInList); // Toggle the state
			}
		} catch (err) {
			console.error('Failed to toggle grocery list:', err);
		} finally {
			setLoading(false);
		}
	};

	if (!user) return null;

	return (
		<button
			onClick={toggleGroceryList}
			disabled={loading}
			style={{
				background: isInList ? '#e53935' : '#d2691e',
				color: 'white',
				padding: '0.5rem 1rem',
				border: 'none',
				borderRadius: '4px',
				cursor: loading ? 'not-allowed' : 'pointer',
				fontWeight: '600',
				display: 'flex',
				alignItems: 'center',
				gap: '0.4rem',
			}}
		>
			{loading ? (
				t('groceryList.processing', currentLocale)
			) : isInList ? (
				t('groceryList.removeAll', currentLocale) || 'Remove from Grocery List'
			) : (
				<>
					<span className='plus-icon'>+</span>
					{t('groceryList.addToList', currentLocale)}
				</>
			)}
		</button>
	);
}
