import { useState } from 'react';
import { Star } from './Star';

export const SimpleRating = ({
	totalratings,
	getCurrentRatings,
	defaultRating,
}) => {
	const [currentRatings, setCurrentRatings] = useState(defaultRating);

	const handleOnClick = (e, index) => {
		const { left, width } = e.currentTarget.getBoundingClientRect();
		const fraction = (e.pageX - left) / width > 0.5 ? 1 : 0.5;
		const currentRatings = index + fraction;
		getCurrentRatings(currentRatings);
		setCurrentRatings(currentRatings);
	};

	const getWidth = (index) => {
		if (index >= currentRatings) return 0;
		return Math.min(1, currentRatings - index);
	};

	return (
		<div className='ratings'>
			{Array.from({ length: totalratings }).map((_, index) => (
				<span key={index} onClick={(e) => handleOnClick(e, index)}>
					<Star width={getWidth(index)} size={48} />
				</span>
			))}
		</div>
	);
};
