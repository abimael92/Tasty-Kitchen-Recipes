// src/components/AuthProvider.jsx
import { createContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const token = document.cookie.split('token=')[1];
		if (token) {
			setIsAuthenticated(true);
			setUser({ email: 'user@example.com' }); // Replace with actual user data from API
		}
	}, []);

	return (
		<AuthContext.Provider value={{ isAuthenticated, user }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
