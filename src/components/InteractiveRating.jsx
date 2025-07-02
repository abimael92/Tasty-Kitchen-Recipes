import { createSignal } from 'solid-js';
import RatingStars from './RatingStars';

export default function InteractiveRating() {
	const [rating, setRating] = createSignal(0);

	return (
		<div>
			<RatingStars
				onRate={(newRating) => {
					console.log('New rating:', newRating);
					setRating(newRating);
				}}
			/>
			<p>Current rating: {rating()}</p>
		</div>
	);
}
