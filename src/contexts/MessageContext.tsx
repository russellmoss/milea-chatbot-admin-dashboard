import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message } from '../types/sms';

interface MessageContextType {
  selectedMessage: Message | null;
  setSelectedMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  draftMessages: Record<string, string>;
  setDraftMessage: (conversationId: string, content: string) => void;
  clearDraftMessage: (conversationId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [draftMessages, setDraftMessages] = useState<Record<string, string>>({});

  const setDraftMessage = (conversationId: string, content: string) => {
    setDraftMessages(prev => ({
      ...prev,
      [conversationId]: content
    }));
  };

  const clearDraftMessage = (conversationId: string) => {
    setDraftMessages(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[conversationId];
      return newDrafts;
    });
  };

  const value = {
    selectedMessage,
    setSelectedMessage,
    draftMessages,
    setDraftMessage,
    clearDraftMessage
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}