import { AuthProvider } from '../context/AuthContext.jsx';
import UserProfile from './UserProfile.jsx';

export default function UserProfileWrapper(props) {
  return (
    <AuthProvider>
      <UserProfile {...props} />
    </AuthProvider>
  );
}
