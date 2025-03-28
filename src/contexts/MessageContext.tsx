// src/contexts/MessageContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface MessageContextType {
  draftMessages: Record<string, string>;
  setDraftMessage: (conversationId: string, message: string) => void;
  clearDraftMessage: (conversationId: string) => void;
  getDraftMessage: (conversationId: string) => string;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load draft messages from localStorage
  const [draftMessages, setDraftMessages] = useState<Record<string, string>>(() => {
    try {
      const savedDrafts = localStorage.getItem('draftMessages');
      return savedDrafts ? JSON.parse(savedDrafts) : {};
    } catch (e) {
      console.error('Error loading draft messages:', e);
      return {};
    }
  });

  // Save draft messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('draftMessages', JSON.stringify(draftMessages));
    } catch (e) {
      console.error('Error saving draft messages:', e);
    }
  }, [draftMessages]);

  // Set a draft message for a conversation
  const setDraftMessage = useCallback((conversationId: string, message: string) => {
    setDraftMessages(prev => ({
      ...prev,
      [conversationId]: message
    }));
  }, []);

  // Clear a draft message for a conversation
  const clearDraftMessage = useCallback((conversationId: string) => {
    setDraftMessages(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[conversationId];
      return newDrafts;
    });
  }, []);

  // Get a draft message for a conversation
  const getDraftMessage = useCallback((conversationId: string) => {
    return draftMessages[conversationId] || '';
  }, [draftMessages]);

  return (
    <MessageContext.Provider
      value={{
        draftMessages,
        setDraftMessage,
        clearDraftMessage,
        getDraftMessage
      }}
    >
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