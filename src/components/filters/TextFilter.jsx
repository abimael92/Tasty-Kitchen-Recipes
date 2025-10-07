export default function TextFilter({ value, onChange }) {
	return (
		<input
			type='text'
			placeholder='Search by recipe name...'
			value={value}
			onInput={(e) => onChange(e.target.value)}
			className='filter-input'
		/>
	);
}

