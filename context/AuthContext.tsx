'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { showErrorToast, showSuccessToast } from '@/utils/toast';

interface AuthContextType {
  accessToken: string | null;
  login: (userData: { email: string, password: string }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  const refreshAccessToken = async () => {
    try {
      console.log('Attempting to refresh access token');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/refresh_token`, {}, {
        withCredentials: true
      });

      const { accessToken: newAccessToken } = response.data;
      
      setAccessToken(newAccessToken);
      
      return newAccessToken;

    } catch (error) {
      console.log('Failed to refresh access token', error);
      logout();
      return null;
    }
  };

  const login = async (userData: { email: string, password: string }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/signin`, userData, {
        withCredentials: true
      });

      const { accessToken: newAccessToken } = response.data;

      setAccessToken(newAccessToken);

      router.push('/protected');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      showErrorToast(errorMessage);
      console.log('Login error:', error);
    }
  };

  const logout = async() => {
    setAccessToken(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/logout`, {}, {
        withCredentials: true
      });

      const message = response.data.message || "Logged out";
      showSuccessToast(message);
    } catch(error:any) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      showErrorToast(errorMessage);
      console.log('Logout error:', error);
    }

    router.push('/signin');
  };

  return (
    <AuthContext.Provider value={{ 
      accessToken, 
      login, 
      logout, 
      refreshAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};