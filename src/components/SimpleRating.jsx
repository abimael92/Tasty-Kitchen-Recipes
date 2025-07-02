import { createSignal } from 'solid-js';
import styles from '../styles/components/SimpleRating.module.css';

export default function SimpleRating() {
	const [rating, setRating] = createSignal(0);

	return (
		<>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<div class={styles.rating}>
					<h4 class={styles.heading}> RATE THIS RECIPE</h4>
					{[1, 2, 3, 4, 5].map((star) => (
						<button onClick={() => setRating(star)} class={styles.ratingButton}>
							<svg
								width='48'
								height='48'
								viewBox='0 0 24 24'
								stroke='black'
								stroke-width='1'
								fill={rating() >= star ? '#FFD700' : '#DDDDDD'}
							>
								<path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
							</svg>
						</button>
					))}
				</div>
			</div>

			{/* <div
				style={{
					borderRadius: '50px',
					display: 'flex',
				}}
			>
				<p
					style={{
						fontSize: '2.5rem',
						color: '#555',
						fontWeight: 'bold',
					}}
				>
					{rating() > 0 ? `You rated: ${rating()} stars` : ''}
				</p>
			</div> */}
		</>
	);
}
