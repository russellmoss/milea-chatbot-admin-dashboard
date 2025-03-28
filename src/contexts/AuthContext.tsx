import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Simple mock user type
interface User {
  uid: string;
  email: string;
  displayName: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any valid-looking email/password works
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Invalid email or password');
      }
      
      // Set mock user
      const mockUser: User = {
        uid: 'user123',
        email,
        displayName: email.split('@')[0]
      };
      
      setCurrentUser(mockUser);
      // Save to session storage for persistence
      sessionStorage.setItem('mockUser', JSON.stringify(mockUser));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user
      setCurrentUser(null);
      sessionStorage.removeItem('mockUser');
      
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load user from session storage on initial render
  useEffect(() => {
    const savedUser = sessionStorage.getItem('mockUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}