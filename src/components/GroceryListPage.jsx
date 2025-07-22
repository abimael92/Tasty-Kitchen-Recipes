import React, { useState, useEffect, useContext } from 'react';
import { client } from '../lib/sanity';
import { useAuth } from '../context/AuthContext';

export const GroceryListPage = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	if (typeof window === 'undefined') return null;

	const { user: currentUser } = useAuth();

	console.log('currentUser:', currentUser);
	console.log('items:', items);
	console.log('error:', error);

	const fetchGroceryList = async () => {
		if (!currentUser?.uid) {
			setLoading(false);
			return;
		}

		try {
			const result = await client.fetch(
				`*[_type == "groceryList" && user._ref == $userId][0]{
          items[]{
            _key,
            name,
            originalText,
            quantity,
            unit,
            completed
          }
        }`,
				{ userId: currentUser.uid }
			);
			setItems(result?.items || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const toggleComplete = async (itemKey) => {
		try {
			const result = await client.fetch(
				`*[_type == "groceryList" && user._ref == $userId][0]{
          _id,
          items
        }`,
				{ userId: currentUser.uid }
			);

			if (!result) return;

			const updatedItems = result.items.map((item) =>
				item._key === itemKey ? { ...item, completed: !item.completed } : item
			);

			await client.patch(result._id).set({ items: updatedItems }).commit();
			setItems(updatedItems);
		} catch (err) {
			console.error('Error updating item:', err);
		}
	};

	useEffect(() => {
		fetchGroceryList();
	}, [currentUser]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className='grocery-list-container'>
			<h1>My Grocery List</h1>

			{items.length === 0 ? (
				<p>Your grocery list is empty</p>
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
								{item.quantity && `${item.quantity} `}
								{item.unit && `${item.unit} `}
								{item.name}
							</span>
						</li>
					))}
				</ul>
			)}

			<style jsx>{`
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
			`}</style>
		</div>
	);
};
