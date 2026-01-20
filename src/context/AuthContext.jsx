import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 1. INITIAL SESSION CHECK
   * Runs once when the app starts. It uses the token in localStorage
   * (via axios interceptor) to verify the user with the backend.
   */
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/user/me');
        // Our axios interceptor returns { data: null } if /me fails 401
        if (response && response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.warn("🔐 AuthContext: Session invalid or expired.");
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  /**
   * 2. LOGIN ACTION
   * Updated to handle the { token, user } response from UserController.java
   */
  const login = async (credentials) => {
    try {
      const res = await api.post('/user/login', credentials);
      const { token, user: userData } = res.data;

      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      throw err; // Re-throw so Login.jsx can catch and show the error message
    }
  };

  /**
   * 3. LOGOUT ACTION
   */
  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      // Always clear local state even if the server request fails
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);