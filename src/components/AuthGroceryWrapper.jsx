import { AuthProvider } from '../context/AuthContext.jsx';
import AddToGroceryButton from './AddToGroceryButton.jsx';

export default function AuthGroceryWrapper({ ingredients, recipeId }) {
	return (
		<AuthProvider>
			<AddToGroceryButton ingredients={ingredients} recipeId={recipeId} />
		</AuthProvider>
	);
}
