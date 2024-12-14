'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';
import { useAuth } from './AuthContext';

import { showErrorToast, showSuccessToast } from '@/utils/toast';

interface User {
  _id: string;
  email: string;
  name?: string;
  servers:Server[]
  friends:User[]
  friendRequests:User[]
}

interface Server {
    id:string,
    server_name:string,
    owners:User[],
    members:User[],
}

interface Result {
    _id: string;
    email: string;
    name: string;
    isVerified: boolean;
    friends: boolean;
    pending:boolean;
    mail_verification_token: string;
    createdAt: string;
}

interface UserContextType {
  user: User | null;
  setUser
  fetchUser: () => Promise<User[] | null>;
  searchPeople: (searchName: string) => Promise<Result[] | null>;
  sendFriendRequest :(recieverId:string)=> Promise<void>;
  acceptFriendRequest :(id:string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { accessToken, refreshAccessToken } = useAuth();

  const fetchUser = async () => {
    try {
      const currentToken = accessToken || await refreshAccessToken();

      if (!currentToken) {
        showErrorToast('No valid access token available');
        return;
      }

      const axiosInstance = axios.create({
        baseURL: process.env.SERVER_ADDRESS,
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      const response = await axiosInstance.get('/get_user_info');
      
      setUser(response.data.user);

      return response.data.user
    } catch (error: any) {
      console.log('Failed to fetch user', {
        errorMessage: error.message,
        errorResponse: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            await fetchUser();
            return;
          }
        } catch (refreshError) {
          console.log('Token refresh failed', refreshError);
        }
      }

      setUser(null);
    }
  };

  const searchPeople = async (input: string) => {
    try {
      const currentToken = accessToken || (await refreshAccessToken());
  
      if (!currentToken) {
        console.log('No valid access token available');
        return null;
      }
  
      const axiosInstance = axios.create({
        baseURL: process.env.SERVER_ADDRESS,
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
  
      const response = await axiosInstance.get('/find_people', {
        params: { search_name: input }
      });

      return response.data.result;

    } catch (err: any) {
      console.log("Error fetching people:", err.response?.data || err.message);
      return null;
    }
  };
  

  const sendFriendRequest = async (recieverId:string) => {
    try {
      const currentToken = accessToken || await refreshAccessToken();

      if (!currentToken) {
        showErrorToast('No valid access token available');
        return;
      }

      const axiosInstance = axios.create({
        baseURL: process.env.SERVER_ADDRESS,
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      const response = await axiosInstance.post(`/send_friend_request/${recieverId}`);

      showSuccessToast(response.data.message)

    } catch (error: any) {
      console.log('Failed to fetch user', {
        errorMessage: error.message,
        errorResponse: error.response?.data,
        status: error.response?.status
      });

      showErrorToast(error.response?.data.message)

      if (error.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            await sendFriendRequest(recieverId);
            return;
          }
        } catch (refreshError) {
          console.log('Token refresh failed', refreshError);
        }
      }
    }
  };

  const acceptFriendRequest = async (id:any) => {
    try {
      const currentToken = accessToken || (await refreshAccessToken());
  
      if (!currentToken) {
        console.log('No valid access token available');
        return null;
      }
  
      const axiosInstance = axios.create({
        baseURL: process.env.SERVER_ADDRESS,
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      console.log("accepd id",id)

      const response = await axiosInstance.post(`/accept_friend_request/${id}`);

      fetchUser()

      showSuccessToast(response.data.message)

    } catch (err: any) {
      console.log("Error fetching people:", err.response?.data || err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchUser()
  }, []);

  const contextValue = {
    user,
    setUser,
    fetchUser,
    searchPeople,
    sendFriendRequest,
    acceptFriendRequest
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};