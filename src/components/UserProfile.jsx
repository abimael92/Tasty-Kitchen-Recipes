import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';

export default function UserProfile({ locale }) {
	const auth = useAuth();
	console.log('UserProfile useAuth:', auth);

	// Destructure loading, user, login, logout from auth safely
	const loading = auth?.loading === undefined ? false : auth.loading;

	const user = auth?.user ?? null;
	const login = auth?.login ?? (() => {});
	const logout = auth?.logout ?? (() => {});

	const [error, setError] = useState('');

	const [showMealSchedule, setShowMealSchedule] = useState(false);
	const [showPantry, setShowPantry] = useState(false);
	const [showMarketList, setShowMarketList] = useState(false);

	// Dummy placeholders for lists
	const [pantryItems, setPantryItems] = useState(['Flour', 'Sugar', 'Salt']);
	const [marketItems, setMarketItems] = useState([
		'Tomatoes',
		'Chicken',
		'Milk',
	]);

	// Local loading state for data fetch
	const [localLoading, setLocalLoading] = useState(true);

	useEffect(() => {
		console.log('Auth user updated:', user);
	}, [user]);

	useEffect(() => {
		const abortController = new AbortController();
		let redirectTimeout;

		async function loadUser() {
			try {
				const stored = localStorage.getItem('userData');
				if (!stored) {
					redirectTimeout = setTimeout(() => {
						window.location.href = '/';
					}, 1000);
					return;
				}

				const parsed = JSON.parse(stored);
				const { uid, token } = parsed;

				const res = await fetch(`/api/getUserProfile?uid=${uid}`, {
					headers: { Authorization: `Bearer ${token}` },
					signal: abortController.signal,
				});

				if (!res.ok) {
					const text = await res.text();
					throw new Error(`Fetch failed: ${res.status} ${text}`);
				}

				const data = await res.json();
				console.log('Fetched profile data:', data); // Add this line
				login(data);
				console.log('User in context after login:', auth.user); // Also check context user right after

				setError('');
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error(err);
					setError(err.message || 'Failed to load profile');
					redirectTimeout = setTimeout(() => {
						window.location.href = '/';
					}, 1500);
				}
			} finally {
				setLocalLoading(false);
			}
		}

		loadUser();

		return () => {
			abortController.abort();
			clearTimeout(redirectTimeout);
		};
	}, []);

	if (loading || localLoading) {
		return (
			<div className='loading-spinner'>
				{t('auth.loading', locale) || 'Loading...'}
			</div>
		);
	}

	if (error) return <p style={{ color: 'red' }}>{error}</p>;
	if (!user)
		return (
			<p style={{ padding: '2rem', textAlign: 'center' }}>
				{t('auth.noUser', locale) || 'No user info available.'}
			</p>
		);

	const handleAddPantryItem = () => {
		const item = prompt('Add Pantry Item');
		if (item) setPantryItems([...pantryItems, item]);
	};
	const handleAddMarketItem = () => {
		const item = prompt('Add Market Item');
		if (item) setMarketItems([...marketItems, item]);
	};

	console.log('Current user from auth:', user);

	return (
		<div
			style={{
				maxWidth: 900,
				margin: '2rem auto',
				fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
				color: '#222',
				padding: '1rem',
			}}
		>
			<h1
				style={{
					fontSize: '2.5rem',
					marginBottom: '1rem',
					textAlign: 'center',
				}}
			>
				{t('profile.title', locale) || 'Your Profile'}
			</h1>

			{/* User Info Card */}
			<section
				style={{
					background: '#f9f9f9',
					padding: '1.5rem',
					borderRadius: '12px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					marginBottom: '2rem',
				}}
			>
				<h2
					style={{
						borderBottom: '2px solid #eee',
						paddingBottom: '0.5rem',
						marginBottom: '1rem',
					}}
				>
					User Information
				</h2>
				<dl
					style={{
						display: 'grid',
						gridTemplateColumns: 'max-content 1fr',
						gap: '0.5rem 1rem',
						fontSize: '1.1rem',
					}}
				>
					<dt>Name:</dt>
					<dd>
						{user.name || ''} {user.lastname || ''}
					</dd>

					<dt>Email:</dt>
					<dd>{user.email}</dd>

					<dt>Role:</dt>
					<dd>{user.role || '-'}</dd>

					<dt>Bio:</dt>
					<dd style={{ fontStyle: 'italic' }}>{user.bio || 'No bio set.'}</dd>

					<dt>Phone:</dt>
					<dd>{user.phone || '-'}</dd>

					<dt>Location:</dt>
					<dd>{user.location || '-'}</dd>

					<dt>Diet Preference:</dt>
					<dd>{user.dietPreference || '-'}</dd>

					<dt>Allergies:</dt>
					<dd>
						{user.allergies && user.allergies.length > 0
							? user.allergies.join(', ')
							: '-'}
					</dd>

					<dt>Preferred Cuisines:</dt>
					<dd>
						{user.preferredCuisine && user.preferredCuisine.length > 0
							? user.preferredCuisine.join(', ')
							: '-'}
					</dd>
				</dl>
			</section>

			{/* Recipes Section */}
			<section
				style={{
					background: '#fff',
					padding: '1.5rem',
					borderRadius: '12px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					marginBottom: '2rem',
				}}
			>
				<h2
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<span>Saved Recipes</span>
					<button
						style={{
							background: 'var(--color-primary, #007bff)',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							padding: '0.3rem 0.8rem',
							cursor: 'pointer',
							fontWeight: '600',
						}}
						onClick={() => alert('Feature coming soon!')}
					>
						+ Add Recipe
					</button>
				</h2>
				<p style={{ fontStyle: 'italic', color: '#666' }}>
					You have no saved recipes yet.
				</p>
			</section>

			{/* Meal Schedule */}
			<section
				style={{
					background: '#f9f9f9',
					padding: '1.5rem',
					borderRadius: '12px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					marginBottom: '2rem',
				}}
			>
				<h2
					style={{ cursor: 'pointer' }}
					onClick={() => setShowMealSchedule(!showMealSchedule)}
				>
					Meal Schedule {showMealSchedule ? '▲' : '▼'}
				</h2>
				{showMealSchedule && (
					<div style={{ marginTop: '1rem', fontSize: '1.1rem', color: '#444' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr style={{ backgroundColor: '#ddd' }}>
									<th>Day</th>
									<th>Breakfast</th>
									<th>Lunch</th>
									<th>Dinner</th>
								</tr>
							</thead>
							<tbody>
								{[
									'Monday',
									'Tuesday',
									'Wednesday',
									'Thursday',
									'Friday',
									'Saturday',
									'Sunday',
								].map((day) => (
									<tr key={day} style={{ borderBottom: '1px solid #ccc' }}>
										<td style={{ fontWeight: '600', padding: '0.5rem' }}>
											{day}
										</td>
										<td
											contentEditable
											style={{
												padding: '0.5rem',
												backgroundColor: '#fff',
												cursor: 'text',
											}}
										></td>
										<td
											contentEditable
											style={{
												padding: '0.5rem',
												backgroundColor: '#fff',
												cursor: 'text',
											}}
										></td>
										<td
											contentEditable
											style={{
												padding: '0.5rem',
												backgroundColor: '#fff',
												cursor: 'text',
											}}
										></td>
									</tr>
								))}
							</tbody>
						</table>
						<small style={{ fontStyle: 'italic', color: '#666' }}>
							Click a meal cell to add your planned meal.
						</small>
					</div>
				)}
			</section>

			{/* Pantry Section */}
			<section
				style={{
					background: '#fff',
					padding: '1.5rem',
					borderRadius: '12px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
					marginBottom: '2rem',
				}}
			>
				<h2
					style={{ cursor: 'pointer' }}
					onClick={() => setShowPantry(!showPantry)}
				>
					Pantry Items {showPantry ? '▲' : '▼'}
				</h2>
				{showPantry && (
					<>
						<ul
							style={{ listStyle: 'none', paddingLeft: 0, marginTop: '1rem' }}
						>
							{pantryItems.map((item, i) => (
								<li
									key={i}
									style={{
										background: '#e2f0d9',
										marginBottom: '0.4rem',
										padding: '0.4rem 0.8rem',
										borderRadius: '6px',
										display: 'inline-block',
										fontWeight: '600',
										color: '#2e7d32',
										cursor: 'default',
									}}
								>
									{item}
								</li>
							))}
						</ul>
						<button
							onClick={handleAddPantryItem}
							style={{
								marginTop: '1rem',
								background: 'var(--color-primary, #007bff)',
								color: 'white',
								border: 'none',
								borderRadius: '6px',
								padding: '0.3rem 0.8rem',
								cursor: 'pointer',
								fontWeight: '600',
							}}
						>
							+ Add Pantry Item
						</button>
					</>
				)}
			</section>

			{/* Market List Section */}
			<section
				style={{
					background: '#f9f9f9',
					padding: '1.5rem',
					borderRadius: '12px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				}}
			>
				<h2
					style={{ cursor: 'pointer' }}
					onClick={() => setShowMarketList(!showMarketList)}
				>
					Market Shopping List {showMarketList ? '▲' : '▼'}
				</h2>
				{showMarketList && (
					<>
						<ul
							style={{ listStyle: 'none', paddingLeft: 0, marginTop: '1rem' }}
						>
							{marketItems.map((item, i) => (
								<li
									key={i}
									style={{
										background: '#ffecb3',
										marginBottom: '0.4rem',
										padding: '0.4rem 0.8rem',
										borderRadius: '6px',
										display: 'inline-block',
										fontWeight: '600',
										color: '#f57f17',
										cursor: 'default',
									}}
								>
									{item}
								</li>
							))}
						</ul>
						<button
							onClick={handleAddMarketItem}
							style={{
								marginTop: '1rem',
								background: 'var(--color-primary, #007bff)',
								color: 'white',
								border: 'none',
								borderRadius: '6px',
								padding: '0.3rem 0.8rem',
								cursor: 'pointer',
								fontWeight: '600',
							}}
						>
							+ Add Market Item
						</button>
					</>
				)}
			</section>
		</div>
	);
}
