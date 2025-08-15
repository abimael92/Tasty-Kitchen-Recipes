import { useState } from 'react';

export default function TagsFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		const tags = e.target.value
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean);
		setValue(e.target.value);
		onChange(tags);
	}

	return (
		<input
			type='text'
			placeholder='Filter by tags (comma separated)'
			value={value}
			onInput={handleInput}
			className='filter-input'
		/>
	);
}
