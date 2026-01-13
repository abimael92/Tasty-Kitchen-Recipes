import { AuthProvider } from '../context/AuthContext.jsx';
import  SaveRecipeButton  from './SaveRecipeButton.jsx';

export default function AuthSaveRecipeWrapper({ recipeId, locale = 'en' }) {
	return (
		<AuthProvider>
			<SaveRecipeButton recipeId={recipeId} locale={locale} />
		</AuthProvider>
	);
}
