import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from './LoadingIndicator.jsx';
import { deduplicateGroceryItems } from '../utils/deduplicateGroceryItems.ts';
import { t } from '../utils/i18n';

// SVG Icon Components
const PlusIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 5v14M5 12h14' />
	</svg>
);

const TrashIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
	</svg>
);

const CheckIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M20 6L9 17l-5-5' />
	</svg>
);

const CircleIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='12' cy='12' r='10' />
	</svg>
);

const FilterIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' />
	</svg>
);

const BagIcon = () => (
	<svg
		width='32'
		height='32'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z' />
		<path d='M3 6h18' />
		<path d='M16 10a4 4 0 01-8 0' />
	</svg>
);

const SearchIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='11' cy='11' r='8' />
		<path d='m21 21-4.35-4.35' />
	</svg>
);

const XIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M18 6 6 18' />
		<path d='m6 6 12 12' />
	</svg>
);

const DownloadIcon = () => (
	<svg
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
		<polyline points='7 10 12 15 17 10' />
		<line x1='12' y1='15' x2='12' y2='3' />
	</svg>
);

const ClockIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='12' cy='12' r='10' />
		<polyline points='12 6 12 12 16 14' />
	</svg>
);

const StarIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
	</svg>
);

const AlertIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<circle cx='12' cy='12' r='10' />
		<line x1='12' y1='8' x2='12' y2='12' />
		<line x1='12' y1='16' x2='12.01' y2='16' />
	</svg>
);

// Simple category icons using letters or simple shapes
const AppleIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z' />
		<path d='M10 2c1 .5 2 2 2 5' />
	</svg>
);

const MilkIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M8 2h8' />
		<path d='M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2' />
		<path d='M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0' />
	</svg>
);

const MeatIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M13.62 8.382l1.966-1.967A2 2 0 1 1 19 5a2 2 0 1 1-1.413 3.414l-1.82 1.821' />
		<ellipse cx='8.5' cy='14.5' rx='7' ry='3' />
		<path d='M3 22c0-3.5 2.5-6 6.5-6 1 0 1.5.5 2 1' />
	</svg>
);

const BreadIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M4.22 19.78a1 1 0 0 1-1.41-1.41l9.84-9.84a4 4 0 0 1 5.66 0l4.57 4.57a4 4 0 0 1 0 5.66l-5.94 5.94a4 4 0 0 1-5.66 0l-7.07-7.07a4 4 0 0 1 0-5.66l3.54-3.54' />
	</svg>
);

const BottleIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M10 2v2.343' />
		<path d='M14 2v2.343a4 4 0 0 1-.468 1.863L11 12v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9l-2.532-5.794A4 4 0 0 1 10 4.343V2' />
	</svg>
);

const IceIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M8 22h8' />
		<path d='M7 10h10' />
		<path d='M12 15v7' />
		<path d='M12 2v2' />
		<path d='M2 5h20' />
		<path d='m20 5-8 7-8-7' />
	</svg>
);

const PackageIcon = () => (
	<svg
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 22V12' />
		<path d='M16 7l-4-4-4 4' />
		<path d='M3 7h18' />
		<path d='M5 7v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7' />
	</svg>
);

const CheckCheckIcon = () => (
	<svg
		width='16'
		height='16'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M18 6 7 17l-5-5' />
		<path d='m22 10-7.5 7.5L13 16' />
	</svg>
);

