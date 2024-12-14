'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Server {
  _id: string;
  server_name: string;
}

interface UpdateServerParams{
    serverId:string
    userId:string
}


interface ServerContextType {
  servers: Server[] | null;
  createServer: (serverData: Partial<Server>) => Promise<void>;
  getServerInfo: (serverId: string) => Promise<Server | null>;
  addPeopleToServer: (params: UpdateServerParams) => Promise<Server | null>;
  promoteToAdmin :(params:UpdateServerParams) => Promise<Server | null>;
  kickUser :(params:UpdateServerParams) => Promise<Server | null>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

const createAxiosInstance = (token: string) => {
  return axios.create({
    baseURL: process.env.SERVER_ADDRESS,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const ServerProvider = ({ children }: { children: ReactNode }) => {
//   const [servers, setServers] = useState<Server[] | null>(null);
  const { accessToken, refreshAccessToken } = useAuth();

  const createServer = async (serverData: Partial<Server>) => {
    try {
      const currentToken = accessToken || (await refreshAccessToken());
      if (!currentToken) throw new Error('No valid access token available');

      const axiosInstance = createAxiosInstance(currentToken);
      const response = await axiosInstance.post('/create_new_server', serverData);

    //   setServers((prev) => [...(prev || []), response.data.server]);
      showSuccessToast(response.data.message);
    } catch (error: any) {
      console.error('Failed to create server', error);
      showErrorToast(error.response?.data?.message || 'Failed to create server');
      throw error;
    }
  };

  const getServerInfo = async (serverId: string): Promise<Server | null> => {
    try {
      const currentToken = accessToken || (await refreshAccessToken());
      if (!currentToken) throw new Error('No valid access token available');

      const axiosInstance = createAxiosInstance(currentToken);
      const response = await axiosInstance.get('/get_server_info', { params: { serverId } });

      return response.data.server;
    } catch (error: any) {
      console.error('Failed to fetch server info', error);
      showErrorToast(error.response?.data?.message || 'Failed to fetch server info');
      throw error;
    }
  };

  const addPeopleToServer = async ({ serverId, userId }: UpdateServerParams): Promise<Server | null> => {
    try {
      const currentToken = accessToken || (await refreshAccessToken());
      if (!currentToken) throw new Error('No valid access token available');

      const axiosInstance = createAxiosInstance(currentToken);
      const response = await axiosInstance.put('/add_people', { serverId, userToAddId:userId })

      showSuccessToast(response.data.message || 'User successfully added!');
      return response.data.server;
    } catch (error: any) {
      console.error('Failed to add user to server', error);
      showErrorToast(error.response?.data?.message || 'Failed to add user');
      throw error;
    }
  };

  const promoteToAdmin=async({serverId, userId} : UpdateServerParams): Promise<Server | null> =>{
    try {
        const currentToken = accessToken || (await refreshAccessToken());
        if (!currentToken) throw new Error('No valid access token available');

        const axiosInstance = createAxiosInstance(currentToken);

        const response=await axiosInstance.put("/promote_to_admin", {
            userToPromoteId:userId,
            serverId
        })

        showSuccessToast(response.data.message || 'User successfully promoted to admin!');

        return response.data.server;
        
    } catch (error: any) {
        console.error('Failed to add user to server', error);
        showErrorToast(error.response?.data?.message || 'Failed to promote user');
        throw error;
    }
  }

  const kickUser=async({serverId, userId} : UpdateServerParams): Promise<Server | null> =>{
    try {
        const currentToken = accessToken || (await refreshAccessToken());
        if (!currentToken) throw new Error('No valid access token available');

        const axiosInstance = createAxiosInstance(currentToken);

        const response=await axiosInstance.put("/kick_people", {
            userToKickId:userId,
            serverId
        })

        showSuccessToast(response.data.message || 'User successfully promoted to admin!');

        return response.data.server;
        
    } catch (error: any) {
        console.error('Failed to add user to server', error);
        showErrorToast(error.response?.data?.message || 'Failed to promote user');
        throw error;
    }
  }

  return (
    <ServerContext.Provider value={{ createServer, getServerInfo, addPeopleToServer, promoteToAdmin, kickUser }}>
      {children}
    </ServerContext.Provider>
  );
};

// Custom hook to use the ServerContext
export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) throw new Error('useServer must be used within a ServerProvider');
  return context;
};
