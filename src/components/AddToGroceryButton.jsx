import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { parseIngredient } from '../utils/parseIngredient';
import { t } from '../utils/i18n';

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

	const addItems = async () => {
		if (loading || !user) return;
		setLoading(true);
		try {
			let rawItems = [];
			if (Array.isArray(ingredients)) {
				rawItems = ingredients.filter((i) => i && typeof i === 'string');
			} else if (typeof ingredients === 'string') {
				rawItems = ingredients
					.split('\n')
					.map((line) => line.trim())
					.filter(Boolean);
			}

			const parsedItems = rawItems.map((item) => {
				try {
					const parsed = parseIngredient(item);
					return {
						name: parsed.name.toLowerCase(),
						originalText: item,
						quantity: parsed.quantity,
						unit: parsed.unit,
						completed: false,
					};
				} catch {
					return {
						name: item.toLowerCase(),
						originalText: item,
						quantity: '',
						unit: '',
						completed: false,
					};
				}
			});

			const res = await fetch('/api/toggle-grocery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user._id,
					recipeId,
					items: parsedItems,
				}),
			});
			const data = await res.json();
			if (data.success) setIsInList(true);
		} catch (err) {
			console.error('Failed to add items:', err);
		} finally {
			setLoading(false);
		}
	};

	const removeAllItems = async () => {
		if (loading || !user) return;
		setLoading(true);
		try {
			const res = await fetch('/api/remove-grocery-recipe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: user._id, recipeId }),
			});
			const data = await res.json();
			if (data.success) setIsInList(false);
		} catch (err) {
			console.error('Failed to remove items:', err);
		} finally {
			setLoading(false);
		}
	};

	if (!user) return null;

	return (
		<button
			onClick={isInList ? removeAllItems : addItems}
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
