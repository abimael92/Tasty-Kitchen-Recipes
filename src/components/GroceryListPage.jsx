import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingIndicator from './LoadingIndicator.jsx';
import { deduplicateGroceryItems } from '../utils/deduplicateGroceryItems.ts';
import { t } from '../utils/i18n';

console.log('GroceryListPage: Component loaded');

// SVG Icon Components (same as before)
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

// Category icons
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
	console.log('GroceryListPage: Component initialized for locale', locale);

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

	// Categories with SVG icons
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
		console.log('Stats updated:', { total, completed, active });
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

			console.log('Fetched grocery list:', deduplicatedItems.length, 'items');
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
		const first = words[0].toLowerCase();
		const rest = ignore.includes(first) ? words.slice(1) : words;

		if (rest.length === 0) return '';

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
				{/* Header Section */}
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

				{/* Progress Section */}
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

				{/* Controls Section */}
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

				{/* Add Item Form */}
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
								<PlusIcon /> Add Item
							</button>
						</div>
					</div>
				)}

				{/* Success Message */}
				{itemAdded && (
					<div className='success-message'>
						<CheckIcon />
						<span className='success-text'>Item added successfully!</span>
					</div>
				)}

				{/* Grocery List */}
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
								<PlusIcon /> Add Your First Item
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

				{/* Footer Actions */}
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
							<DownloadIcon /> Export List
						</button>
					</div>

					{stats.total > 0 && (
						<div className='item-count'>
							Showing {filteredItems.length} of {stats.total} items
						</div>
					)}
				</div>

				{/* Tips Section */}
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

			{/* Enhanced Styles */}
			<style jsx>{`
				/* Section: Grocery Page Base */
				.grocery-page {
					min-height: 100vh;
					background: var(--color-background);
					padding: var(--space-lg);
					border-radius: var(--radius-xl);
					margin: var(--space-sm);
					position: relative;
					overflow: hidden;
				}

				.grocery-page::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					height: 4px;
					background: linear-gradient(
						90deg,
						var(--color-primary),
						var(--color-svg-fresh)
					);
					z-index: 1;
				}

				@media (min-width: 768px) {
					.grocery-page {
						padding: var(--space-xl);
						margin: var(--space-md);
					}
				}

				/* Section: Container */
				.grocery-container {
					max-width: 1200px;
					margin: 0 auto;
					position: relative;
					z-index: 2;
				}

				/* Section: Header */
				.grocery-header {
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					align-items: flex-start;
					margin-bottom: var(--space-xl);
					gap: var(--space-lg);
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-lg);
					padding: var(--space-lg);
					box-shadow: var(--glass-shadow);
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
					gap: var(--space-md);
					margin-bottom: var(--space-sm);
				}

				.page-title {
					font-size: var(--text-2xl);
					font-weight: 800;
					color: var(--color-primary);
					margin: 0;
					font-family: var(--font-heading);
					background: linear-gradient(
						135deg,
						var(--color-primary),
						var(--color-svg-accent)
					);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.page-subtitle {
					color: var(--color-text-light);
					margin: 0;
					font-size: var(--text-sm);
					opacity: 0.9;
				}

				/* Section: Stats */
				.stats-container {
					display: flex;
					gap: var(--space-md);
				}

				.stat-box {
					text-align: center;
					padding: var(--space-md);
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-lg);
					min-width: 90px;
					box-shadow: var(--shadow-sm);
					transition: all var(--transition-medium);
				}

				.stat-box:hover {
					transform: translateY(-2px);
					box-shadow: var(--shadow-md);
					border-color: var(--color-primary);
				}

				.stat-number {
					font-size: var(--text-2xl);
					font-weight: 800;
					color: var(--color-primary);
					line-height: 1;
				}

				.stat-number-active {
					color: var(--color-svg-fresh);
				}

				.stat-number-completed {
					color: var(--color-success);
				}

				.stat-label {
					font-size: var(--text-xs);
					color: var(--color-text-light);
					margin-top: var(--space-2xs);
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}

				/* Section: Progress */
				.progress-section {
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-lg);
					padding: var(--space-lg);
					margin-bottom: var(--space-xl);
					box-shadow: var(--glass-shadow);
				}

				.progress-labels {
					display: flex;
					justify-content: space-between;
					font-size: var(--text-sm);
					color: var(--color-text);
					margin-bottom: var(--space-sm);
					font-weight: 600;
				}

				.progress-bar-bg {
					height: 10px;
					background: color-mix(
						in srgb,
						var(--color-background) 80%,
						transparent
					);
					border-radius: var(--radius-full);
					overflow: hidden;
					border: 1px solid var(--glass-border);
				}

				.progress-bar-fill {
					height: 100%;
					background: linear-gradient(
						90deg,
						var(--color-primary),
						var(--color-svg-fresh)
					);
					border-radius: var(--radius-full);
					transition: width var(--transition-slow) var(--animation-timing);
				}

				/* Section: Controls */
				.controls-container {
					display: flex;
					flex-direction: column;
					gap: var(--space-lg);
					margin-bottom: var(--space-xl);
				}

				@media (min-width: 640px) {
					.controls-container {
						flex-direction: row;
						align-items: center;
					}
				}

				.search-wrapper {
					flex: 1;
					position: relative;
				}

				.search-wrapper svg {
					position: absolute;
					left: var(--space-md);
					top: 50%;
					transform: translateY(-50%);
					color: var(--color-text-light);
					pointer-events: none;
				}

				.search-input {
					width: 100%;
					padding: var(--space-sm) var(--space-md) var(--space-sm)
						calc(var(--space-md) * 2 + 20px);
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-full);
					font-size: var(--text-base);
					color: var(--color-text);
					transition: all var(--transition-fast);
					font-family: var(--font-body);
				}

				.search-input:focus {
					background: var(--color-surface);
					border-color: var(--color-primary);
					box-shadow: 0 0 0 3px var(--color-focus);
					outline: none;
				}

				.clear-search-btn {
					position: absolute;
					right: var(--space-md);
					top: 50%;
					transform: translateY(-50%);
					background: none;
					border: none;
					color: var(--color-text-light);
					cursor: pointer;
					padding: var(--space-2xs);
					border-radius: var(--radius-full);
					transition: all var(--transition-fast);
				}

				.clear-search-btn:hover {
					color: var(--color-primary);
					background: var(--color-hover);
				}

				/* Section: Filter Buttons */
				.filter-buttons {
					display: flex;
					gap: var(--space-sm);
				}

				.filter-btn {
					padding: var(--space-sm) var(--space-md);
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-lg);
					color: var(--color-text);
					display: flex;
					align-items: center;
					gap: var(--space-xs);
					cursor: pointer;
					transition: all var(--transition-fast);
					font-size: var(--text-sm);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.filter-btn:hover {
					background: var(--color-hover);
					transform: translateY(-1px);
				}

				.filter-btn-active {
					background: var(--color-primary);
					color: white;
					border-color: var(--color-primary);
				}

				.filter-btn-active.active {
					background: var(--color-svg-fresh);
					border-color: var(--color-svg-fresh);
				}

				.filter-btn-active.completed {
					background: var(--color-success);
					border-color: var(--color-success);
				}

				.filter-text {
					display: none;
				}

				@media (min-width: 640px) {
					.filter-text {
						display: inline;
					}
				}

				/* Section: Add Item Form */
				.add-item-form {
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-xl);
					padding: var(--space-xl);
					margin-bottom: var(--space-xl);
					box-shadow: var(--glass-shadow);
					animation: fadeIn 0.4s var(--animation-timing);
				}

				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.form-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: var(--space-lg);
				}

				@media (min-width: 768px) {
					.form-grid {
						grid-template-columns: 1fr 1fr;
					}
				}

				.form-label {
					display: block;
					font-size: var(--text-sm);
					font-weight: 600;
					color: var(--color-primary);
					margin-bottom: var(--space-xs);
					font-family: var(--font-heading);
				}

				.form-input {
					width: 100%;
					padding: var(--space-sm) var(--space-md);
					background: var(--color-surface);
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-md);
					font-size: var(--text-base);
					color: var(--color-text);
					transition: all var(--transition-fast);
					font-family: var(--font-body);
				}

				.form-input:focus {
					border-color: var(--color-primary);
					box-shadow: 0 0 0 3px var(--color-focus);
					outline: none;
					background: white;
				}

				.form-quantity-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: var(--space-md);
				}

				.form-category-section {
					grid-column: 1 / -1;
				}

				/* Section: Category Buttons */
				.category-buttons {
					display: flex;
					flex-wrap: wrap;
					gap: var(--space-sm);
				}

				.category-btn {
					padding: var(--space-xs) var(--space-md);
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-full);
					color: var(--color-text);
					display: flex;
					align-items: center;
					gap: var(--space-xs);
					cursor: pointer;
					transition: all var(--transition-fast);
					font-size: var(--text-xs);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.category-btn:hover {
					transform: translateY(-2px);
					box-shadow: var(--shadow-sm);
				}

				.category-btn-active {
					background: var(--color-primary);
					color: white;
					border-color: var(--color-primary);
				}

				/* Category Colors using SVG theme */
				.category-produce {
					background: color-mix(
						in srgb,
						var(--color-svg-fresh) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-fresh) 40%,
						transparent
					);
					color: var(--color-svg-fresh);
				}

				.category-dairy {
					background: color-mix(
						in srgb,
						var(--color-svg-cream) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-cream) 40%,
						transparent
					);
					color: var(--color-svg-cream);
				}

				.category-meat {
					background: color-mix(
						in srgb,
						var(--color-svg-warm) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-warm) 40%,
						transparent
					);
					color: var(--color-svg-warm);
				}

				.category-bakery {
					background: color-mix(
						in srgb,
						var(--color-svg-gold) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-gold) 40%,
						transparent
					);
					color: var(--color-svg-gold);
				}

				.category-pantry {
					background: color-mix(
						in srgb,
						var(--color-svg-secondary) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-secondary) 40%,
						transparent
					);
					color: var(--color-svg-secondary);
				}

				.category-beverages {
					background: color-mix(
						in srgb,
						var(--color-svg-accent) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-accent) 40%,
						transparent
					);
					color: var(--color-svg-accent);
				}

				.category-frozen {
					background: color-mix(
						in srgb,
						var(--color-svg-light) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-svg-light) 40%,
						transparent
					);
					color: var(--color-svg-light);
				}

				.category-other {
					background: color-mix(
						in srgb,
						var(--color-text-light) 15%,
						transparent
					);
					border-color: color-mix(
						in srgb,
						var(--color-text-light) 40%,
						transparent
					);
					color: var(--color-text-light);
				}

				/* Section: Form Actions */
				.form-actions {
					display: flex;
					justify-content: flex-end;
					gap: var(--space-md);
					margin-top: var(--space-xl);
				}

				.form-cancel-btn {
					padding: var(--space-sm) var(--space-lg);
					background: none;
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-lg);
					color: var(--color-text);
					cursor: pointer;
					transition: all var(--transition-fast);
					font-size: var(--text-sm);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.form-cancel-btn:hover {
					background: var(--color-hover);
					border-color: var(--color-text-light);
				}

				.form-submit-btn {
					padding: var(--space-sm) var(--space-lg);
					background: linear-gradient(
						135deg,
						var(--color-primary),
						var(--color-svg-accent)
					);
					border: none;
					border-radius: var(--radius-lg);
					color: white;
					display: flex;
					align-items: center;
					gap: var(--space-xs);
					cursor: pointer;
					transition: all var(--transition-medium);
					font-size: var(--text-sm);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.form-submit-btn:hover:not(:disabled) {
					transform: translateY(-2px);
					box-shadow: var(--shadow-lg);
					background: linear-gradient(
						135deg,
						var(--color-svg-accent),
						var(--color-primary)
					);
				}

				.form-submit-btn-disabled {
					background: var(--color-text-light);
					cursor: not-allowed;
					opacity: 0.6;
				}

				/* Section: Success Message */
				.success-message {
					padding: var(--space-md);
					background: color-mix(in srgb, var(--color-success) 15%, transparent);
					border: 2px solid var(--color-success);
					border-radius: var(--radius-lg);
					display: flex;
					align-items: center;
					gap: var(--space-sm);
					margin-bottom: var(--space-lg);
					animation: fadeIn 0.3s ease;
				}

				.success-text {
					color: var(--color-success);
					font-weight: 600;
					font-size: var(--text-sm);
				}

				/* Section: Grocery List */
				.grocery-list-container {
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-xl);
					overflow: hidden;
					margin-bottom: var(--space-xl);
					box-shadow: var(--glass-shadow);
				}

				.empty-state {
					text-align: center;
					padding: var(--space-3xl) var(--space-lg);
				}

				.empty-title {
					font-size: var(--text-xl);
					font-weight: 700;
					color: var(--color-primary);
					margin: var(--space-md) 0 var(--space-sm);
					font-family: var(--font-heading);
				}

				.empty-subtitle {
					color: var(--color-text-light);
					margin-bottom: var(--space-xl);
					font-size: var(--text-base);
				}

				.add-first-btn {
					padding: var(--space-md) var(--space-xl);
					background: linear-gradient(
						135deg,
						var(--color-primary),
						var(--color-svg-accent)
					);
					border: none;
					border-radius: var(--radius-lg);
					color: white;
					display: inline-flex;
					align-items: center;
					gap: var(--space-sm);
					cursor: pointer;
					transition: all var(--transition-medium);
					font-size: var(--text-base);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.add-first-btn:hover {
					transform: translateY(-2px);
					box-shadow: var(--shadow-lg);
					background: linear-gradient(
						135deg,
						var(--color-svg-accent),
						var(--color-primary)
					);
				}

				/* Section: Grocery Items */
				.grocery-list {
					list-style: none;
					padding: 0;
					margin: 0;
				}

				.grocery-item {
					border-bottom: 1px solid var(--glass-border);
					transition: all var(--transition-fast);
				}

				.grocery-item:last-child {
					border-bottom: none;
				}

				.grocery-item:hover {
					background: var(--color-hover);
				}

				.item-content {
					padding: var(--space-md) var(--space-lg);
				}

				.item-main {
					display: flex;
					align-items: center;
					gap: var(--space-md);
				}

				/* Section: Item Checkbox */
				.item-checkbox {
					padding: var(--space-xs);
					background: var(--color-surface);
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-full);
					color: var(--color-text-light);
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					transition: all var(--transition-fast);
					min-width: 40px;
					min-height: 40px;
					flex-shrink: 0;
				}

				.item-checkbox:hover {
					border-color: var(--color-primary);
					color: var(--color-primary);
					transform: scale(1.1);
				}

				.item-checkbox-completed {
					background: var(--color-success);
					border-color: var(--color-success);
					color: white;
				}

				/* Section: Item Details */
				.item-details {
					flex: 1;
					min-width: 0;
				}

				.item-meta {
					display: flex;
					align-items: center;
					gap: var(--space-sm);
					margin-bottom: var(--space-2xs);
					flex-wrap: wrap;
				}

				.item-category {
					padding: var(--space-2xs) var(--space-sm);
					background: var(--glass-bg);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-full);
					font-size: var(--text-xs);
					font-weight: 600;
					display: inline-flex;
					align-items: center;
					gap: var(--space-2xs);
				}

				.item-quantity {
					font-size: var(--text-sm);
					font-weight: 600;
					color: var(--color-primary);
					padding: var(--space-2xs) var(--space-sm);
					background: var(--glass-bg);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-sm);
				}

				.item-name {
					font-size: var(--text-base);
					font-weight: 500;
					color: var(--color-text);
					margin: var(--space-2xs) 0;
					line-height: 1.4;
				}

				.item-name-completed {
					text-decoration: line-through;
					color: var(--color-text-light);
					opacity: 0.7;
				}

				.item-recipe {
					font-size: var(--text-xs);
					color: var(--color-text-light);
					margin-top: var(--space-2xs);
					font-style: italic;
				}

				/* Section: Item Actions */
				.item-actions {
					display: flex;
					align-items: center;
					gap: var(--space-sm);
				}

				.item-status {
					font-size: var(--text-xs);
					color: var(--color-success);
					font-weight: 600;
					padding: var(--space-2xs) var(--space-sm);
					background: color-mix(in srgb, var(--color-success) 15%, transparent);
					border-radius: var(--radius-sm);
					border: 1px solid var(--color-success);
				}

				.item-delete-btn {
					padding: var(--space-xs);
					background: none;
					border: 2px solid var(--glass-border);
					border-radius: var(--radius-md);
					color: var(--color-text-light);
					cursor: pointer;
					transition: all var(--transition-fast);
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.item-delete-btn:hover {
					color: var(--color-svg-warm);
					border-color: var(--color-svg-warm);
					background: color-mix(
						in srgb,
						var(--color-svg-warm) 10%,
						transparent
					);
					transform: scale(1.1);
				}

				/* Section: Footer Actions */
				.footer-actions {
					display: flex;
					flex-wrap: wrap;
					gap: var(--space-lg);
					justify-content: space-between;
					align-items: center;
					margin-top: var(--space-xl);
				}

				.action-buttons {
					display: flex;
					gap: var(--space-md);
					flex-wrap: wrap;
				}

				.add-item-btn {
					padding: var(--space-md) var(--space-lg);
					background: linear-gradient(
						135deg,
						var(--color-primary),
						var(--color-svg-accent)
					);
					border: none;
					border-radius: var(--radius-lg);
					color: white;
					display: flex;
					align-items: center;
					gap: var(--space-sm);
					cursor: pointer;
					transition: all var(--transition-medium);
					font-size: var(--text-base);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.add-item-btn:hover {
					transform: translateY(-2px);
					box-shadow: var(--shadow-lg);
					background: linear-gradient(
						135deg,
						var(--color-svg-accent),
						var(--color-primary)
					);
				}

				.export-btn {
					padding: var(--space-md) var(--space-lg);
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 2px solid var(--color-primary);
					border-radius: var(--radius-lg);
					color: var(--color-primary);
					display: flex;
					align-items: center;
					gap: var(--space-sm);
					cursor: pointer;
					transition: all var(--transition-medium);
					font-size: var(--text-base);
					font-weight: 600;
					font-family: var(--font-body);
				}

				.export-btn:hover {
					background: var(--color-primary);
					color: white;
					transform: translateY(-2px);
					box-shadow: var(--shadow-lg);
				}

				.item-count {
					font-size: var(--text-sm);
					color: var(--color-text-light);
					font-weight: 500;
				}

				/* Section: Tips */
				.tips-section {
					margin-top: var(--space-3xl);
					padding: var(--space-xl);
					background: linear-gradient(
						135deg,
						color-mix(in srgb, var(--color-primary) 10%, transparent),
						color-mix(in srgb, var(--color-svg-fresh) 10%, transparent)
					);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-xl);
					box-shadow: var(--glass-shadow);
				}

				.tips-title {
					font-size: var(--text-xl);
					font-weight: 700;
					color: var(--color-primary);
					margin-bottom: var(--space-lg);
					font-family: var(--font-heading);
					text-align: center;
				}

				.tips-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: var(--space-lg);
				}

				@media (min-width: 768px) {
					.tips-grid {
						grid-template-columns: repeat(3, 1fr);
					}
				}

				.tip-card {
					background: var(--glass-bg);
					backdrop-filter: var(--backdrop-blur);
					border: 1px solid var(--glass-border);
					border-radius: var(--radius-lg);
					padding: var(--space-lg);
					text-align: center;
					transition: all var(--transition-medium);
				}

				.tip-card:hover {
					transform: translateY(-4px);
					box-shadow: var(--shadow-lg);
					border-color: var(--color-primary);
				}

				.tip-heading {
					font-size: var(--text-base);
					font-weight: 600;
					color: var(--color-primary);
					margin: var(--space-sm) 0 var(--space-xs);
					font-family: var(--font-heading);
				}

				.tip-text {
					font-size: var(--text-sm);
					color: var(--color-text-light);
					margin: 0;
					line-height: 1.5;
				}

				/* Section: Error Message */
				.error-message {
					padding: var(--space-xl);
					text-align: center;
					color: var(--color-svg-warm);
					background: color-mix(
						in srgb,
						var(--color-svg-warm) 10%,
						transparent
					);
					border: 2px solid var(--color-svg-warm);
					border-radius: var(--radius-lg);
					margin: var(--space-xl);
					font-size: var(--text-base);
					font-weight: 600;
				}

				/* Section: Responsive Adjustments */
				@media (max-width: 640px) {
					.grocery-header {
						padding: var(--space-md);
					}

					.stats-container {
						flex-wrap: wrap;
						justify-content: center;
					}

					.stat-box {
						min-width: 70px;
						padding: var(--space-sm);
					}

					.filter-buttons {
						width: 100%;
						justify-content: center;
					}

					.form-actions {
						flex-direction: column;
					}

					.action-buttons {
						width: 100%;
						justify-content: center;
					}

					.footer-actions {
						flex-direction: column;
						text-align: center;
					}
				}

				@media (max-width: 480px) {
					.grocery-page {
						padding: var(--space-md);
						margin: var(--space-2xs);
					}

					.page-title {
						font-size: var(--text-xl);
					}

					.category-buttons {
						justify-content: center;
					}

					.tip-card {
						padding: var(--space-md);
					}
				}

				/* Section: Dark Theme Adjustments */
				[data-theme='dark'] .grocery-page {
					background: color-mix(in srgb, var(--color-background) 95%, black);
				}

				[data-theme='dark'] .search-input,
				[data-theme='dark'] .form-input {
					background: var(--color-surface);
					color: var(--color-text);
				}

				[data-theme='dark'] .category-btn {
					background: color-mix(in srgb, var(--glass-bg) 80%, transparent);
				}

				[data-theme='dark'] .grocery-item:hover {
					background: color-mix(in srgb, var(--color-hover) 50%, transparent);
				}
			`}</style>
		</div>
	);
};
