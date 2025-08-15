import { useState } from 'react';

export default function TextFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		setValue(e.target.value);
		onChange(e.target.value);
	}

	return (
		<input
			type='text'
			placeholder='Search by title...'
			value={value}
			onInput={handleInput}
			className='filter-input'
		/>
	);
}
