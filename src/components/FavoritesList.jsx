import React from 'react';
import { t } from '../utils/i18n';

export default function FavoritesList({ recipes, title, locale }) {
	if (!recipes.length) {
		return <p>{t('favorites.empty', locale)}</p>;
	}

	return (
		<div style={{ padding: '20px' }}>
			<h1 style={{ textAlign: 'center', color: '#d2691e', margin: '20px 0' }}>
				{title || t('favorites.title', locale)}
			</h1>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
					gap: '30px',
					maxWidth: '1400px',
					margin: '0 auto',
				}}
			>
				{recipes.map(({ _id, title, image, slug }) => (
					<a
						key={_id}
						href={`/recipes/${slug.current}`}
						style={{
							background: 'white',
							border: '1px solid #f5c6c6',
							borderRadius: '12px',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
							overflow: 'hidden',
							display: 'flex',
							flexDirection: 'column',
							textDecoration: 'none',
							color: 'inherit',
						}}
					>
						{image && (
							<img
								src={image}
								alt={title}
								style={{
									width: '100%',
									height: '200px',
									objectFit: 'cover',
								}}
							/>
						)}

						<div
							style={{
								padding: '15px',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<h2 style={{ margin: 0, color: '#d2691e', fontSize: '1.3rem' }}>
								{title}
							</h2>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}
