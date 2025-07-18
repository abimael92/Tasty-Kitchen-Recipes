import { AuthProvider } from '../context/AuthContext.jsx';
import FavoriteButton from './FavoriteButton.jsx';

export default function AuthFavoriteWrapper({ recipeId }) {
	return (
		<AuthProvider>
			<FavoriteButton recipeId={recipeId} />
		</AuthProvider>
	);
}
