import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Conversation, Message, MessageTemplate, Contact } from '../types/sms';
import { mockSmsService } from '../services/mockSmsService';
import { toast } from 'react-hot-toast';

// Import mock data
import { 
  mockConversations, 
  mockTemplates, 
  mockContacts,
  mockContactLists
} from '../mocks/smsData';

interface SMSContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  templates: MessageTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  contacts: Contact[];
  selectedConversation: Conversation | null;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  sendMessage: (content: string, phoneNumber: string, conversationId?: string) => Promise<Message>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  handleArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export function SMSProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    fetchMessages();
    fetchTemplates();
    fetchContacts();
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setConversations(prevConversations => {
        const conversationIndex = prevConversations.findIndex(
          conv => conv.phoneNumber === message.phoneNumber
        );

        if (conversationIndex === -1) {
          // Create new conversation
          const newConversation: Conversation = {
            id: Date.now().toString(),
            customerName: null,
            phoneNumber: message.phoneNumber || '',
            messages: [message],
            unreadCount: 1,
            lastMessageAt: message.timestamp,
            timestamp: message.timestamp,
            archived: false,
            deleted: false
          };
          return [...prevConversations, newConversation];
        }

        // Update existing conversation
        const updatedConversations = [...prevConversations];
        const conversation = { ...updatedConversations[conversationIndex] };
        conversation.messages = [...conversation.messages, message];
        conversation.lastMessageAt = message.timestamp;
        conversation.unreadCount += message.direction === 'inbound' ? 1 : 0;
        updatedConversations[conversationIndex] = conversation;
        return updatedConversations;
      });
    };

    // Listen for message status updates
    const handleMessageStatusUpdate = (data: { messageId: string; status: 'sent' | 'delivered' | 'read' | 'failed' }) => {
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          const messageIndex = conv.messages.findIndex(msg => msg.id === data.messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...conv.messages];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              status: data.status
            };
            return { ...conv, messages: updatedMessages };
          }
          return conv;
        });
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-status-update', handleMessageStatusUpdate);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-status-update', handleMessageStatusUpdate);
    };
  }, [socket]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockSmsService.getConversations();
      setConversations(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockSmsService.getTemplates();
      setTemplates(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load message templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockSmsService.getContacts();
      setContacts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string, phoneNumber: string, conversationId?: string): Promise<Message> => {
    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      direction: 'outbound',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: true,
      conversationId: conversationId || `conv_${Date.now()}`,
      phoneNumber
    };

    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setConversations(prev => {
        const updated = [...prev];
        const conversationIndex = updated.findIndex(c => c.id === optimisticMessage.conversationId);
        
        if (conversationIndex !== -1) {
          updated[conversationIndex] = {
            ...updated[conversationIndex],
            messages: [...updated[conversationIndex].messages, optimisticMessage],
            lastMessageAt: optimisticMessage.timestamp,
            timestamp: optimisticMessage.timestamp,
            unreadCount: 0
          };
        } else {
          // Create new conversation if it doesn't exist
          const newConversation: Conversation = {
            id: optimisticMessage.conversationId || `conv_${Date.now()}`,
            phoneNumber: phoneNumber || '',
            customerName: 'Unknown',
            messages: [optimisticMessage],
            lastMessageAt: optimisticMessage.timestamp,
            timestamp: optimisticMessage.timestamp,
            unreadCount: 0,
            archived: false,
            deleted: false
          };
          updated.push(newConversation);
        }
        
        return updated;
      });

      const message = await mockSmsService.sendMessage(content, phoneNumber, conversationId);
      
      // Update with real message data
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === optimisticMessage.id ? message : msg
              ),
              lastMessageAt: message.timestamp,
              timestamp: message.timestamp
            };
          }
          return conv;
        });
      });

      toast.success('Message sent successfully');
      return message;
    } catch (error) {
      // Revert optimistic update on error
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === optimisticMessage.conversationId) {
            return {
              ...conv,
              messages: conv.messages.filter(msg => msg.id !== optimisticMessage.id),
              lastMessageAt: conv.messages[conv.messages.length - 1]?.timestamp || conv.timestamp,
              timestamp: conv.messages[conv.messages.length - 1]?.timestamp || conv.timestamp
            };
          }
          return conv;
        });
      });

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to send message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a conversation as read
  const markConversationAsRead = async (conversationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await mockSmsService.markAsRead(conversationId);
      
      // Update conversations state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to mark conversation as read');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a message as read
  const markMessageAsRead = async (messageId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await mockSmsService.markAsRead(messageId);
      
      // Update conversations state
      setConversations(prev => 
        prev.map(conv => ({
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, read: true }
              : msg
          )
        }))
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to mark message as read');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Archive a conversation
  const archiveConversation = async (conversationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, archived: true }
            : conv
        )
      );

      await mockSmsService.archiveConversation(conversationId);
      toast.success('Conversation archived successfully');
    } catch (error) {
      // Revert optimistic update on error
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, archived: false }
            : conv
        )
      );

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to archive conversation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unarchive a conversation
  const unarchiveConversation = async (conversationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, archived: false }
            : conv
        )
      );

      await mockSmsService.unarchiveConversation(conversationId);
      toast.success('Conversation unarchived successfully');
    } catch (error) {
      // Revert optimistic update on error
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, archived: true }
            : conv
        )
      );

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to unarchive conversation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, deleted: true }
            : conv
        )
      );

      await mockSmsService.deleteConversation(conversationId);
      toast.success('Conversation deleted successfully');
    } catch (error) {
      // Revert optimistic update on error
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, deleted: false }
            : conv
        )
      );

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to delete conversation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle archive toggle
  const handleArchiveToggle = async (conversationId: string, archived: boolean): Promise<void> => {
    try {
      if (archived) {
        await archiveConversation(conversationId);
      } else {
        await unarchiveConversation(conversationId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error(`Failed to ${archived ? 'archive' : 'unarchive'} conversation`);
      throw error;
    }
  };

  // Create a new contact
  const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    // Create optimistic contact
    const optimisticContact: Contact = {
      id: `temp_${Date.now()}`,
      ...contact
    };

    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setContacts(prev => [...prev, optimisticContact]);

      const newContact = await mockSmsService.createContact(contact);
      
      // Update with real contact data
      setContacts(prev => 
        prev.map(c => c.id === optimisticContact.id ? newContact : c)
      );
      
      toast.success('Contact created successfully');
      return newContact;
    } catch (error) {
      // Revert optimistic update on error
      setContacts(prev => prev.filter(c => c.id !== optimisticContact.id));

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to create contact');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a contact
  const updateContact = async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setContacts(prev => 
        prev.map(c => c.id === id ? { ...c, ...contact } : c)
      );

      const updatedContact = await mockSmsService.updateContact(id, contact);
      
      // Update with real contact data
      setContacts(prev => 
        prev.map(c => c.id === id ? updatedContact : c)
      );
      
      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (error) {
      // Revert optimistic update on error
      setContacts(prev => 
        prev.map(c => c.id === id ? { ...c } : c)
      );

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to update contact');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a contact
  const deleteContact = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setContacts(prev => prev.filter(c => c.id !== id));

      await mockSmsService.deleteContact(id);
      toast.success('Contact deleted successfully');
    } catch (error) {
      // Revert optimistic update on error
      setContacts(prev => [...prev]);

      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to delete contact');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    conversations,
    setConversations,
    templates,
    setTemplates,
    contacts,
    selectedConversation,
    setSelectedConversation,
    sendMessage,
    markConversationAsRead,
    markMessageAsRead,
    fetchMessages,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    isLoading,
    error,
    handleArchiveToggle
  };

  return (
    <SMSContext.Provider value={value}>
      {children}
    </SMSContext.Provider>
  );
}

export function useSMS() {
  const context = useContext(SMSContext);
  if (context === undefined) {
    throw new Error('useSMS must be used within an SMSProvider');
  }
  return context;
}