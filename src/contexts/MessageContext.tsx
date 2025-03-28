import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Message } from '../types/sms';

interface MessageContextType {
  selectedMessage: Message | null;
  setSelectedMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  draftMessages: Record<string, string>;
  setDraftMessage: (conversationId: string, content: string) => void;
  clearDraftMessage: (conversationId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
}

export function MessageProvider({ children }: { children: ReactNode }) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [draftMessages, setDraftMessages] = useState<Record<string, string>>({});

  // Log context initialization
  useEffect(() => {
    console.log('MessageContext: Initializing provider', {
      hasSelectedMessage: !!selectedMessage,
      draftCount: Object.keys(draftMessages).length
    });
  }, []);

  const setDraftMessage = useCallback((conversationId: string, content: string) => {
    console.log('MessageContext: Setting draft message', {
      conversationId,
      contentLength: content.length,
      existingDraft: !!draftMessages[conversationId]
    });

    setDraftMessages(prev => {
      const updated = {
        ...prev,
        [conversationId]: content
      };
      console.log('MessageContext: Updated draft messages', {
        totalDrafts: Object.keys(updated).length,
        updatedConversationId: conversationId
      });
      return updated;
    });
  }, []);

  const clearDraftMessage = useCallback((conversationId: string) => {
    console.log('MessageContext: Clearing draft message', {
      conversationId,
      hadDraft: !!draftMessages[conversationId]
    });

    setDraftMessages(prev => {
      const { [conversationId]: removed, ...rest } = prev;
      console.log('MessageContext: Cleared draft message', {
        remainingDrafts: Object.keys(rest).length,
        clearedConversationId: conversationId
      });
      return rest;
    });
  }, []);

  // Log when selected message changes
  useEffect(() => {
    console.log('MessageContext: Selected message changed', {
      messageId: selectedMessage?.id,
      direction: selectedMessage?.direction,
      conversationId: selectedMessage?.conversationId
    });
  }, [selectedMessage]);

  // Log when draft messages change
  useEffect(() => {
    console.log('MessageContext: Draft messages updated', {
      totalDrafts: Object.keys(draftMessages).length,
      draftConversations: Object.keys(draftMessages)
    });
  }, [draftMessages]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedMessage,
    setSelectedMessage,
    draftMessages,
    setDraftMessage,
    clearDraftMessage
  }), [selectedMessage, draftMessages, setDraftMessage, clearDraftMessage]);

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}