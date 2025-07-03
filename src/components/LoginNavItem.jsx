export default function LoginNavItem({ onClick }) {
	return (
		<button
			style={{
				color: 'white',
				background: 'var(--color-secondary)',
				border: 'none',
				cursor: 'pointer',
				fontWeight: 500,
				fontSize: '1rem',
				padding: '0.125rem 0.5rem',
				transition: 'color 0.3s',
			}}
			onClick={onClick}
		>
			Login ▼
		</button>
	);
}
