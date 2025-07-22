import { AuthProvider } from '../context/AuthContext.jsx';
import { GroceryListPage } from './GroceryListPage.jsx';

export default function GroceryListWrapper({ recipeId }) {
	return (
		<AuthProvider>
			<GroceryListPage recipeId={recipeId} />
		</AuthProvider>
	);
}
