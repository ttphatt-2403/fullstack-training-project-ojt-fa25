import React, { createContext, useState, useContext, useEffect } from 'react'
import apiClient from '../services/apiClient';

const AuthContext = createContext()

// Export AuthContext for components that need useContext(AuthContext)
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            console.log('[AuthContext] Found token in localStorage:', token);
            fetchUserProfile();
        } else {
            console.log('[AuthContext] No token found in localStorage');
            setUser(null);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get('http://localhost:5053/api/Auth/me');
            console.log('[AuthContext] /api/Auth/me response:', response.data);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('[AuthContext] Error fetching user profile:', error);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    const login = (userData) => {
        setUser(userData);  
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    return(
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
