'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: number;
  nev: string;
  email: string;
  szerep: 'user' | 'admin';
  currency?: string;
  location?: string;
  profile_picture?: string;
  has_completed_onboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, jelszo: string) => Promise<{ success: boolean; error?: string }>;
  register: (nev: string, email: string, jelszo: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, jelszo: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jelszo }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      const newToken = data.token;
      setToken(newToken);
      setUser(data.user);
      setIsLoggedIn(true);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Hiba a bejelentkezésnél' };
    }
  }, []);

  const register = useCallback(async (nev: string, email: string, jelszo: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nev, email, jelszo }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      const newToken = data.token;
      setToken(newToken);
      setUser(data.user);
      setIsLoggedIn(true);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Hiba a regisztrációnál' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isAdmin: user?.szerep === 'admin' || false,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
