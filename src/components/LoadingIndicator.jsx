import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingIndicator() {
	return (
		<div style={styles.container}>
			<DotLottieReact
				src='https://lottie.host/28d3cc84-7d96-42c6-9bb5-3d42114d318a/DNUVQ81wKD.lottie'
				loop
				autoplay
				style={styles.animation}
			/>
			<p style={styles.text}>Cooking up your recipe...</p>
		</div>
	);
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '60vh',
		textAlign: 'center',
	},
	animation: {
		width: '600px',
	},
	text: {
		marginTop: '1rem',
		fontSize: '1.2rem',
		fontWeight: '600',
	},
};
