export default function Star({ width = 0, size = 100 }) {
	// Safely calculate width percentage (0-100)
	const fillWidth = Math.min(100, Math.max(0, width * 100));

	return (
		<div
			className='star'
			style={{
				'--star-size': `${size}px`,
				position: 'relative',
				display: 'inline-block',
				width: `${size}px`,
				height: `${size}px`,
				fontSize: `${size}px`,
				lineHeight: 1,
			}}
		>
			{/* Gray background (always shows) */}
			<div
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					backgroundColor: '#DDDDDD',
					zIndex: 0,
				}}
			/>

			{/* Black outline star */}
			<span
				style={{
					position: 'absolute',
					color: 'black',
					zIndex: 1,
				}}
			>
				☆
			</span>

			{/* Yellow filled star (clipped by width) */}
			<div
				style={{
					position: 'absolute',
					width: `${fillWidth}%`,
					overflow: 'hidden',
					zIndex: 2,
				}}
			>
				<span style={{ color: '#FFD700' }}>★</span>
			</div>
		</div>
	);
}