export const GroceryListPage = ({ locale }) => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [newItem, setNewItem] = useState('');
	const [quantity, setQuantity] = useState('');
	const [unit, setUnit] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('other');
	const [filter, setFilter] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [showAddForm, setShowAddForm] = useState(false);
	const [itemAdded, setItemAdded] = useState(false);
	const [stats, setStats] = useState({
		total: 0,
		completed: 0,
		active: 0,
	});

	const { user: currentUser } = useAuth();
	const audioRef = useRef(null);

	// Categories with our custom SVG icons
	const categories = [
		{
			id: 'produce',
			name: 'Produce',
			color: 'category-produce',
			icon: AppleIcon,
		},
		{ id: 'dairy', name: 'Dairy', color: 'category-dairy', icon: MilkIcon },
		{ id: 'meat', name: 'Meat & Fish', color: 'category-meat', icon: MeatIcon },
		{ id: 'bakery', name: 'Bakery', color: 'category-bakery', icon: BreadIcon },
		{
			id: 'pantry',
			name: 'Pantry',
			color: 'category-pantry',
			icon: PackageIcon,
		},
		{
			id: 'beverages',
			name: 'Beverages',
			color: 'category-beverages',
			icon: BottleIcon,
		},
		{ id: 'frozen', name: 'Frozen', color: 'category-frozen', icon: IceIcon },
		{ id: 'other', name: 'Other', color: 'category-other', icon: PackageIcon },
	];

	const updateStats = () => {
		const total = items.length;
		const completed = items.filter((item) => item.completed).length;
		const active = total - completed;
		setStats({ total, completed, active });
	};

	const getFilteredItems = () => {
		let filtered = [...items];

		if (filter === 'active') {
			filtered = filtered.filter((item) => !item.completed);
		} else if (filter === 'completed') {
			filtered = filtered.filter((item) => item.completed);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(query) ||
					(item.category && item.category.toLowerCase().includes(query))
			);
		}

		return filtered.sort((a, b) => {
			if (a.completed !== b.completed) return a.completed ? 1 : -1;
			if (a.category !== b.category)
				return (a.category || '').localeCompare(b.category || '');
			return a.name.localeCompare(b.name);
		});
	};

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
			const deduplicatedItems = deduplicateGroceryItems(data);

			console.log('Fetched grocery list:', deduplicatedItems);
			setItems(deduplicatedItems);
			updateStats();
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
			updateStats();
		} catch (err) {
			console.error('Error updating item:', err);
			alert('Failed to update item. Please try again.');
		}
	};

	function capitalizeImportant(name) {
		const ignore = [
			// English
			'and',
			'of',
			'the',
			'in',
			'on',
			'a',
			'an',
			'to',
			'for',
			'with',
			// Spanish
			'y',
			'de',
			'De',
			'del',
			'la',
			'el',
			'los',
			'las',
			'en',
			'un',
			'una',
			'unos',
			'unas',
			'para',
			'con',
			'por',
			'sin',
			'sobre',
		];

		const words = name.trim().split(' ');

		// Skip first word if it's in ignore list
		const first = words[0].toLowerCase();
		const rest = ignore.includes(first) ? words.slice(1) : words;

		// If nothing left → return empty
		if (rest.length === 0) {
			return '';
		}

		// Capitalize remaining words
		return rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	}

	const handleAddItem = async () => {
		if (!newItem.trim()) return;

		try {
			const newItemObj = {
				_key: Date.now().toString(),
				name: newItem.trim(),
				quantity: quantity.trim() || undefined,
				unit: unit.trim() || undefined,
				category: selectedCategory,
				completed: false,
				createdAt: new Date().toISOString(),
			};

			setItems((prev) => [...prev, newItemObj]);

			const res = await fetch('/api/add-grocery-item', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: currentUser._id,
					item: newItemObj,
				}),
			});

			if (!res.ok) throw new Error('Failed to add item');

			const updatedItems = await res.json();
			setItems(updatedItems);
			updateStats();

			setNewItem('');
			setQuantity('');
			setUnit('');
			setSelectedCategory('other');
			setItemAdded(true);
			setShowAddForm(false);

			setTimeout(() => setItemAdded(false), 2000);
		} catch (err) {
			console.error('Error adding item:', err);
			alert('Failed to add item. Please try again.');
		}
	};

	const handleDeleteItem = async (itemKey) => {
		if (!window.confirm('Are you sure you want to delete this item?')) return;

		try {
			const res = await fetch('/api/delete-grocery-item', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: currentUser._id,
					itemKey,
				}),
			});

			if (!res.ok) throw new Error('Failed to delete item');

			const updatedItems = await res.json();
			setItems(updatedItems);
			updateStats();
		} catch (err) {
			console.error('Error deleting item:', err);
			alert('Failed to delete item. Please try again.');
		}
	};

	const handleExportList = () => {
		const text = items
			.map(
				(item) =>
					`${item.completed ? '✓' : '○'} ${item.quantity || ''} ${
						item.unit || ''
					} ${item.name}`
			)
			.join('\n');

		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'grocery-list.txt';
		a.click();
		URL.revokeObjectURL(url);
	};

	useEffect(() => {
		if (!currentUser?._id) {
			setLoading(false);
			return;
		}
		fetchGroceryList();
	}, [currentUser]);

	useEffect(() => {
		updateStats();
	}, [items]);

	if (loading) return <LoadingIndicator />;
	if (error) return <div className='error-message'>Error: {error}</div>;

	const filteredItems = getFilteredItems();

	return (
		<div className='grocery-page'>
			<div className='grocery-container'>
				<div className='grocery-header'>
					<div>
						<div className='header-title'>
							<BagIcon />
							<h1 className='page-title'>
								{t('groceryList.title', locale) || 'Smart Grocery List'}
							</h1>
						</div>
						<p className='page-subtitle'>
							{t('groceryList.subtitle', locale) ||
								'Plan, track, and shop smarter'}
						</p>
					</div>

					<div className='stats-container'>
						<div className='stat-box'>
							<div className='stat-number'>{stats.total}</div>
							<div className='stat-label'>Total</div>
						</div>
						<div className='stat-box'>
							<div className='stat-number stat-number-active'>
								{stats.active}
							</div>
							<div className='stat-label'>Active</div>
						</div>
						<div className='stat-box'>
							<div className='stat-number stat-number-completed'>
								{stats.completed}
							</div>
							<div className='stat-label'>Done</div>
						</div>
					</div>
				</div>

				<div className='progress-section'>
					<div className='progress-labels'>
						<span>Progress</span>
						<span>
							{Math.round((stats.completed / stats.total) * 100) || 0}%
						</span>
					</div>
					<div className='progress-bar-bg'>
						<div
							className='progress-bar-fill'
							style={{
								width: `${(stats.completed / stats.total) * 100 || 0}%`,
							}}
						/>
					</div>
				</div>

				<div className='controls-container'>
					<div className='search-wrapper'>
						<SearchIcon />
						<input
							type='text'
							placeholder='Search items...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='search-input'
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								className='clear-search-btn'
							>
								<XIcon />
							</button>
						)}
					</div>

					<div className='filter-buttons'>
						<button
							onClick={() => setFilter('all')}
							className={`filter-btn ${
								filter === 'all' ? 'filter-btn-active' : ''
							}`}
						>
							<FilterIcon />
							<span className='filter-text'>All</span>
						</button>
						<button
							onClick={() => setFilter('active')}
							className={`filter-btn ${
								filter === 'active' ? 'filter-btn-active active' : ''
							}`}
						>
							<CircleIcon />
							<span className='filter-text'>Active</span>
						</button>
						<button
							onClick={() => setFilter('completed')}
							className={`filter-btn ${
								filter === 'completed' ? 'filter-btn-active completed' : ''
							}`}
						>
							<CheckCheckIcon />
							<span className='filter-text'>Done</span>
						</button>
					</div>
				</div>

				{showAddForm && (
					<div className='add-item-form'>
						<div className='form-grid'>
							<div>
								<label className='form-label'>Item Name *</label>
								<input
									type='text'
									value={newItem}
									onChange={(e) => setNewItem(e.target.value)}
									placeholder='e.g., Organic Avocados'
									className='form-input'
									autoFocus
								/>
							</div>

							<div className='form-quantity-grid'>
								<div>
									<label className='form-label'>Quantity</label>
									<input
										type='text'
										value={quantity}
										onChange={(e) => setQuantity(e.target.value)}
										placeholder='4'
										className='form-input'
									/>
								</div>
								<div>
									<label className='form-label'>Unit</label>
									<input
										type='text'
										value={unit}
										onChange={(e) => setUnit(e.target.value)}
										placeholder='pcs, kg, ml'
										className='form-input'
									/>
								</div>
							</div>

							<div className='form-category-section'>
								<label className='form-label'>Category</label>
								<div className='category-buttons'>
									{categories.map((cat) => {
										const Icon = cat.icon;
										return (
											<button
												key={cat.id}
												onClick={() => setSelectedCategory(cat.id)}
												className={`category-btn ${
													selectedCategory === cat.id
														? 'category-btn-active'
														: ''
												} ${cat.color}`}
											>
												<Icon />
												<span>{cat.name}</span>
											</button>
										);
									})}
								</div>
							</div>
						</div>

						<div className='form-actions'>
							<button
								onClick={() => setShowAddForm(false)}
								className='form-cancel-btn'
							>
								Cancel
							</button>
							<button
								onClick={handleAddItem}
								disabled={!newItem.trim()}
								className={`form-submit-btn ${
									!newItem.trim() ? 'form-submit-btn-disabled' : ''
								}`}
							>
								<PlusIcon />
								Add Item
							</button>
						</div>
					</div>
				)}

				{itemAdded && (
					<div className='success-message'>
						<CheckIcon />
						<span className='success-text'>Item added successfully!</span>
					</div>
				)}

				<div className='grocery-list-container'>
					{filteredItems.length === 0 ? (
						<div className='empty-state'>
							<BagIcon />
							<h3 className='empty-title'>
								{t('groceryList.emptyMessage', locale) ||
									'Your grocery list is empty'}
							</h3>
							<p className='empty-subtitle'>
								{searchQuery
									? 'No items match your search'
									: 'Start by adding some items'}
							</p>
							<button
								onClick={() => setShowAddForm(true)}
								className='add-first-btn'
							>
								<PlusIcon />
								Add Your First Item
							</button>
						</div>
					) : (
						<ul className='grocery-list'>
							{filteredItems.map((item) => {
								const categoryConfig =
									categories.find((c) => c.id === item.category) ||
									categories[categories.length - 1];
								const Icon = categoryConfig.icon;

								return (
									<li key={item._key} className='grocery-item'>
										<div className='item-content'>
											<div className='item-main'>
												<button
													onClick={() => toggleComplete(item._key)}
													className={`item-checkbox ${
														item.completed ? 'item-checkbox-completed' : ''
													}`}
												>
													{item.completed ? <CheckIcon /> : <CircleIcon />}
												</button>

												<div className='item-details'>
													<div className='item-meta'>
														<span
															className={`item-category ${categoryConfig.color}`}
														>
															<Icon />
															{categoryConfig.name}
														</span>
														{item.quantity > 0 && (
															<span className='item-quantity'>
																{item.quantity} {item.unit || ''}
															</span>
														)}
													</div>
													<div
														className={`item-name ${
															item.completed ? 'item-name-completed' : ''
														}`}
													>
														{capitalizeImportant(item.name)}
													</div>
													{item.recipeTitle && (
														<div className='item-recipe'>
															From: {item.recipeTitle}
														</div>
													)}
												</div>

												<div className='item-actions'>
													{item.completed && (
														<span className='item-status'>Done</span>
													)}
													<button
														onClick={() => handleDeleteItem(item._key)}
														className='item-delete-btn'
														title='Delete item'
													>
														<TrashIcon />
													</button>
												</div>
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>

				<div className='footer-actions'>
					<div className='action-buttons'>
						<button
							onClick={() => setShowAddForm(!showAddForm)}
							className='add-item-btn'
						>
							<PlusIcon />
							{showAddForm ? 'Hide Form' : 'Add New Item'}
						</button>
						<button onClick={handleExportList} className='export-btn'>
							<DownloadIcon />
							Export List
						</button>
					</div>

					{stats.total > 0 && (
						<div className='item-count'>
							Showing {filteredItems.length} of {stats.total} items
						</div>
					)}
				</div>

				<div className='tips-section'>
					<h3 className='tips-title'>Shopping Tips</h3>
					<div className='tips-grid'>
						<div className='tip-card'>
							<ClockIcon />
							<h4 className='tip-heading'>Shop by Category</h4>
							<p className='tip-text'>
								Group similar items to save time in-store
							</p>
						</div>
						<div className='tip-card'>
							<StarIcon />
							<h4 className='tip-heading'>Check Expiry Dates</h4>
							<p className='tip-text'>Always check dates on perishable items</p>
						</div>
						<div className='tip-card'>
							<AlertIcon />
							<h4 className='tip-heading'>Bring Reusable Bags</h4>
							<p className='tip-text'>
								Remember to bring your eco-friendly bags
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Styles */}
			<style jsx>{`
				.grocery-page {
					min-height: 100vh;
					background: var(--color-light);
					opacity: 0.95;
					padding: var(--spacing-medium);
					border-radius: var(--border-radius);
					margin: 4px;
				}

				@media (min-width: 768px) {
					.grocery-page {
						padding: var(--spacing-large);
					}
				}

				.grocery-container {
					max-width: 1200px;
					margin: 0 auto;
				}

				.grocery-header {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					align-items: flex-start;
					margin-bottom: var(--spacing-large);
					gap: var(--spacing-medium);
				}

				@media (min-width: 768px) {
					.grocery-header {
						flex-direction: row;
						align-items: center;
					}
				}

				.header-title {
					display: flex;
					align-items: center;
					gap: 12px;
					margin-bottom: var(--spacing-small);
				}

				.page-title {
					font-size: 2.2rem;
					font-weight: bold;
					color: var(--color-primary);
					margin: 0;
					font-family: var(--font-heading);
				}

				.page-subtitle {
					color: var(--color-dark);
					margin: 0;
					font-size: 1rem;
					opacity: 0.8;
				}

				.all-done-badge {
					display: flex;
					align-items: center;
					gap: 4px;
					background-color: var(--color-accent);
					color: var(--color-dark);
					padding: 6px 12px;
					border-radius: 9999px;
					font-size: 14px;
				}

				.sparkle-icon {
					height: 16px;
					width: 16px;
				}

				.all-done-text {
					font-weight: 600;
				}

				.stats-container {
					display: flex;
					gap: var(--spacing-medium);
				}

				.stat-box {
					text-align: center;
					padding: var(--spacing-small) var(--spacing-medium);
					background-color: var(--color-light);
					border-radius: 12px;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
					min-width: 80px;
					border: 2px solid var(--color-primary);
				}

				.stat-number {
					font-size: 1.5rem;
					font-weight: bold;
					color: var(--color-primary);
				}

				.stat-number-active {
					color: var(--color-accent);
				}

				.stat-number-completed {
					color: var(--color-secondary);
				}

				.stat-label {
					font-size: 0.875rem;
					color: var(--color-dark);
					opacity: 0.7;
				}

				.progress-section {
					margin-bottom: var(--spacing-large);
				}

				.progress-labels {
					display: flex;
					justify-content: space-between;
					font-size: 0.875rem;
					color: var(--color-dark);
					margin-bottom: var(--spacing-small);
				}

				.progress-bar-bg {
					height: 8px;
					background-color: var(--color-light);
					border-radius: 4px;
					overflow: hidden;
					border: 1px solid var(--color-primary);
				}

				.progress-bar-fill {
					height: 100%;
					background: linear-gradient(
						to right,
						var(--color-primary),
						var(--color-accent)
					);
					transition: width 0.5s ease;
				}

				.controls-container {
					display: flex;
					flex-direction: column;
					gap: var(--spacing-medium);
					margin-bottom: var(--spacing-large);
				}

				@media (min-width: 640px) {
					.controls-container {
						flex-direction: row;
					}
				}

				.search-wrapper {
					flex: 1;
					position: relative;
				}

				.search-icon {
					position: absolute;
					left: 12px;
					top: 50%;
					transform: translateY(-50%);
					height: 20px;
					width: 20px;
					color: var(--color-secondary);
				}

				.search-input {
					width: 100%;
					padding: 12px 16px 12px 40px;
					background-color: var(--color-light);
					border-radius: var(--border-radius);
					border: 2px solid var(--color-secondary);
					outline: none;
					font-size: 1rem;
					box-sizing: border-box;
					font-family: var(--font-body);
				}

				.search-input:focus {
					border-color: var(--color-accent);
					box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
				}

				.clear-search-btn {
					position: absolute;
					right: 12px;
					top: 50%;
					transform: translateY(-50%);
					background: none;
					border: none;
					cursor: pointer;
					padding: 4px;
				}

				.clear-icon {
					height: 20px;
					width: 20px;
					color: var(--color-secondary);
				}

				.clear-icon:hover {
					color: var(--color-primary);
				}

				.filter-buttons {
					display: flex;
					gap: var(--spacing-small);
				}

				.filter-btn {
					padding: 12px 16px;
					border-radius: var(--border-radius);
					border: 2px solid var(--color-secondary);
					background-color: var(--color-light);
					color: var(--color-dark);
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
					transition: all 0.2s ease;
					font-size: 0.875rem;
					font-family: var(--font-body);
				}

				.filter-btn:hover {
					background-color: var(--color-accent);
					color: var(--color-dark);
				}

				.filter-btn-active {
					background-color: var(--color-primary);
					color: var(--color-light);
					border-color: var(--color-primary);
				}

				.filter-btn-active.active {
					background-color: var(--color-accent);
					color: var(--color-dark);
					border-color: var(--color-accent);
				}

				.filter-btn-active.completed {
					background-color: var(--color-secondary);
					color: var(--color-light);
					border-color: var(--color-secondary);
				}

				.filter-icon {
					height: 16px;
					width: 16px;
				}

				.filter-text {
					display: none;
				}

				@media (min-width: 640px) {
					.filter-text {
						display: inline;
					}
				}

				.add-item-form {
					background-color: var(--color-light);
					border-radius: var(--border-radius);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
					padding: var(--spacing-large);
					margin-bottom: var(--spacing-large);
					border: 2px solid var(--color-primary);
				}

				.form-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: var(--spacing-medium);
				}

				@media (min-width: 768px) {
					.form-grid {
						grid-template-columns: 1fr 1fr;
					}
				}

				.form-label {
					display: block;
					font-size: 0.875rem;
					font-weight: 600;
					color: var(--color-primary);
					margin-bottom: var(--spacing-small);
					font-family: var(--font-heading);
				}

				.form-input {
					width: 100%;
					padding: var(--spacing-medium);
					font-family: var(--font-body);
					font-size: 1rem;
					color: var(--color-dark);
					background-color: var(--color-light);
					border: 2px solid var(--color-secondary);
					border-radius: var(--border-radius);
					margin-bottom: var(--spacing-medium);
					transition: border-color 0.3s ease, box-shadow 0.3s ease;
					box-sizing: border-box;
				}

				.form-input:focus {
					border-color: var(--color-accent);
					box-shadow: 0 0 6px var(--color-accent);
					outline: none;
				}

				.form-quantity-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: var(--spacing-medium);
				}

				.form-category-section {
					grid-column: 1 / -1;
				}

				.category-buttons {
					display: flex;
					flex-wrap: wrap;
					gap: var(--spacing-small);
				}

				.category-btn {
					padding: var(--spacing-small) var(--spacing-medium);
					border-radius: var(--border-radius);
					border: 2px solid var(--color-secondary);
					background-color: var(--color-light);
					color: var(--color-dark);
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
					transition: all 0.2s ease;
					font-size: 0.875rem;
					font-family: var(--font-body);
				}

				.category-btn:hover {
					background-color: var(--color-accent);
					color: var(--color-dark);
				}

				.category-btn-active {
					outline: 2px solid var(--color-accent);
					outline-offset: 2px;
					border-color: var(--color-primary);
				}

				/* Category Colors */
				.category-produce {
					background-color: rgba(34, 139, 34, 0.1);
					color: #228b22;
					border-color: #228b22;
				}

				.category-dairy {
					background-color: rgba(135, 206, 235, 0.1);
					color: #87ceeb;
					border-color: #87ceeb;
				}

				.category-meat {
					background-color: rgba(205, 92, 92, 0.1);
					color: #cd5c5c;
					border-color: #cd5c5c;
				}

				.category-bakery {
					background-color: rgba(218, 165, 32, 0.1);
					color: #daa520;
					border-color: #daa520;
				}

				.category-pantry {
					background-color: rgba(160, 82, 45, 0.1);
					color: #a0522d;
					border-color: #a0522d;
				}

				.category-beverages {
					background-color: rgba(30, 144, 255, 0.1);
					color: #1e90ff;
					border-color: #1e90ff;
				}

				.category-frozen {
					background-color: rgba(173, 216, 230, 0.1);
					color: #add8e6;
					border-color: #add8e6;
				}

				.category-other {
					background-color: rgba(128, 128, 128, 0.1);
					color: #808080;
					border-color: #808080;
				}

				.form-actions {
					display: flex;
					justify-content: flex-end;
					gap: 12px;
					margin-top: var(--spacing-large);
				}

				.form-cancel-btn {
					padding: 8px 24px;
					color: var(--color-dark);
					background: none;
					border: 2px solid var(--color-secondary);
					border-radius: var(--border-radius);
					cursor: pointer;
					font-size: 1rem;
					font-family: var(--font-body);
				}

				.form-cancel-btn:hover {
					background-color: var(--color-accent);
				}

				.form-submit-btn {
					padding: 8px 24px;
					border-radius: var(--border-radius);
					border: none;
					background-color: var(--color-primary);
					color: var(--color-light);
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
					font-size: 1rem;
					transition: all 0.2s ease;
					font-family: var(--font-body);
				}

				.form-submit-btn:hover {
					background-color: var(--color-accent);
					color: var(--color-dark);
				}

				.form-submit-btn-disabled {
					background-color: var(--color-secondary);
					color: var(--color-light);
					cursor: not-allowed;
				}

				.form-submit-btn-disabled:hover {
					background-color: var(--color-secondary);
					color: var(--color-light);
				}

				.submit-icon {
					height: 16px;
					width: 16px;
				}

				.success-message {
					margin-bottom: var(--spacing-medium);
					padding: var(--spacing-medium);
					background-color: rgba(34, 139, 34, 0.1);
					border: 2px solid #228b22;
					border-radius: var(--border-radius);
					display: flex;
					align-items: center;
					gap: 12px;
				}

				.success-icon {
					height: 20px;
					width: 20px;
					color: #228b22;
				}

				.success-text {
					color: #228b22;
					font-size: 1rem;
					font-weight: 600;
				}

				.grocery-list-container {
					background-color: var(--color-light);
					border-radius: var(--border-radius);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
					overflow: hidden;
					margin-bottom: var(--spacing-large);
					border: 2px solid var(--color-primary);
				}

				.empty-state {
					text-align: center;
					padding: 48px 16px;
				}

				.empty-icon {
					height: 64px;
					width: 64px;
					color: var(--color-secondary);
					margin: 0 auto 16px;
				}

				.empty-title {
					font-size: 1.25rem;
					font-weight: 600;
					color: var(--color-primary);
					margin-bottom: var(--spacing-small);
					font-family: var(--font-heading);
				}

				.empty-subtitle {
					color: var(--color-dark);
					margin-bottom: var(--spacing-large);
					font-size: 1rem;
					opacity: 0.8;
				}

				.add-first-btn {
					padding: 12px 24px;
					border-radius: var(--border-radius);
					border: none;
					background-color: var(--color-primary);
					color: var(--color-light);
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
					font-size: 1rem;
					margin: 0 auto;
					transition: all 0.2s ease;
					font-family: var(--font-body);
				}

				.add-first-btn:hover {
					background-color: var(--color-accent);
					color: var(--color-dark);
				}

				.add-first-icon {
					height: 20px;
					width: 20px;
				}

				.grocery-list {
					list-style: none;
					padding: 0;
					margin: 0;
				}

				.grocery-item {
					border-bottom: 2px solid var(--color-secondary);
				}

				.grocery-item:hover {
					background-color: rgba(255, 215, 0, 0.1);
				}

				.grocery-item:last-child {
					border-bottom: none;
				}

				.item-content {
					padding: var(--spacing-medium) var(--spacing-large);
				}

				.item-main {
					display: flex;
					align-items: center;
					gap: var(--spacing-medium);
				}

				.item-main:hover button:hover {
					color: var(--color-dark);
					border: 2px solid var(--color-dark);
				}

				.item-checkbox {
					padding: 8px;
					border-radius: 50%;
					border: 2px solid var(--color-secondary);
					background-color: var(--color-light);
					color: var(--color-secondary);
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all 0.2s ease;
					min-width: 36px;
					min-height: 36px;
				}

				.item-checkbox:hover {
					background-color: var(--color-header);
					border-color: var(--color-header);
					color: var(--color-dark);
				}

				.item-checkbox-completed {
					background-color: var(--color-header);
					border-color: var(--color-accent);
					color: var(--color-dark);
				}

				.checkbox-icon {
					height: 20px;
					width: 20px;
				}

				.item-details {
					flex: 1;
					min-width: 0;
				}

				.item-meta {
					display: flex;
					align-items: center;
					gap: 12px;
					margin-bottom: 4px;
					flex-wrap: wrap;
				}

				.item-category {
					padding: 4px 12px;
					border-radius: 9999px;
					font-size: 0.75rem;
					font-weight: 600;
					display: inline-flex;
					align-items: center;
					gap: 4px;
					font-family: var(--font-body);
				}

				.category-icon-small {
					height: 12px;
					width: 12px;
				}

				.item-quantity {
					font-size: 0.875rem;
					font-weight: 600;
					color: var(--color-primary);
				}

				.item-name {
					font-size: 1rem;
					font-weight: 500;
					color: var(--color-dark);
					margin: 4px 0;
					font-family: var(--font-body);
				}

				.item-name-completed {
					text-decoration: line-through;
					color: var(--color-secondary);
					opacity: 0.7;
				}

				.item-recipe {
					font-size: 0.875rem;
					color: var(--color-secondary);
					margin-top: 4px;
					font-style: italic;
				}

				.item-actions {
					display: flex;
					align-items: center;
					gap: 8px;
				}

				.item-status {
					font-size: 0.75rem;
					color: var(--color-primary);
					font-weight: 600;
					padding: 4px 8px;
					background-color: rgba(255, 215, 0, 0.2);
					border-radius: 4px;
					border: 1px solid var(--color-primary);
				}

				.item-delete-btn {
					padding: 8px;
					color: var(--color-secondary);
					background: none;
					border: 2px solid var(--color-secondary);
					border-radius: var(--border-radius);
					cursor: pointer;
					transition: all 0.2s ease;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.item-delete-btn:hover {
					color: var(--color-primary);
					background-color: rgba(255, 99, 71, 0.1);
					border-color: var(--color-primary);
				}

				.delete-icon {
					height: 16px;
					width: 16px;
				}

				.footer-actions {
					margin-top: var(--spacing-large);
					display: flex;
					flex-wrap: wrap;
					gap: var(--spacing-medium);
					justify-content: space-between;
					align-items: center;
				}

				.action-buttons {
					display: flex;
					gap: 12px;
					flex-wrap: wrap;
				}

				.add-item-btn {
					padding: 12px 24px;
					border-radius: var(--border-radius);
					border: none;
					background-color: var(--color-primary);
					opacity: 0.75;
					color: var(--color-light);
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
					font-size: 1rem;
					transition: all 0.2s ease;
					font-family: var(--font-body);
				}

				.add-item-btn:hover {
					background-color: var(--color-primary);
					opacity: 0.95;
					color: var(--color-dark);
				}

				.export-btn {
					padding: 12px 24px;
					border-radius: var(--border-radius);
					border: 2px solid var(--color-primary);
					background-color: var(--color-light);
					color: var(--color-primary);
					display: flex;
					align-items: center;
					gap: 8px;
					cursor: pointer;
					font-size: 1rem;
					transition: all 0.2s ease;
					font-family: var(--font-body);
				}

				.export-btn:hover {
					background-color: var(--color-secondary);
					color: var(--color-dark);
					border-color: var(--color-secondary);
				}

				.action-icon {
					height: 20px;
					width: 20px;
				}

				.item-count {
					font-size: 0.875rem;
					color: var(--color-dark);
					opacity: 0.8;
				}

				.tips-section {
					margin-top: 48px;
					padding: var(--spacing-large);
					background: linear-gradient(
						135deg,
						rgba(255, 99, 71, 0.1),
						rgba(255, 215, 0, 0.1)
					);
					border-radius: var(--border-radius);
					border: 2px solid var(--color-primary);
				}

				.tips-title {
					font-size: 1.125rem;
					font-weight: 600;
					color: var(--color-primary);
					margin-bottom: var(--spacing-medium);
					display: flex;
					align-items: center;
					gap: 8px;
					font-family: var(--font-heading);
				}

				.tips-icon {
					height: 20px;
					width: 20px;
					color: var(--color-primary);
				}

				.tips-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: var(--spacing-medium);
				}

				@media (min-width: 768px) {
					.tips-grid {
						grid-template-columns: repeat(3, 1fr);
					}
				}

				.tip-card {
					background-color: var(--color-light);
					padding: var(--spacing-medium);
					border-radius: var(--border-radius);
					border: 2px solid var(--color-secondary);
				}

				.tip-icon {
					height: 24px;
					width: 24px;
					margin-bottom: 8px;
				}

				.tip-icon.clock {
					color: var(--color-primary);
				}

				.tip-icon.star {
					color: var(--color-accent);
				}

				.tip-icon.alert {
					color: var(--color-secondary);
				}

				.tip-heading {
					font-size: 1rem;
					font-weight: 500;
					color: var(--color-primary);
					margin-bottom: 4px;
					font-family: var(--font-heading);
				}

				.tip-text {
					font-size: 0.875rem;
					color: var(--color-dark);
					margin: 0;
					opacity: 0.8;
				}

				.error-message {
					padding: var(--spacing-large);
					text-align: center;
					color: #ef4444;
					background-color: #fef2f2;
					border-radius: var(--border-radius);
					margin: var(--spacing-large);
					font-size: 1rem;
					border: 2px solid #ef4444;
				}
			`}</style>
		</div>
	);
};
