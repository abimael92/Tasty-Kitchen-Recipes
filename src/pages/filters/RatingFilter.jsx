import { useState } from 'react';

export default function RatingFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		const rating = parseFloat(e.target.value) || null;
		setValue(e.target.value);
		onChange(rating);
	}

	return (
		<div className='rating-filter-wrapper'>
			<input
				type='number'
				placeholder='Minimum rating'
				min='0'
				max='5'
				step='0.1'
				value={value}
				onInput={handleInput}
				className='filter-input'
			/>
			<style>{`
				.rating-filter-wrapper {
					width: 100%;
					margin: 0.5rem 0;
				}

				.filter-input {
					width: 100%;
					padding: 0.6rem 0.8rem;
					font-size: 1rem;
					border-radius: 12px;
					border: 1px solid rgba(0, 0, 0, 0.15);
					box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
					transition: all 0.3s ease;
					font-family: 'Roboto', sans-serif;
					color: #333;
				}

				.filter-input:focus {
					border-color: #FFD700;
					box-shadow: 0 0 8px #FFD700;
					outline: none;
				}

				.filter-input::placeholder {
					color: #888;
					font-style: italic;
				}
			`}</style>
		</div>
	);
}
