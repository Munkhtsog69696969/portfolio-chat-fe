'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';

import { useAuth } from './AuthContext';

// Define the context
const SocketContext = createContext<Socket | null>(null);

// Socket provider component
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const {accessToken}=useAuth()

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) return

    const socketInstance:any = io(process.env.SERVER_ADDRESS, {
        auth: {
          token: accessToken
        }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket instance
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    console.log('useSocket must be used within a SocketProvider');
  }
  return context;
};
