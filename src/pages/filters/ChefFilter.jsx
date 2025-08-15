import { useState } from 'react';

export default function ChefFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		setValue(e.target.value);
		onChange(e.target.value);
	}

	return (
		<input
			type='text'
			placeholder='Filter by chef...'
			value={value}
			onInput={handleInput}
			className='filter-input'
		/>
	);
}
