import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FaBookmark } from 'react-icons/fa';
import { t } from '../utils/i18n';

export default function SaveRecipeButton({ recipeId, locale = 'en' }) {
	const { user } = useAuth();
	const [isSaved, setIsSaved] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSaveRecipe = async () => {
		if (!user) {
			window.dispatchEvent(new Event('open-login'));
			return;
		}

		setLoading(true);
		// Simple toggle for now
		setTimeout(() => {
			setIsSaved(!isSaved);
			setLoading(false);
		}, 300);
	};

	return (
		<button
			onClick={handleSaveRecipe}
			disabled={loading}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				padding: '10px 16px',
				background: isSaved ? '#10b981' : '#6b7280',
				color: 'white',
				border: 'none',
				borderRadius: '50px',
				cursor: 'pointer',
				fontSize: '14px',
				fontWeight: '600',
				transition: 'all 0.3s ease',
				opacity: loading ? 0.7 : 1,
			}}
		>
			<FaBookmark />
			<span>{loading ? '...' : isSaved ? 'Saved' : 'Save Recipe'}</span>
		</button>
	);
}
