import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FaBookmark, FaBookmark as FaSolidBookmark } from 'react-icons/fa';
import { t } from '../utils/i18n';
import { publicSanityClient } from '../lib/sanity';

export default function SaveRecipeButton({ recipeId, locale = 'en' }) {
	const { user } = useAuth();
	const [isSaved, setIsSaved] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [savedRecipeId, setSavedRecipeId] = useState(null);

	// Check if recipe is already saved
	useEffect(() => {
		const checkIfSaved = async () => {
			if (!user || !user._id) return;

			try {
				console.log('📚 Checking if recipe is saved:', {
					userId: user._id,
					recipeId,
				});
				const res = await fetch(`/api/get-saved-recipes?userId=${user._id}`, {
					headers: { 'Content-Type': 'application/json' },
				});

				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const savedRecipes = await res.json();
				console.log('📚 User saved recipes:', savedRecipes);

				// Check if current recipe is in saved recipes
				const savedRecipe = savedRecipes.find(
					(item) => item.recipe?._id === recipeId
				);

				if (savedRecipe) {
					setIsSaved(true);
					setSavedRecipeId(savedRecipe._id);
				}
			} catch (error) {
				console.error('❌ Error checking saved status:', error);
			}
		};

		checkIfSaved();
	}, [user, recipeId]);

	// In your SaveRecipeButton component
	const handleSaveRecipe = async () => {
		if (!user || !user._id) {
			window.dispatchEvent(new Event('open-login'));
			return;
		}

		setLoading(true);
		try {
			// 1. Check if user has a savedRecipe document
			const savedDoc = await publicSanityClient.fetch(
				`*[_type == "savedRecipe" && user._ref == $userId][0]{
        _id,
        recipes
      }`,
				{ userId: user._id }
			);

			if (isSaved) {
				// Unsave - remove from array
				if (savedDoc) {
					await publicSanityClient
						.patch(savedDoc._id)
						.unset([`recipes[_key == "${recipeId}"]`])
						.set({ lastUpdated: new Date().toISOString() })
						.commit();
				}
				setIsSaved(false);
			} else {
				// Save - add to array
				if (savedDoc) {
					// Update existing document
					await publicSanityClient
						.patch(savedDoc._id)
						.append('recipes', [
							{
								_type: 'object',
								_key: recipeId,
								recipe: { _type: 'reference', _ref: recipeId },
								savedAt: new Date().toISOString(),
							},
						])
						.set({ lastUpdated: new Date().toISOString() })
						.commit();
				} else {
					// Create new document
					await publicSanityClient.create({
						_type: 'savedRecipe',
						user: { _type: 'reference', _ref: user._id },
						recipes: [
							{
								_type: 'object',
								_key: recipeId,
								recipe: { _type: 'reference', _ref: recipeId },
								savedAt: new Date().toISOString(),
							},
						],
						lastUpdated: new Date().toISOString(),
					});
				}
				setIsSaved(true);
			}
		} catch (error) {
			console.error('Error:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			<button
				onClick={handleSaveRecipe}
				disabled={loading}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					padding: '10px 16px',
					background: isSaved ? '#28a745' : '#6c757d',
					color: 'white',
					border: 'none',
					borderRadius: '8px',
					cursor: loading ? 'not-allowed' : 'pointer',
					fontSize: '0.95rem',
					fontWeight: 600,
					transition: 'all 0.3s ease',
					opacity: loading ? 0.7 : 1,
				}}
				title={
					isSaved
						? t('profile.unsaveRecipe', locale) || 'Remove from saved recipes'
						: t('profile.saveRecipe', locale) ||
						  'Save this recipe to your profile'
				}
			>
				{isSaved ? (
					<FaSolidBookmark style={{ fontSize: '1.1rem' }} />
				) : (
					<FaBookmark style={{ fontSize: '1.1rem' }} />
				)}
				<span>
					{loading
						? t('common.processing', locale) || 'Processing...'
						: isSaved
						? t('profile.saved', locale) || 'Saved'
						: t('profile.saveRecipe', locale) || 'Save Recipe'}
				</span>
			</button>

			{error && (
				<div
					style={{
						position: 'absolute',
						top: '100%',
						left: 0,
						right: 0,
						background: '#fee',
						color: '#c33',
						padding: '8px',
						borderRadius: '4px',
						fontSize: '0.8rem',
						marginTop: '4px',
						zIndex: 1000,
						textAlign: 'center',
					}}
				>
					{error}
				</div>
			)}
		</div>
	);
}
