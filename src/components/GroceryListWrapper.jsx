import { GroceryListPage } from './GroceryListPage.jsx';

export default function GroceryListWrapper({ recipeId, locale }) {
	return <GroceryListPage recipeId={recipeId} locale={locale} />;
}

