import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Message } from '../types/sms';
import { useAuth } from './AuthContext';

interface MessageContextType {
  addIncomingMessage: (message: Message & { phoneNumber: string }) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  const addIncomingMessage = useCallback(async (message: Message & { phoneNumber: string }) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return (
    <MessageContext.Provider value={{ addIncomingMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}; 