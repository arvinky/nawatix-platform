import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { axiosClient } from '../api/axiosClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('athletix_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('athletix_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await axiosClient.get<any, User>('/api/auth/profile');
        setUser(profile);
        localStorage.setItem('athletix_user', JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to verify session token:', e);
        localStorage.removeItem('athletix_token');
        localStorage.removeItem('athletix_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('athletix_token', token);
    localStorage.setItem('athletix_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('athletix_token');
    localStorage.removeItem('athletix_user');
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('athletix_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
