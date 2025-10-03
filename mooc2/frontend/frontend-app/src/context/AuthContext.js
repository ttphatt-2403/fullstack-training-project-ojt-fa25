import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

// Export AuthContext for components that need useContext(AuthContext)
export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (userData) => {
        setUser(userData);  
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    }

    return(
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
