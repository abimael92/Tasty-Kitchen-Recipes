import React from 'react';

export default function FavoritesList({ recipes }) {
	if (!recipes.length) {
		return <p>No favorites yet.</p>;
	}

	return (
		<div>
			<h1>Your Favorite Recipes</h1>
			<ul style={{ listStyle: 'none', padding: 0 }}>
				{recipes.map(({ _id, title, image, slug }) => (
					<li key={_id} style={{ marginBottom: '1.5rem' }}>
						<a
							href={`/recipes/${slug}`}
							style={{ textDecoration: 'none', color: 'inherit' }}
						>
							{image && (
								<img
									src={image}
									alt={title}
									style={{
										width: 150,
										height: 100,
										objectFit: 'cover',
										borderRadius: '8px',
									}}
								/>
							)}
							<div>{title}</div>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
