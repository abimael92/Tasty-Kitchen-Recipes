// src/components/AuthFavoriteWrapper.jsx
import React from 'react';
import { AuthProvider } from '../context/AuthContext.jsx';

export default function AuthFavoriteWrapper({ children }) {
	return <AuthProvider>{children}</AuthProvider>;
}
