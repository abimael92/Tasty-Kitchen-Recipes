import GroceryListToggleButton from './GroceryListToggleButton.jsx';

export default function AuthGroceryWrapper({ ingredients, recipeId }) {
	return <GroceryListToggleButton ingredients={ingredients} recipeId={recipeId} />;
}
