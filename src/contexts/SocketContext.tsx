// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Message } from '../types/sms';
import { useMessage } from './MessageContext';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
  disconnect: () => void;
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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { addIncomingMessage } = useMessage();
  const { currentUser } = useAuth();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000;

  const createSocket = useCallback(async () => {
    if (!currentUser) return null;

    try {
      const token = await currentUser.getIdToken();
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://milea-chatbot.ngrok.io';

      const newSocket = io(backendUrl, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: false,
        secure: process.env.NODE_ENV === 'production',
        rejectUnauthorized: false,
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.io server');
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
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

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}/${MAX_RECONNECT_ATTEMPTS}`);
        setReconnectAttempts(attemptNumber);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Failed to reconnect to Socket.io server');
        setError('Failed to reconnect to server');
        setIsConnected(false);
      });

      // Handle new messages
      newSocket.on('new-message', async (message: Message & { phoneNumber: string }) => {
        console.log('Received new message:', message);
        try {
          await addIncomingMessage(message);
        } catch (error) {
          console.error('Error handling new message:', error);
        }
      });

      // Handle message status updates
      newSocket.on('message-status-update', ({ messageId, status }: { messageId: string; status: Message['status'] }) => {
        console.log('Message status updated:', messageId, status);
      });

      // Handle conversation updates
      newSocket.on('conversation-update', (conversationId: string) => {
        console.log('Conversation updated:', conversationId);
      });

      return newSocket;
    } catch (error) {
      console.error('Error creating socket connection:', error);
      setError('Failed to create socket connection');
      return null;
    }
  }, [currentUser, addIncomingMessage]);

  const connect = useCallback(async () => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = await createSocket();
    if (newSocket) {
      setSocket(newSocket);
    }
  }, [socket, createSocket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      connect();
    }
  }, [connect, reconnectAttempts]);

  useEffect(() => {
    let mounted = true;

    if (currentUser && !socket) {
      connect();
    }

    return () => {
      mounted = false;
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [currentUser, socket, connect]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error, reconnect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;