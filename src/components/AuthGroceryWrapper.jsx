import { AuthProvider } from '../context/AuthContext.jsx';
import GroceryListToggleButton from './GroceryListToggleButton.jsx';

export default function AuthGroceryWrapper({ ingredients, recipeId }) {
	return (
		<AuthProvider>
			<GroceryListToggleButton ingredients={ingredients} recipeId={recipeId} />
		</AuthProvider>
	);
}
