import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';

export default function UserProfile({ locale }) {
	const auth = useAuth();

	// Add this with your other useState declarations
	const [savedRecipes, setSavedRecipes] = useState([]);
	const [recipesLoading, setRecipesLoading] = useState(false);

	// Destructure loading, user, login, logout from auth safely
	const loading = auth?.loading === undefined ? false : auth.loading;
	const user = auth?.user ?? null;
	const login = auth?.login ?? (() => {});
	const logout = auth?.logout ?? (() => {});

	console.log('🔍 [UserProfile] Auth user:', user);
	console.log('🔍 [UserProfile] Loading:', loading);

	const [error, setError] = useState('');
	const [profileData, setProfileData] = useState(null);

	const [showMealSchedule, setShowMealSchedule] = useState(false);
	const [showPantry, setShowPantry] = useState(false);
	const [showMarketList, setShowMarketList] = useState(false);
	const [localLoading, setLocalLoading] = useState(true);

	// Dummy placeholders for lists
	const [pantryItems, setPantryItems] = useState(['Flour', 'Sugar', 'Salt']);
	const [marketItems, setMarketItems] = useState([
		'Tomatoes',
		'Chicken',
		'Milk',
	]);

	useEffect(() => {
		const abortController = new AbortController();
		let redirectTimeout;

		async function loadUserProfile() {
			try {
				const stored = localStorage.getItem('userData');
				if (!stored) {
					setError(t('auth.errors.noUserData', locale) || 'No user data found');
					redirectTimeout = setTimeout(() => {
						window.location.href = '/';
					}, 1000);
					return;
				}

				const parsed = JSON.parse(stored);
				const { uid, token } = parsed;

				const res = await fetch(`/api/getUserProfile?uid=${uid}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					signal: abortController.signal,
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(
						data.error || `Failed to load profile: ${res.status}`
					);
				}

				const data = await res.json();
				setProfileData(data);
				login(data); // Update auth context
				setError('');
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error('Profile load error:', err);
					setError(
						err.message ||
							t('auth.errors.profileLoadFailed', locale) ||
							'Failed to load profile'
					);
					redirectTimeout = setTimeout(() => {
						window.location.href = '/';
					}, 1500);
				}
			} finally {
				setLocalLoading(false);
			}
		}

		loadUserProfile();

		return () => {
			abortController.abort();
			clearTimeout(redirectTimeout);
		};
	}, [login, locale]);

	// Add this useEffect AFTER the existing useEffect that loads the user profile
	useEffect(() => {
		if (profileData?._id) {
			console.log(
				'📚 [UserProfile] Fetching saved recipes for user:',
				profileData._id
			);
			fetchSavedRecipes();
		}
	}, [profileData?._id]);

	// Add this useEffect AFTER the existing useEffect that loads the user profile
	async function fetchSavedRecipes() {
		if (!profileData?._id) return; // Use _id instead of uid for Sanity reference

		setRecipesLoading(true);
		try {
			const stored = localStorage.getItem('userData');
			if (!stored) return;

			const parsed = JSON.parse(stored);
			const { token } = parsed;

			// Fetch saved recipes from your API - use the user's Sanity _id
			const res = await fetch(
				`/api/get-saved-recipes?userId=${profileData._id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			if (res.ok) {
				const data = await res.json();
				console.log('📚 Saved recipes:', data); // Debug log
				setSavedRecipes(data);
			} else {
				const errorData = await res.json();
				console.error('Failed to fetch saved recipes:', errorData);
			}
		} catch (err) {
			console.error('Error fetching saved recipes:', err);
		} finally {
			setRecipesLoading(false);
		}
	}

	if (loading || localLoading) {
		return (
			<div className='loading-spinner'>
				{t('auth.loading', locale) || 'Loading...'}
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
				{error}
			</div>
		);
	}

	if (!profileData && !user) {
		return (
			<p style={{ padding: '2rem', textAlign: 'center' }}>
				{t('auth.noUser', locale) || 'No user information available.'}
			</p>
		);
	}

	// Use profileData from Sanity or fallback to auth user
	const displayUser = profileData || user;

	const handleAddPantryItem = () => {
		const item = prompt(
			t('profile.addPantryItemPrompt', locale) || 'Add Pantry Item:'
		);
		if (item) setPantryItems([...pantryItems, item]);
	};

	const handleAddMarketItem = () => {
		const item = prompt(
			t('profile.addMarketItemPrompt', locale) || 'Add Market Item:'
		);
		if (item) setMarketItems([...marketItems, item]);
	};

	const handleSaveMealSchedule = () => {
		// TODO: Implement meal schedule save to Sanity
		alert(t('profile.featureComingSoon', locale) || 'Feature coming soon!');
	};

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
					{t('profile.userInfo', locale) || 'User Information'}
				</h2>
				<dl
					style={{
						display: 'grid',
						gridTemplateColumns: 'max-content 1fr',
						gap: '0.5rem 1rem',
						fontSize: '1.1rem',
					}}
				>
					<dt>{t('profile.name', locale) || 'Name:'}</dt>
					<dd>
						{displayUser.name || ''} {displayUser.lastname || ''}
					</dd>

					<dt>{t('profile.email', locale) || 'Email:'}</dt>
					<dd>{displayUser.email}</dd>

					<dt>{t('profile.role', locale) || 'Role:'}</dt>
					<dd>{displayUser.role || '-'}</dd>

					<dt>{t('profile.bio', locale) || 'Bio:'}</dt>
					<dd style={{ fontStyle: 'italic' }}>
						{displayUser.bio || t('profile.noBio', locale) || 'No bio set.'}
					</dd>

					<dt>{t('profile.phone', locale) || 'Phone:'}</dt>
					<dd>{displayUser.phone || '-'}</dd>

					<dt>{t('profile.location', locale) || 'Location:'}</dt>
					<dd>{displayUser.location || '-'}</dd>

					<dt>{t('profile.dietPreference', locale) || 'Diet Preference:'}</dt>
					<dd>{displayUser.dietPreference || '-'}</dd>

					<dt>{t('profile.allergies', locale) || 'Allergies:'}</dt>
					<dd>
						{displayUser.allergies && displayUser.allergies.length > 0
							? Array.isArray(displayUser.allergies)
								? displayUser.allergies.join(', ')
								: displayUser.allergies
							: '-'}
					</dd>

					<dt>
						{t('profile.preferredCuisine', locale) || 'Preferred Cuisines:'}
					</dt>
					<dd>
						{displayUser.preferredCuisine &&
						displayUser.preferredCuisine.length > 0
							? Array.isArray(displayUser.preferredCuisine)
								? displayUser.preferredCuisine.join(', ')
								: displayUser.preferredCuisine
							: '-'}
					</dd>
				</dl>
			</section>

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
					<span>{t('profile.savedRecipes', locale) || 'Saved Recipes'}</span>
					<button
						style={{
							background: 'var(--color-primary, #007bff)',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							padding: '0.5rem 1rem',
							cursor: 'pointer',
							fontWeight: '600',
						}}
						onClick={() => (window.location.href = '/add-recipe')}
					>
						{t('profile.addRecipe', locale) || '+ Add Recipe'}
					</button>
				</h2>
				{recipesLoading ? (
					<p style={{ fontStyle: 'italic', color: '#666' }}>
						{t('auth.loading', locale) || 'Loading recipes...'}
					</p>
				) : savedRecipes.length > 0 ? (
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
							gap: '1rem',
							marginTop: '1.5rem',
						}}
					>
						{savedRecipes.map((savedRecipe) => (
							<div
								key={savedRecipe._id}
								style={{
									background: '#fff',
									border: '1px solid #e0e0e0',
									borderRadius: '12px',
									padding: '1rem',
									boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
									transition: 'all 0.3s ease',
									position: 'relative',
									overflow: 'hidden',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = 'translateY(-4px)';
									e.currentTarget.style.boxShadow =
										'0 8px 16px rgba(0,0,0,0.1)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = 'translateY(0)';
									e.currentTarget.style.boxShadow =
										'0 2px 8px rgba(0,0,0,0.05)';
								}}
							>
								{savedRecipe.recipe?.image && (
									<img
										src={savedRecipe.recipe.image}
										alt={savedRecipe.recipe.title}
										style={{
											width: '100%',
											height: '150px',
											objectFit: 'cover',
											borderRadius: '8px',
											marginBottom: '0.75rem',
										}}
									/>
								)}
								<h3
									style={{
										margin: '0 0 0.5rem 0',
										fontSize: '1.1rem',
										color: '#333',
									}}
								>
									{savedRecipe.recipe?.title || 'Untitled Recipe'}
								</h3>
								{savedRecipe.recipe?.description && (
									<p
										style={{
											fontSize: '0.9rem',
											color: '#666',
											marginBottom: '0.75rem',
											lineHeight: '1.4',
										}}
									>
										{savedRecipe.recipe.description.length > 120
											? `${savedRecipe.recipe.description.substring(0, 120)}...`
											: savedRecipe.recipe.description}
									</p>
								)}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										marginTop: '0.5rem',
									}}
								>
									{savedRecipe.recipe?.slug ? (
										<a
											href={`/recipes/${savedRecipe.recipe.slug}`}
											style={{
												color: '#007bff',
												textDecoration: 'none',
												fontSize: '0.9rem',
												fontWeight: '600',
											}}
										>
											View Recipe →
										</a>
									) : (
										<span style={{ fontSize: '0.8rem', color: '#888' }}>
											Recipe not available
										</span>
									)}
									<span
										style={{
											fontSize: '0.8rem',
											color: '#888',
											fontStyle: 'italic',
										}}
									>
										{new Date(savedRecipe.savedAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div style={{ textAlign: 'center', padding: '2rem 0' }}>
						<p
							style={{
								fontStyle: 'italic',
								color: '#666',
								marginBottom: '1rem',
							}}
						>
							{t('profile.noSavedRecipes', locale) ||
								'You have no saved recipes yet.'}
						</p>
						<button
							onClick={() => (window.location.href = '/recipes')}
							style={{
								background: 'var(--color-primary, #007bff)',
								color: 'white',
								border: 'none',
								borderRadius: '8px',
								padding: '0.75rem 1.5rem',
								cursor: 'pointer',
								fontWeight: '600',
								fontSize: '0.95rem',
								transition: 'all 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-2px)';
								e.currentTarget.style.boxShadow =
									'0 4px 12px rgba(0,123,255,0.3)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = 'none';
							}}
						>
							{t('profile.browseRecipes', locale) || 'Browse Recipes'}
						</button>
					</div>
				)}
			</section>
			{/* Recipes Section */}
			{/* <section
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
					<span>{t('profile.savedRecipes', locale) || 'Saved Recipes'}</span>
					<button
						style={{
							background: 'var(--color-primary, #007bff)',
							color: 'white',
							border: 'none',
							borderRadius: '6px',
							padding: '0.5rem 1rem',
							cursor: 'pointer',
							fontWeight: '600',
						}}
						onClick={() => (window.location.href = '/add-recipe')}
					>
						{t('profile.addRecipe', locale) || '+ Add Recipe'}
					</button>
				</h2>
				<p style={{ fontStyle: 'italic', color: '#666' }}>
					{t('profile.noSavedRecipes', locale) ||
						'You have no saved recipes yet.'}
				</p>
			</section> */}
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
					style={{
						cursor: 'pointer',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					onClick={() => setShowMealSchedule(!showMealSchedule)}
				>
					<span>{t('profile.mealSchedule', locale) || 'Meal Schedule'}</span>
					<span>{showMealSchedule ? '▲' : '▼'}</span>
				</h2>
				{showMealSchedule && (
					<div style={{ marginTop: '1rem' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr style={{ backgroundColor: '#ddd' }}>
									<th>{t('profile.day', locale) || 'Day'}</th>
									<th>{t('profile.breakfast', locale) || 'Breakfast'}</th>
									<th>{t('profile.lunch', locale) || 'Lunch'}</th>
									<th>{t('profile.dinner', locale) || 'Dinner'}</th>
								</tr>
							</thead>
							<tbody>
								{[
									t('profile.monday', locale) || 'Monday',
									t('profile.tuesday', locale) || 'Tuesday',
									t('profile.wednesday', locale) || 'Wednesday',
									t('profile.thursday', locale) || 'Thursday',
									t('profile.friday', locale) || 'Friday',
									t('profile.saturday', locale) || 'Saturday',
									t('profile.sunday', locale) || 'Sunday',
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
												minHeight: '2rem',
											}}
											data-day={day.toLowerCase()}
											data-meal='breakfast'
										></td>
										<td
											contentEditable
											style={{
												padding: '0.5rem',
												backgroundColor: '#fff',
												cursor: 'text',
												minHeight: '2rem',
											}}
											data-day={day.toLowerCase()}
											data-meal='lunch'
										></td>
										<td
											contentEditable
											style={{
												padding: '0.5rem',
												backgroundColor: '#fff',
												cursor: 'text',
												minHeight: '2rem',
											}}
											data-day={day.toLowerCase()}
											data-meal='dinner'
										></td>
									</tr>
								))}
							</tbody>
						</table>
						<div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
							<button
								onClick={handleSaveMealSchedule}
								style={{
									background: 'var(--color-success, #28a745)',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									padding: '0.5rem 1rem',
									cursor: 'pointer',
									fontWeight: '600',
								}}
							>
								{t('profile.saveSchedule', locale) || 'Save Schedule'}
							</button>
							<button
								onClick={() => setShowMealSchedule(false)}
								style={{
									background: '#6c757d',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									padding: '0.5rem 1rem',
									cursor: 'pointer',
								}}
							>
								{t('profile.cancel', locale) || 'Cancel'}
							</button>
						</div>
						<small
							style={{
								display: 'block',
								marginTop: '0.5rem',
								fontStyle: 'italic',
								color: '#666',
							}}
						>
							{t('profile.mealScheduleHint', locale) ||
								'Click a meal cell to add your planned meal.'}
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
					style={{
						cursor: 'pointer',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					onClick={() => setShowPantry(!showPantry)}
				>
					<span>{t('profile.pantry', locale) || 'Pantry Items'}</span>
					<span>{showPantry ? '▲' : '▼'}</span>
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
								padding: '0.5rem 1rem',
								cursor: 'pointer',
								fontWeight: '600',
							}}
						>
							{t('profile.addPantryItem', locale) || '+ Add Pantry Item'}
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
					style={{
						cursor: 'pointer',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					onClick={() => setShowMarketList(!showMarketList)}
				>
					<span>
						{t('profile.marketList', locale) || 'Market Shopping List'}
					</span>
					<span>{showMarketList ? '▲' : '▼'}</span>
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
								padding: '0.5rem 1rem',
								cursor: 'pointer',
								fontWeight: '600',
							}}
						>
							{t('profile.addMarketItem', locale) || '+ Add Market Item'}
						</button>
					</>
				)}
			</section>
		</div>
	);
}
