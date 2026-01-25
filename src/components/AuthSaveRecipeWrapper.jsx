import  SaveRecipeButton  from './SaveRecipeButton.jsx';

export default function AuthSaveRecipeWrapper({ recipeId, locale = 'en' }) {
	return <SaveRecipeButton recipeId={recipeId} locale={locale} />;
}
