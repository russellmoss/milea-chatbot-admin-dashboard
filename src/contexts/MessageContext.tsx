import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const draftMessagesRef = useRef<Record<string, string>>({});
  const [, forceUpdate] = useState({});

  // Log context initialization
  useEffect(() => {
    console.log('MessageContext: Initializing provider', {
      hasSelectedMessage: !!selectedMessage,
      draftCount: Object.keys(draftMessagesRef.current).length
    });
  }, []);

  const setDraftMessage = useCallback((conversationId: string, content: string) => {
    console.log('MessageContext: Setting draft message', {
      conversationId,
      contentLength: content.length,
      existingDraft: !!draftMessagesRef.current[conversationId]
    });

    draftMessagesRef.current = {
      ...draftMessagesRef.current,
      [conversationId]: content
    };
    forceUpdate({});
  }, []);

  const clearDraftMessage = useCallback((conversationId: string) => {
    console.log('MessageContext: Clearing draft message', {
      conversationId,
      hadDraft: !!draftMessagesRef.current[conversationId]
    });

    const { [conversationId]: removed, ...rest } = draftMessagesRef.current;
    draftMessagesRef.current = rest;
    forceUpdate({});
  }, []);

  // Log when selected message changes
  useEffect(() => {
    console.log('MessageContext: Selected message changed', {
      messageId: selectedMessage?.id,
      direction: selectedMessage?.direction,
      conversationId: selectedMessage?.conversationId
    });
  }, [selectedMessage]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    selectedMessage,
    setSelectedMessage,
    draftMessages: draftMessagesRef.current,
    setDraftMessage,
    clearDraftMessage
  }), [selectedMessage, setDraftMessage, clearDraftMessage]);

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}