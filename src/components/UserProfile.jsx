import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';

export default function UserProfile({ locale }) {
	const auth = useAuth();
	const hasLoadedRef = useRef(false);

	const [savedRecipes, setSavedRecipes] = useState([]);
	const [recipesLoading, setRecipesLoading] = useState(false);

	const loading = auth?.loading === undefined ? false : auth.loading;
	const user = auth?.user ?? null;
	const login = auth?.login ?? (() => {});
	const logout = auth?.logout ?? (() => {});

	const [error, setError] = useState('');
	const [profileData, setProfileData] = useState(null);

	const [showMealSchedule, setShowMealSchedule] = useState(false);
	const [showPantry, setShowPantry] = useState(false);
	const [showMarketList, setShowMarketList] = useState(false);
	const [localLoading, setLocalLoading] = useState(true);
	const [showBMIModal, setShowBMIModal] = useState(false);
	const [bmiData, setBmiData] = useState({
		weight: '',
		height: '',
		age: '',
		gender: 'male',
	});
	const [bmiResult, setBmiResult] = useState(null);

	// Dummy placeholders for lists
	const [pantryItems, setPantryItems] = useState(['Flour', 'Sugar', 'Salt']);
	const [marketItems, setMarketItems] = useState([
		'Tomatoes',
		'Chicken',
		'Milk',
	]);

	const [showEditModal, setShowEditModal] = useState(false);
	const [editForm, setEditForm] = useState({
		name: '',
		lastname: '',
		bio: '',
		phone: '',
		location: '',
	});
	const [saving, setSaving] = useState(false);

	const openEditModal = () => {
		setEditForm({
			name: displayUser.name || '',
			lastname: displayUser.lastname || '',
			bio: displayUser.bio || '',
			phone: displayUser.phone || '',
			location: displayUser.location || '',
		});
		setShowEditModal(true);
	};

	useEffect(() => {
		const abortController = new AbortController();
		let redirectTimeout;

		async function loadUserProfile() {
			// Skip if already loaded
			if (hasLoadedRef.current) {
				setLocalLoading(false);
				return;
			}

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

				const res = await fetch(`/api/get-user-profile?uid=${uid}`, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					signal: abortController.signal,
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(
						data.error || `Failed to load profile: ${res.status}`,
					);
				}

				const data = await res.json();
				setProfileData(data);
				login(data); // Update auth context
				hasLoadedRef.current = true; // Mark as loaded
				setError('');
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error('Profile load error:', err);
					setError(
						err.message ||
							t('auth.errors.profileLoadFailed', locale) ||
							'Failed to load profile',
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

	useEffect(() => {
		if (profileData?._id) {
			console.log(
				' [UserProfile] Fetching saved recipes for user:',
				profileData._id,
			);
			fetchSavedRecipes();
		}
	}, [profileData?._id]);

	useEffect(() => {
		if (profileData?.bmiHistory) {
			console.log('BMI History loaded:', profileData.bmiHistory);
		}
	}, [profileData?.bmiHistory]);

	// Agrega este useEffect después de los otros useEffects
	useEffect(() => {
		if (!showBMIModal && bmiResult && !bmiResult.error) {
			// El modal se cerró con un resultado exitoso, recargar datos
			const timer = setTimeout(() => {
				refreshProfileData();
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [showBMIModal, bmiResult]);

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
				},
			);

			if (res.ok) {
				const data = await res.json();
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
			t('profile.addPantryItemPrompt', locale) || 'Add Pantry Item:',
		);
		if (item) setPantryItems([...pantryItems, item]);
	};

	const handleAddMarketItem = () => {
		const item = prompt(
			t('profile.addMarketItemPrompt', locale) || 'Add Market Item:',
		);
		if (item) setMarketItems([...marketItems, item]);
	};

	const handleSaveMealSchedule = () => {
		// TODO: Implement meal schedule save to Sanity
		alert(t('profile.featureComingSoon', locale) || 'Feature coming soon!');
	};

	const handleSaveProfile = async () => {
		setSaving(true);
		try {
			const stored = JSON.parse(localStorage.getItem('userData'));
			const res = await fetch('/api/updateUserProfile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${stored.token}`,
				},
				body: JSON.stringify({
					uid: displayUser.uid,
					...editForm,
				}),
			});

			if (!res.ok) throw new Error('Update failed');

			const updated = await res.json();
			setProfileData(updated);
			login(updated);
			setShowEditModal(false);
		} catch (e) {
			alert('Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	const calculateBMI = () => {
		const weight = parseFloat(bmiData.weight);
		const height = parseFloat(bmiData.height) / 100;
		const age = parseInt(bmiData.age);

		if (!weight || !height || height === 0) {
			setBmiResult({
				error:
					t('profile.enterValidData', locale) ||
					'Please enter valid weight and height',
			});
			return;
		}

		const bmi = weight / (height * height);

		// Determinar categoría
		let category = '';
		let color = '';
		let recommendations = [];
		let warnings = [];

		if (bmi < 18.5) {
			category = t('profile.underweight', locale) || 'Underweight';
			color = '#3498db';
			recommendations = [
				'Aumenta gradualmente la ingesta calórica',
				'Incluye alimentos ricos en proteínas',
				'Considera entrenamiento de fuerza',
				'Come comidas frecuentes y más pequeñas',
			];
			warnings = [
				'Puede indicar deficiencias nutricionales',
				'Mayor riesgo de osteoporosis',
				'Consulta a un profesional de la salud',
			];
		} else if (bmi < 25) {
			category = t('profile.normalWeight', locale) || 'Normal weight';
			color = '#27ae60';
			recommendations = [
				'Mantén dieta equilibrada y ejercicio regular',
				'Continúa con hábitos alimenticios saludables',
				'Mantente físicamente activo',
				'Monitorea tu peso periódicamente',
			];
			warnings = ['Mantén tu estilo de vida para prevenir aumento de peso'];
		} else if (bmi < 30) {
			category = t('profile.overweight', locale) || 'Overweight';
			color = '#f39c12';
			recommendations = [
				'Reduce la ingesta calórica en 300-500 calorías/día',
				'Aumenta actividad física a 150 minutos/semana',
				'Enfócate en alimentos integrales',
				'Controla el tamaño de las porciones',
			];
			warnings = [
				'Mayor riesgo de enfermedad cardíaca',
				'Mayor probabilidad de diabetes tipo 2',
				'Riesgo de presión arterial alta',
			];
		} else {
			category = t('profile.obese', locale) || 'Obese';
			color = '#e74c3c';
			recommendations = [
				'Consulta a un profesional de la salud',
				'Objetivo de 0.5-1 kg de pérdida por semana',
				'Considera trabajar con un nutricionista',
				'Comienza con ejercicio de bajo impacto',
			];
			warnings = [
				'Alto riesgo de enfermedad cardiovascular',
				'Mayor probabilidad de apnea del sueño',
				'Riesgo de problemas articulares',
				'Mayor probabilidad de ciertos tipos de cáncer',
			];
		}

		// Agregar recomendaciones por edad
		if (age > 50) {
			recommendations.push('Considera suplementos para la salud ósea');
			recommendations.push('Se recomiendan chequeos regulares');
		}

		if (age < 25) {
			recommendations.push('Enfócate en construir hábitos saludables');
		}

		const result = {
			bmi: bmi.toFixed(1),
			category,
			color,
			weight,
			height: bmiData.height,
			age: bmiData.age,
			gender: bmiData.gender,
			recommendations,
			warnings,
			date: new Date().toISOString(),
		};

		setBmiResult(result);

		// Guardar en la base de datos
		saveBMIResult(result);
	};

	// Agrega esta función después de saveBMIResult
const refreshProfileData = async () => {
	try {
		const stored = localStorage.getItem('userData');
		if (!stored) {
			console.log('No user data found in localStorage');
			return;
		}

		const parsed = JSON.parse(stored);
		const { uid, token } = parsed;


		const res = await fetch(`/api/get-user-profile?uid=${uid}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		if (res.ok) {
			const data = await res.json();

			setProfileData(data);
			login(data);
		} else {
			console.error('Failed to refresh profile:', res.status);
		}
	} catch (error) {
		console.error('Error refreshing profile:', error);
	}
};

	const saveBMIResult = async (result) => {
		try {
			const stored = JSON.parse(localStorage.getItem('userData'));
			if (!stored || !stored.token) {
				console.error('No token found');
				return;
			}

			const response = await fetch('/api/save-bmi', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${stored.token}`,
				},
				body: JSON.stringify({
					userId: displayUser._id,
					bmiData: result,
				}),
			});

			const responseData = await response.json();

			if (response.ok) {
				console.log('BMI saved successfully');

				if (responseData.user) {
					setProfileData(responseData.user);
					login(responseData.user);
				} else {
					const newBMIEntry = {
						...result,
						_key: `bmi_${Date.now()}`,
					};

					setProfileData((prev) => ({
						...prev,
						bmiHistory: [...(prev.bmiHistory || []), newBMIEntry],
						latestBMI: parseFloat(result.bmi),
						bmiCategory: result.category,
					}));
				}

				setTimeout(() => {
					setShowBMIModal(false);
				}, 1500);
			} else {
				console.error('Failed to save BMI:', responseData);
				alert(
					t('profile.bmiSaveError', locale) ||
						'Failed to save BMI. Please try again.',
				);
			}
		} catch (error) {
			console.error('Error saving BMI:', error);
			alert(
				t('profile.bmiSaveError', locale) ||
					'Failed to save BMI. Please try again.',
			);
		}
	};

	// Replace the resetImcCalculator function with this:
	const resetBMICalculator = () => {
		setBmiData({
			weight: '',
			height: '',
			age: '',
			gender: 'male',
		});
		setBmiResult(null);
	};

	const handleCloseBMIModal = () => {
		setShowBMIModal(false);
		if (bmiResult && !bmiResult.error) {
			// Forzar un refresh después de guardar exitosamente
			setTimeout(() => {
				refreshProfileData();
			}, 500);
		}
	};

	const openBMIModal = () => {
		resetBMICalculator();
		setShowBMIModal(true);
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
						borderBottom: '2px solid #eee',
						marginBottom: '1rem',
					}}
				>
					<span>{t('profile.userInfo', locale) || 'User Information'}</span>

					<div style={{ display: 'flex', gap: '0.5rem' }}>
						<button
							onClick={openBMIModal}
							style={{
								background: '#27ae60',
								color: '#fff',
								border: 'none',
								borderRadius: 6,
								padding: '0.4rem 0.8rem',
								cursor: 'pointer',
								fontWeight: 600,
							}}
						>
							{t('profile.calculateBMI', locale) || 'Calculate BMI'}
						</button>

						<button
							onClick={openEditModal}
							style={{
								background: '#007bff',
								color: '#fff',
								border: 'none',
								borderRadius: 6,
								padding: '0.4rem 0.8rem',
								cursor: 'pointer',
								fontWeight: 600,
							}}
						>
							Edit
						</button>
					</div>
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

			{/* Historial de BMI */}
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
						borderBottom: '2px solid #eee',
						paddingBottom: '0.5rem',
						marginBottom: '1rem',
					}}
				>
					BMI History
				</h2>

				{profileData?.latestBMI || profileData?.bmiCategory ? (
					<div
						style={{
							padding: '0.75rem',
							background: '#f8f9fa',
							borderRadius: '8px',
							borderLeft: '4px solid #e74c3c',
							marginBottom: '1rem',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '0.25rem',
							}}
						>
							<span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
								{profileData.latestBMI}
								{profileData.latestBMI
									? parseFloat(profileData.latestBMI).toFixed(1)
									: 'N/A'}{' '}
								- {profileData.bmiCategory || 'No category'}
							</span>
							<span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
								Último cálculo
							</span>
						</div>
						<div style={{ color: '#5d6d7e', fontSize: '0.9rem' }}>
							{profileData?.healthGoals?.length > 0 && (
								<div>
									<strong>Health Goals:</strong>
									<ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
										{profileData.healthGoals.map((goal, idx) => (
											<li key={idx}>{goal}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				) : null}

				{/* LUEGO EL HISTORIAL SI EXISTE */}
				{profileData?.bmiHistory &&
				Array.isArray(profileData.bmiHistory) &&
				profileData.bmiHistory.length > 0 ? (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '0.75rem',
							maxHeight: '300px',
							overflowY: 'auto',
							padding: '0.5rem',
						}}
					>
						{profileData.bmiHistory
							.filter((entry) => entry !== null)
							.slice()
							.reverse()
							.map((entry, index) => {
								let borderColor = '#3498db';
								const category = String(entry.category || '').toLowerCase();

								if (
									category.includes('bajo') ||
									category.includes('underweight')
								) {
									borderColor = '#3498db';
								} else if (
									category.includes('normal') ||
									category.includes('peso normal')
								) {
									borderColor = '#27ae60';
								} else if (
									category.includes('sobrepeso') ||
									category.includes('overweight')
								) {
									borderColor = '#f39c12';
								} else if (
									category.includes('obeso') ||
									category.includes('obesity') ||
									category.includes('obesidad')
								) {
									borderColor = '#e74c3c';
								}

								return (
									<div
										key={entry._key || index}
										style={{
											padding: '0.75rem',
											background: '#f8f9fa',
											borderRadius: '8px',
											borderLeft: `4px solid ${borderColor}`,
										}}
									>
										<div
											style={{
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												marginBottom: '0.25rem',
											}}
										>
											<span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
												{entry.bmi ? parseFloat(entry.bmi).toFixed(1) : 'N/A'} -{' '}
												{entry.category || 'No category'}
											</span>
											<span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>
												{entry.date
													? new Date(entry.date).toLocaleDateString()
													: 'No date'}
											</span>
										</div>
										<div style={{ color: '#5d6d7e', fontSize: '0.9rem' }}>
											Peso: {entry.weight || 'N/A'}kg | Altura:{' '}
											{entry.height || 'N/A'}cm | Edad: {entry.age || 'N/A'} |
											Género: {entry.gender || 'N/A'}
										</div>
									</div>
								);
							})}
					</div>
				) : (
					<div
						style={{
							textAlign: 'center',
							padding: '2rem',
							color: '#7f8c8d',
							fontStyle: 'italic',
						}}
					>
						No hay historial de BMI. ¡Calcula tu primer BMI!
					</div>
				)}
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
						marginBottom: '1rem',
					}}
					onClick={() => setShowMealSchedule(!showMealSchedule)}
				>
					<span>{t('profile.mealSchedule', locale) || 'Meal Schedule'}</span>
					<span>{showMealSchedule ? '▲' : '▼'}</span>
				</h2>

				{showMealSchedule && (
					<div style={{ marginTop: '1rem', overflowX: 'auto' }}>
						<div
							style={{
								fontSize: '0.9rem',
								color: '#666',
								marginBottom: '1rem',
								fontStyle: 'italic',
							}}
						>
							{t('profile.mealScheduleHint', locale) ||
								'Sample meal plan - click cells to customize'}
						</div>

						<table
							style={{
								width: '100%',
								borderCollapse: 'collapse',
								fontSize: '0.85rem',
								minWidth: '800px', // Ensures table doesn't get too small on mobile
							}}
						>
							<thead>
								<tr
									style={{
										backgroundColor: '#2c3e50',
										color: 'white',
									}}
								>
									<th
										style={{
											padding: '0.75rem',
											textAlign: 'left',
											fontWeight: 'bold',
											border: '1px solid #34495e',
										}}
									>
										Horario
									</th>
									{[
										'Lunes',
										'Martes',
										'Miércoles',
										'Jueves',
										'Viernes',
										'Sábado',
										'Domingo',
									].map((day) => (
										<th
											key={day}
											style={{
												padding: '0.75rem',
												textAlign: 'center',
												fontWeight: 'bold',
												border: '1px solid #34495e',
											}}
										>
											{day}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{/* Morning Drink - 9:00 AM */}
								<tr>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8f9fa',
											fontWeight: 'bold',
											border: '1px solid #dee2e6',
										}}
									>
										<div style={{ fontWeight: 'bold' }}>
											9:00 Bebida matutina
										</div>
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
										}}
									>
										Jugo manzana ½ + zanahoria ½ + canela.{' '}
										<strong>Caliente</strong>.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
										}}
									>
										Jugo papaya + apio + jengibre. Caliente.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
										}}
									>
										Jugo piña + pepino + cúrcuma.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
											fontStyle: 'italic',
										}}
									>
										Repite lunes
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
											fontStyle: 'italic',
										}}
									>
										Repite martes
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
											fontStyle: 'italic',
										}}
									>
										Repite miércoles
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e8f5e9',
											border: '1px solid #dee2e6',
											fontStyle: 'italic',
										}}
									>
										Repite lunes
									</td>
								</tr>

								{/* Breakfast - 10:00 AM */}
								<tr>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8f9fa',
											fontWeight: 'bold',
											border: '1px solid #dee2e6',
										}}
									>
										<div style={{ fontWeight: 'bold' }}>10:00 Desayuno</div>
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Avena 40 g + huevo 1 + panela 30 g. <strong>Café</strong>{' '}
										caliente.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Omelette espinaca + avena 30 g. Café.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Huevos 2 + avena 30 g. Café.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Avena 40 g + panela 40 g.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Omelette pavo + avena 30 g.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Huevos con nopales + avena 30 g.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#fff3cd',
											border: '1px solid #dee2e6',
										}}
									>
										Avena + panela.
									</td>
								</tr>

								{/* Mid-morning Snack - 12:00 PM */}
								<tr>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8f9fa',
											fontWeight: 'bold',
											border: '1px solid #dee2e6',
										}}
									>
										<div style={{ fontWeight: 'bold' }}>12:00 Colación</div>
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Chocolate 15 g + té.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Gelatina + té.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Yogur + canela.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Chocolate 15 g.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Gelatina.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Yogur.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#d1ecf1',
											border: '1px solid #dee2e6',
										}}
									>
										Chocolate.
									</td>
								</tr>

								{/* Lunch - 2:00 PM */}
								<tr>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8f9fa',
											fontWeight: 'bold',
											border: '1px solid #dee2e6',
										}}
									>
										<div style={{ fontWeight: 'bold' }}>14:00 COMIDA</div>
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Cerdo 120 g + verduras + <strong>tortillas 1–2</strong> +
										salsa.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Pollo 120 g + verduras + tortillas 2.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Bistec 120 g + nopales + tortillas 2.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Pescado 120 g + chayote + tortillas 2.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Pollo caldo + tortillas 2.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Carne molida + verduras + tortillas 2.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8d7da',
											border: '1px solid #dee2e6',
										}}
									>
										Pollo + verduras + tortillas 2.
									</td>
								</tr>

								{/* Afternoon Snack - 5:30 PM */}
								<tr>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8f9fa',
											fontWeight: 'bold',
											border: '1px solid #dee2e6',
										}}
									>
										<div style={{ fontWeight: 'bold' }}>17:30 Snack</div>
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Sabritas 25 g + té caliente.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Elote ½ pza + té.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Manzana ½ + té.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Sabritas 25 g.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Elote ½.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Manzana ½.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#e2e3e5',
											border: '1px solid #dee2e6',
										}}
									>
										Sabritas 25 g.
									</td>
								</tr>

								{/* Dinner - 7:30 PM */}
								<tr>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#f8f9fa',
											fontWeight: 'bold',
											border: '1px solid #dee2e6',
										}}
									>
										<div style={{ fontWeight: 'bold' }}>19:30 Cena</div>
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Crema verduras 1 tz. <strong>Té lavanda</strong>.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Caldo ligero 1½ tz. Té.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Sopa avena 30 g.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Crema chayote.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Caldo.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Crema.
									</td>
									<td
										style={{
											padding: '0.75rem',
											backgroundColor: '#cce5ff',
											border: '1px solid #dee2e6',
										}}
									>
										Caldo.
									</td>
								</tr>
							</tbody>
						</table>

						<div
							style={{
								marginTop: '1rem',
								display: 'flex',
								gap: '0.5rem',
								flexWrap: 'wrap',
							}}
						>
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
									flex: '1',
									minWidth: '120px',
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
									flex: '1',
									minWidth: '120px',
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
								'Sample meal plan. Click Save to customize for your needs.'}
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

				{showEditModal && (
					<div
						style={{
							position: 'fixed',
							inset: 0,
							background: 'rgba(0,0,0,0.5)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 1000,
						}}
					>
						<div
							style={{
								background: '#fff',
								padding: '1.5rem',
								borderRadius: 12,
								width: 400,
							}}
						>
							<h3>Edit Profile</h3>

							{['name', 'lastname', 'phone', 'location'].map((f) => (
								<input
									key={f}
									placeholder={f}
									value={editForm[f]}
									onChange={(e) =>
										setEditForm({ ...editForm, [f]: e.target.value })
									}
									style={{ width: '100%', marginBottom: 8, padding: 8 }}
								/>
							))}

							<textarea
								placeholder='Bio'
								value={editForm.bio}
								onChange={(e) =>
									setEditForm({ ...editForm, bio: e.target.value })
								}
								style={{ width: '100%', marginBottom: 8, padding: 8 }}
							/>

							<div
								style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}
							>
								<button onClick={() => setShowEditModal(false)}>Cancel</button>
								<button onClick={handleSaveProfile} disabled={saving}>
									{saving ? 'Saving...' : 'Save'}
								</button>
							</div>
						</div>
					</div>
				)}
			</section>

			{/* IMC Calculator Modal */}
			{/* BMI Calculator Modal */}
			{showBMIModal && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
						padding: '1rem',
					}}
					onClick={(e) => {
						if (e.target === e.currentTarget) setShowBMIModal(false);
					}}
				>
					<div
						style={{
							backgroundColor: 'white',
							borderRadius: '12px',
							padding: '2rem',
							maxWidth: '500px',
							width: '100%',
							maxHeight: '90vh',
							overflowY: 'auto',
							boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
						}}
					>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '1.5rem',
								borderBottom: '2px solid #f0f0f0',
								paddingBottom: '0.5rem',
							}}
						>
							<h2 style={{ margin: 0, color: '#2c3e50' }}>
								{t('profile.bmiCalculator', locale) || 'BMI Calculator'}
							</h2>
							<button
								onClick={() => setShowBMIModal(false)}
								style={{
									background: 'none',
									border: 'none',
									fontSize: '1.5rem',
									cursor: 'pointer',
									color: '#7f8c8d',
								}}
							>
								×
							</button>
						</div>

						<div style={{ marginBottom: '1.5rem' }}>
							<label
								style={{
									display: 'block',
									marginBottom: '0.5rem',
									fontWeight: '600',
									color: '#2c3e50',
								}}
							>
								{t('profile.gender', locale) || 'Gender'}
							</label>
							<div
								style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
							>
								{['male', 'female'].map((g) => (
									<label
										key={g}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '0.5rem',
											cursor: 'pointer',
										}}
									>
										<input
											type='radio'
											name='gender'
											value={g}
											checked={bmiData.gender === g}
											onChange={(e) =>
												setBmiData({ ...bmiData, gender: e.target.value })
											}
											style={{ cursor: 'pointer' }}
										/>
										<span style={{ textTransform: 'capitalize' }}>
											{t(
												`profile.gender${g.charAt(0).toUpperCase() + g.slice(1)}`,
												locale,
											) || g}
										</span>
									</label>
								))}
							</div>

							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: '1rem',
								}}
							>
								<div>
									<label
										style={{
											display: 'block',
											marginBottom: '0.5rem',
											fontWeight: '600',
											color: '#2c3e50',
										}}
									>
										{t('profile.age', locale) || 'Age'} (years)
									</label>
									<input
										type='number'
										value={bmiData.age}
										onChange={(e) =>
											setBmiData({ ...bmiData, age: e.target.value })
										}
										min='1'
										max='120'
										style={{
											width: '100%',
											padding: '0.75rem',
											border: '2px solid #e0e0e0',
											borderRadius: '8px',
											fontSize: '1rem',
											transition: 'border-color 0.3s',
										}}
										onFocus={(e) => (e.target.style.borderColor = '#3498db')}
										onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
									/>
								</div>

								<div>
									<label
										style={{
											display: 'block',
											marginBottom: '0.5rem',
											fontWeight: '600',
											color: '#2c3e50',
										}}
									>
										{t('profile.weight', locale) || 'Weight'} (kg)
									</label>
									<input
										type='number'
										value={bmiData.weight}
										onChange={(e) =>
											setBmiData({ ...bmiData, weight: e.target.value })
										}
										step='0.1'
										min='20'
										max='300'
										style={{
											width: '100%',
											padding: '0.75rem',
											border: '2px solid #e0e0e0',
											borderRadius: '8px',
											fontSize: '1rem',
											transition: 'border-color 0.3s',
										}}
										onFocus={(e) => (e.target.style.borderColor = '#3498db')}
										onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
									/>
								</div>
							</div>

							<div style={{ marginTop: '1rem' }}>
								<label
									style={{
										display: 'block',
										marginBottom: '0.5rem',
										fontWeight: '600',
										color: '#2c3e50',
									}}
								>
									{t('profile.height', locale) || 'Height'} (cm)
								</label>
								<input
									type='number'
									value={bmiData.height}
									onChange={(e) =>
										setBmiData({ ...bmiData, height: e.target.value })
									}
									min='50'
									max='250'
									style={{
										width: '100%',
										padding: '0.75rem',
										border: '2px solid #e0e0e0',
										borderRadius: '8px',
										fontSize: '1rem',
										transition: 'border-color 0.3s',
									}}
									onFocus={(e) => (e.target.style.borderColor = '#3498db')}
									onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
								/>
							</div>
						</div>

						{bmiResult?.error && (
							<div
								style={{
									backgroundColor: '#ffeaea',
									color: '#e74c3c',
									padding: '1rem',
									borderRadius: '8px',
									marginBottom: '1rem',
									border: '1px solid #fadbd8',
								}}
							>
								{bmiResult.error}
							</div>
						)}

						{bmiResult && !bmiResult.error && (
							<div
								style={{
									backgroundColor: '#f8f9fa',
									padding: '1.5rem',
									borderRadius: '10px',
									marginBottom: '1.5rem',
									border: `2px solid ${bmiResult.color}40`,
									textAlign: 'center',
								}}
							>
								<h3 style={{ marginTop: 0, color: '#2c3e50' }}>
									{t('profile.bmiResult', locale) || 'BMI Result'}
								</h3>
								<div
									style={{
										fontSize: '3rem',
										fontWeight: 'bold',
										margin: '1rem 0',
										color: bmiResult.color,
									}}
								>
									{bmiResult.bmi}
								</div>
								<div
									style={{
										fontSize: '1.2rem',
										fontWeight: '600',
										color: bmiResult.color,
										marginBottom: '0.5rem',
									}}
								>
									{bmiResult.category}
								</div>
								<div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
									{t('profile.weight', locale) || 'Weight'}: {bmiResult.weight}{' '}
									kg | {t('profile.height', locale) || 'Height'}:{' '}
									{bmiResult.height} cm | {t('profile.age', locale) || 'Age'}:{' '}
									{bmiResult.age}
								</div>

								{/* Banner de alerta con color */}
								<div
									style={{
										marginTop: '1rem',
										padding: '0.75rem',
										backgroundColor: `${bmiResult.color}20`,
										borderLeft: `4px solid ${bmiResult.color}`,
										borderRadius: '4px',
										textAlign: 'left',
									}}
								>
									<strong style={{ color: bmiResult.color }}>
										{t('profile.healthStatus', locale) || 'Health Status:'}
									</strong>
									<ul
										style={{
											margin: '0.5rem 0 0 1rem',
											padding: 0,
											fontSize: '0.9rem',
										}}
									>
										{bmiResult.warnings.map((warning, index) => (
											<li key={index} style={{ marginBottom: '0.25rem' }}>
												⚠️ {warning}
											</li>
										))}
									</ul>
								</div>

								{/* Recomendaciones */}
								<div
									style={{
										marginTop: '1rem',
										padding: '0.75rem',
										backgroundColor: '#e8f4fd',
										borderLeft: '4px solid #3498db',
										borderRadius: '4px',
										textAlign: 'left',
									}}
								>
									<strong style={{ color: '#2c3e50' }}>
										{t('profile.recommendations', locale) || 'Recommendations:'}
									</strong>
									<ul
										style={{
											margin: '0.5rem 0 0 1rem',
											padding: 0,
											fontSize: '0.9rem',
										}}
									>
										{bmiResult.recommendations.map((rec, index) => (
											<li key={index} style={{ marginBottom: '0.25rem' }}>
												✅ {rec}
											</li>
										))}
									</ul>
								</div>
							</div>
						)}

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								gap: '1rem',
								marginTop: '1.5rem',
							}}
						>
							<button
								onClick={resetBMICalculator}
								style={{
									flex: 1,
									padding: '0.75rem',
									backgroundColor: '#95a5a6',
									color: 'white',
									border: 'none',
									borderRadius: '8px',
									cursor: 'pointer',
									fontWeight: '600',
									fontSize: '1rem',
									transition: 'all 0.3s',
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.backgroundColor = '#7f8c8d')
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.backgroundColor = '#95a5a6')
								}
							>
								{t('profile.reset', locale) || 'Reset'}
							</button>

							<button
								onClick={calculateBMI}
								style={{
									flex: 1,
									padding: '0.75rem',
									backgroundColor: '#3498db',
									color: 'white',
									border: 'none',
									borderRadius: '8px',
									cursor: 'pointer',
									fontWeight: '600',
									fontSize: '1rem',
									transition: 'all 0.3s',
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.backgroundColor = '#2980b9')
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.backgroundColor = '#3498db')
								}
							>
								{t('profile.calculate', locale) || 'Calculate'}
							</button>

							{/* Agrega este botón OK/Cerrar */}
							{bmiResult && !bmiResult.error && (
								<button
									onClick={handleCloseBMIModal}
									style={{
										flex: 1,
										padding: '0.75rem',
										backgroundColor: '#27ae60',
										color: 'white',
										border: 'none',
										borderRadius: '8px',
										cursor: 'pointer',
										fontWeight: '600',
										fontSize: '1rem',
										transition: 'all 0.3s',
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.backgroundColor = '#219653')
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.backgroundColor = '#27ae60')
									}
								>
									{t('profile.okSave', locale) || 'OK & Save'}
								</button>
							)}
						</div>

						<div
							style={{
								marginTop: '1.5rem',
								padding: '1rem',
								backgroundColor: '#f8f9fa',
								borderRadius: '8px',
								fontSize: '0.85rem',
								color: '#7f8c8d',
								borderLeft: '4px solid #3498db',
							}}
						>
							<strong style={{ color: '#2c3e50' }}>
								{t('profile.bmiInfo', locale) || 'BMI Information:'}
							</strong>
							<ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
								<li>
									{'< 18.5'} -{' '}
									{t('profile.underweight', locale) || 'Underweight'}
								</li>
								<li>
									{'18.5 - 24.9'} -{' '}
									{t('profile.normalWeight', locale) || 'Normal weight'}
								</li>
								<li>
									{'25 - 29.9'} -{' '}
									{t('profile.overweight', locale) || 'Overweight'}
								</li>
								<li>
									{'≥ 30'} - {t('profile.obese', locale) || 'Obese'}
								</li>
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
