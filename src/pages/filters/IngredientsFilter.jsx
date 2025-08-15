import { useState } from 'react';

export default function IngredientsFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		const items = e.target.value
			.split(',')
			.map((i) => i.trim())
			.filter(Boolean);
		setValue(e.target.value);
		onChange(items);
	}

	return (
		<input
			type='text'
			placeholder='Filter by ingredients (comma separated)'
			value={value}
			onInput={handleInput}
			className='filter-input'
		/>
	);
}
