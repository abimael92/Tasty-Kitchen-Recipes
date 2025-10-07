import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from './LoadingIndicator.jsx';
import { t } from '../utils/i18n';

export const GroceryListPage = ({ locale }) => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	if (typeof window === 'undefined') return <LoadingIndicator />;

	const { user: currentUser } = useAuth();

	const fetchGroceryList = async () => {
		if (!currentUser?._id) {
			console.log('No user ID, stopping fetch');
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(`/api/grocery-list?uid=${currentUser._id}`);

			if (!res.ok) throw new Error('Failed to fetch grocery list');

			const data = await res.json();
			setItems(data);
		} catch (err) {
			console.error('Error fetching grocery list:', err);
			setError(err.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	const toggleComplete = async (itemKey) => {
		try {
			const res = await fetch('/api/toggle-item', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: currentUser._id,
					itemKey,
				}),
			});

			if (!res.ok) throw new Error('Failed to update item');

			const updatedItems = await res.json();

			setItems(updatedItems);
		} catch (err) {
			console.error('Error updating item:', err);
			alert('Failed to update item. Please try again.');
		}
	};

	useEffect(() => {
		if (!currentUser?._id) {
			// console.error('User not available on load');

			setLoading(false);
			return;
		}
		fetchGroceryList();
	}, [currentUser]);

	if (loading) return <LoadingIndicator />;

	if (error) return <div>Error: {error}</div>;

	return (
		<div className='grocery-list-container'>
			<h1> {t('groceryList.title', locale) || 'My Grocery List'}</h1>
			{items.length === 0 ? (
				<p>
					{t('groceryList.emptyMessage', locale) ||
						'Your grocery list is empty'}
				</p>
			) : (
				<ul className='grocery-items'>
					{items.map((item) => (
						<li
							key={item._key}
							className={`grocery-item ${item.completed ? 'completed' : ''}`}
						>
							<input
								type='checkbox'
								checked={item.completed}
								onChange={() => toggleComplete(item._key)}
								className='item-checkbox'
							/>
							<span className='item-text'>
								{item.quantity && (
									<span className='quantity'>
										{item.quantity}
										{item.unit ? ` ${item.unit}` : ''}
									</span>
								)}
								<span className='name'>{item.name}</span>
							</span>
						</li>
					))}
				</ul>
			)}
			<style>{`
				.grocery-list-container {
					max-width: 800px;
					margin: 0 auto;
					padding: 2rem;
				}

				.grocery-items {
					list-style: none;
					padding: 0;
				}

				.grocery-item {
					display: flex;
					align-items: center;
					padding: 0.75rem 1rem;
					margin-bottom: 0.5rem;
					background: #f8f8f8;
					border-radius: 0.5rem;
					transition: background-color 0.2s;
				}

				.grocery-item:hover {
					background: #f0f0f0;
				}

				.grocery-item.completed {
					opacity: 0.7;
				}

				.grocery-item.completed .item-text {
					text-decoration: line-through;
				}

				.item-checkbox {
					margin-right: 1rem;
					cursor: pointer;
				}

				.item-text {
					flex: 1;
				}

				.quantity {
					font-weight: 700;
					margin-right: 0.3rem;
					display: inline-block;
					vertical-align: middle;
				}

			`}</style>
		</div>
	);
};

