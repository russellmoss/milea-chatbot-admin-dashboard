// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { Message } from '../types/sms';
import { useSMSContext } from './SMSContext';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addIncomingMessage } = useSMSContext();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get the backend URL from environment variables or use ngrok URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://milea-chatbot.ngrok.io';
    console.log('Connecting to backend at:', backendUrl);

    // Create new socket connection with authentication
    const newSocket = io(backendUrl, {
      path: '/socket.io',
      auth: {
        token: currentUser.getIdToken()
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      secure: process.env.NODE_ENV === 'production',
      rejectUnauthorized: false,
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.io server');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.io server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      setError(error.message);
    });

    newSocket.on('error', (error) => {
      console.error('Socket.io error:', error);
      setError(error.message);
    });

    newSocket.on('new-message', async (message: Message & { phoneNumber: string }) => {
      console.log('Received new message:', message);
      try {
        await addIncomingMessage(message);
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [addIncomingMessage, currentUser]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;