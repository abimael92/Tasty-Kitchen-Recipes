// src/components/CommentsSectionWrapper.jsx
import { AuthProvider } from '../context/AuthContext';
import CommentsSection from './CommentsSection';

export default function CommentsSectionWrapper({ recipeId }) {
	return (
		<AuthProvider>
			<CommentsSection recipeId={recipeId} />
		</AuthProvider>
	);
}
