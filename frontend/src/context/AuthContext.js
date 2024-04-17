import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthentication = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(() => null);
    return response && response.ok;
  }

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await checkAuthentication();
      if (auth) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};