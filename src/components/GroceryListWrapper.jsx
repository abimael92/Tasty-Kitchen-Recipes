import React, { useState, useEffect } from 'react';

export function GroceryListWrapper(props) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	const GroceryListPage = React.lazy(() => import('./GroceryListPage.jsx'));

	return (
		<React.Suspense fallback={<div>Loading...</div>}>
			<GroceryListPage {...props} />
		</React.Suspense>
	);
}
