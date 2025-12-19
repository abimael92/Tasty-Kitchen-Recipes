// HeroButton.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Assuming your AuthProvider exposes this

export default function HeroButton() {
	const { openLogin } = useAuth(); // function to open the login modal

	return (
		<button
			type='button'
			className='button secondary-button'
			onClick={openLogin}
			aria-label='Open login'
		>
			Login
			<svg
				className='button-icon'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				aria-hidden='true'
			>
				<path d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'></path>
				<path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' strokeWidth='2'></path>
			</svg>
		</button>
	);
}
