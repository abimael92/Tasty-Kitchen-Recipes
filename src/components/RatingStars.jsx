import Star from './Star';

export default function RatingStars({ rating = 0, total = 5, size = 24 }) {
	const getWidth = (index) => {
		if (index >= rating) return 0;
		return Math.min(1, rating - index);
	};

	return (
		<div className='rating-wrapper'>
			<label className='rating-label'>Rating:</label>
			<div className='stars'>
				{Array.from({ length: total }).map((_, i) => (
					<Star key={i} width={getWidth(i)} size={size} />
				))}
			</div>
			<span className='rating-value'>{rating.toFixed(1)}</span>

			<style jsx>{`
				.rating-wrapper {
					display: flex;
					align-items: center;
					gap: 8px;

					margin: 1.5rem;
				}

				.rating-label {
					font-size: 14px;
					font-weight: 600;
					color: #444;
				}

				.stars {
					display: flex;
					gap: 4px;
				}

				.rating-value {
					display: inline-block;
					font-weight: 700;
					font-size: 0.9rem;
					color: #2c3e50;
					background: linear-gradient(135deg, #f8f9fa 0%, #ff6347 100%);
					padding: 4px 12px;
					border-radius: 20px;
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
					letter-spacing: 0.05em;
					user-select: none;
					transition: background 0.3s ease, box-shadow 0.3s ease;
				}

				.rating-value:hover {
					background: linear-gradient(135deg, #ff6347 0%, #f8f9fa 100%);
					box-shadow: 0 6px 16px rgba(0, 0, 0, 0.8);
					cursor: default;
				}
			`}</style>
		</div>
	);
}
