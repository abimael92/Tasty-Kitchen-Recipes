import React from 'react';
import { useAuth } from '../../auth/context/AuthContext.jsx';
import { InteractiveRating } from './InteractiveRating.jsx';

function InnerRating({ recipeId }) {
	const { user, loading } = useAuth();

	if (loading || !user) return null;

	return (
		<>
			<div className='rating-container'>
				<h4 className='rating-heading'>RATE THIS RECIPE</h4>
				<InteractiveRating recipeId={recipeId} />
			</div>
			<style>{`
				.rating-container {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					gap: 1rem;
					font-weight: 800;
					font-size: 0.9rem;
					color: #2c3e50;
					background: linear-gradient(135deg, #fe9f8e 0%, #f8f9fa 100%);
					padding: 0 12px;
					margin: 3rem auto;
					border-radius: 20px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
					user-select: none;
					transition: background 0.3s ease;
					cursor: pointer;
				}
				.rating-container:hover {
					background: linear-gradient(135deg, #f8f9fa 0%, #fe9f8e 100%);
				}
				.rating-heading {
					color: #333;
					font-weight: 800;
					text-align: center;
					font-size: 1.8rem;
				}
			`}</style>
		</>
	);
}

export default function AuthRatingWrapper({ recipeId }) {
	return <InnerRating recipeId={recipeId} />;
}

