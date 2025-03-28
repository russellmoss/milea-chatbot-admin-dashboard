// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate authentication initialization
  useEffect(() => {
    // Check if user is already logged in (saved in localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    // Simulate auth state change delay
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);

  // Simulate login functionality
  const login = async (email: string, password: string) => {
    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Simulate API call
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const user: User = {
        uid: 'mock-user-id-123',
        email: email,
        displayName: email.split('@')[0]
      };
      
      // Update state and localStorage
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } finally {
      setLoading(false);
    }
  };

  // Simulate logout functionality
  const logout = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user data
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    user: currentUser, // Alias for consistency
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};