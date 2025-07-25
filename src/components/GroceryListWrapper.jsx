import { AuthProvider } from '../context/AuthContext.jsx';
import { GroceryListPage } from './GroceryListPage.jsx';

export default function GroceryListWrapper({ recipeId, locale }) {
	return (
		<AuthProvider>
			<GroceryListPage recipeId={recipeId} locale={locale} />
		</AuthProvider>
	);
}
