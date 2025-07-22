import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

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
					body: JSON.stringify({ userId: user._id }),
				});
				const data = await res.json();

				if (Array.isArray(data?.recipes)) {
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
			const rawItems = Array.isArray(ingredients)
				? ingredients.filter(Boolean)
				: ingredients.split('\n').filter(Boolean);

			await fetch('/api/toggle-grocery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user._id,
					recipeId,
					items: rawItems.map((item) => ({
						name: item.trim().toLowerCase(),
						originalText: item,
						quantity: '',
						unit: '',
						completed: false,
					})),
				}),
			});

			setIsInList((prev) => !prev);
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
