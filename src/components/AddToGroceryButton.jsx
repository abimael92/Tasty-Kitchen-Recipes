import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { parseIngredient } from '../utils/parseIngredient';

export default function AddToGroceryButton({ ingredients, recipeId }) {
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
					body: JSON.stringify({
						userId: user._id,
						recipeId: recipeId, // Added recipeId to the request
					}),
				});
				const data = await res.json();

				if (data?.success !== false && Array.isArray(data?.recipes)) {
					setIsInList(data.recipes.some((r) => r._id === recipeId));
				}
			} catch (error) {
				console.error('Failed to check grocery list:', error);
			}
		};

		checkGroceryList();
	}, [user, recipeId]);

	const toggleGroceryList = async () => {
		if (loading || !user) return;
		setLoading(true);

		try {
			// Safely process ingredients whether they come as array or string
			let rawItems = [];
			if (Array.isArray(ingredients)) {
				rawItems = ingredients.filter(
					(item) => item && typeof item === 'string'
				);
			} else if (typeof ingredients === 'string') {
				rawItems = ingredients
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => line.length > 0);
			}

			console.log('Raw ingredients:', rawItems);

			const parsedItems = rawItems.map((item) => {
				try {
					const parsed = parseIngredient(item);
					console.log('Parsed ingredient:', parsed);
					return {
						name: parsed.name.toLowerCase(),
						originalText: item,
						quantity: parsed.quantity,
						unit: parsed.unit,
						completed: false,
					};
				} catch (error) {
					console.error('Failed to parse ingredient:', item, error);
					return {
						name: item.toLowerCase(),
						originalText: item,
						quantity: '',
						unit: '',
						completed: false,
					};
				}
			});

			console.log('Sending to server:', parsedItems);

			const response = await fetch('/api/toggle-grocery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user._id,
					recipeId,
					items: parsedItems,
				}),
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const result = await response.json();
			if (result.success) {
				setIsInList((prev) => !prev);
			} else {
				console.error('Server error:', result.message);
			}
		} catch (error) {
			console.error('Failed to update grocery list:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={toggleGroceryList}
			disabled={loading}
			style={{
				background: isInList ? '#4CAF50' : '#d2691e',
				color: 'white',
				padding: '0.5rem 1rem',
				border: 'none',
				borderRadius: '4px',
				cursor: loading ? 'not-allowed' : 'pointer',
				fontWeight: '600',
			}}
		>
			{loading
				? 'Processing...'
				: isInList
				? '✓ In Your List'
				: 'Add to Grocery List'}
		</button>
	);
}

