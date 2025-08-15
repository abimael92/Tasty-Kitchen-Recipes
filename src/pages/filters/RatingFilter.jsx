import { useState } from 'react';

export default function RatingFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		const rating = parseFloat(e.target.value) || null;
		setValue(e.target.value);
		onChange(rating);
	}

	return (
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
	);
}
