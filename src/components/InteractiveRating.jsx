// InteractiveRating.jsx
import React, { useState } from 'react';
import { SimpleRating } from './SimpleRating.jsx';

export default function InteractiveRating() {
	const [rating, setRating] = useState(0);

	const handleRatingChange = (newRating) => {
		setRating(newRating);
		console.log('User rated:', newRating);
		// Optionally: send newRating to your server here
	};

	return (
		<SimpleRating
			totalratings={5}
			defaultRating={rating}
			getCurrentRatings={handleRatingChange}
		/>
	);
}
