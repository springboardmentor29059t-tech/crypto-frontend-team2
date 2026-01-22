
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthStatus, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>(AuthStatus.IDLE);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token) {
                try {
                    // Try to get fresh profile data from server
                    const { getProfile } = await import('./services/api');
                    const freshUser = await getProfile();
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    setUser(freshUser);
                    setStatus(AuthStatus.AUTHENTICATED);
                } catch (e) {
                    console.error("Failed to fetch fresh profile", e);
                    // Fallback to local storage if fetch fails
                    if (savedUser) {
                        try {
                            setUser(JSON.parse(savedUser));
                            setStatus(AuthStatus.AUTHENTICATED);
                        } catch (parseError) {
                            setStatus(AuthStatus.UNAUTHENTICATED);
                        }
                    } else {
                        setStatus(AuthStatus.UNAUTHENTICATED);
                    }
                }
            } else {
                setStatus(AuthStatus.UNAUTHENTICATED);
            }
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setStatus(AuthStatus.AUTHENTICATED);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setStatus(AuthStatus.UNAUTHENTICATED);
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...data };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, status, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
