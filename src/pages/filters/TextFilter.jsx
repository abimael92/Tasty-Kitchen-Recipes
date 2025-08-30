import { useState } from 'react';

export default function TextFilter({ onChange }) {
	const [value, setValue] = useState('');

	function handleInput(e) {
		setValue(e.target.value);
		onChange(e.target.value);
	}

	const inputStyle = {
		width: '100%',
		padding: '0.6rem 0.8rem',
		fontSize: '1rem',
		borderRadius: '12px',
		border: '1px solid rgba(0, 0, 0, 0.15)',
		boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
		transition: 'all 0.3s ease',
		fontFamily: 'Roboto, sans-serif',
		color: '#333',
		outline: 'none',
	};

	const handleFocus = (e) => {
		e.target.style.borderColor = '#FFD700';
		e.target.style.boxShadow = '0 0 8px #FFD700';
	};

	const handleBlur = (e) => {
		e.target.style.borderColor = 'rgba(0, 0, 0, 0.15)';
		e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
	};

	return (
		<input
			type='text'
			placeholder='Search by title...'
			value={value}
			onInput={handleInput}
			style={inputStyle}
			onFocus={handleFocus}
			onBlur={handleBlur}
		/>
	);
}
