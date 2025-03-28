import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Conversation, Message, MessageTemplate, Contact } from '../types/sms';

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
  sendMessage: (content: string, phoneNumber: string, conversationId?: string) => Promise<any>;
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
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    // In a real app, we would fetch data from an API here
    // For now, we'll just use our mock data
    setConversations(mockConversations);
    setTemplates(mockTemplates);
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

  // Fetch messages - this would normally call an API
  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we'd fetch from the API
      // For mock purposes, we'll just refresh with the same data
      setConversations([...mockConversations]);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch messages');
      setIsLoading(false);
      console.error('Error fetching messages:', err);
    }
  };

  // Send a message
  const sendMessage = async (content: string, phoneNumber: string, conversationId?: string) => {
    if (!content.trim() || !phoneNumber) {
      throw new Error('Message content and phone number are required');
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        direction: 'outbound',
        content,
        phoneNumber,
        timestamp: new Date().toISOString(),
        status: 'sent',
        read: true
      };

      // Find or create conversation
      let foundConversation = false;
      
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv => {
          if ((conversationId && conv.id === conversationId) || (!conversationId && conv.phoneNumber === phoneNumber)) {
            foundConversation = true;
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessageAt: newMessage.timestamp
            };
          }
          return conv;
        });

        // If conversation doesn't exist, create a new one
        if (!foundConversation) {
          const contact = mockContacts.find(c => c.phoneNumber === phoneNumber);
          const newConversation: Conversation = {
            id: `conv_${Date.now()}`,
            customerName: contact ? `${contact.firstName} ${contact.lastName}` : null,
            phoneNumber,
            messages: [newMessage],
            unreadCount: 0,
            lastMessageAt: newMessage.timestamp,
            timestamp: newMessage.timestamp,
            archived: false,
            deleted: false
          };
          return [...updatedConversations, newConversation];
        }

        return updatedConversations;
      });

      // Simulate message status update after a delay
      setTimeout(() => {
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            const messageIndex = conv.messages.findIndex(msg => msg.id === newMessage.id);
            if (messageIndex !== -1) {
              const updatedMessages = [...conv.messages];
              updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                status: 'delivered'
              };
              return { ...conv, messages: updatedMessages };
            }
            return conv;
          });
        });
      }, 2000);

      return { success: true, messageId: newMessage.id, status: 'sent' };
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === conversationId) {
            const updatedMessages = conv.messages.map(msg => {
              if (msg.direction === 'inbound' && !msg.read) {
                return { ...msg, read: true };
              }
              return msg;
            });
            
            return {
              ...conv,
              messages: updatedMessages,
              unreadCount: 0
            };
          }
          return conv;
        });
      });
    } catch (err) {
      console.error('Error marking conversation as read:', err);
      throw err;
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        
        for (let i = 0; i < updatedConversations.length; i++) {
          const conversation = updatedConversations[i];
          const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
          
          if (messageIndex !== -1) {
            const message = conversation.messages[messageIndex];
            
            if (message.direction === 'inbound' && !message.read) {
              const updatedMessages = [...conversation.messages];
              updatedMessages[messageIndex] = {
                ...message,
                read: true,
                readAt: new Date().toISOString()
              };
              
              updatedConversations[i] = {
                ...conversation,
                messages: updatedMessages,
                unreadCount: Math.max(0, conversation.unreadCount - 1)
              };
            }
            break;
          }
        }
        
        return updatedConversations;
      });
    } catch (err) {
      console.error('Error marking message as read:', err);
      throw err;
    }
  };

  // Archive conversation
  const archiveConversation = async (conversationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              archived: true,
              archivedAt: new Date().toISOString()
            };
          }
          return conv;
        });
      });
    } catch (err) {
      console.error('Error archiving conversation:', err);
      throw err;
    }
  };

  // Unarchive conversation
  const unarchiveConversation = async (conversationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              archived: false,
              archivedAt: undefined
            };
          }
          return conv;
        });
      });
    } catch (err) {
      console.error('Error unarchiving conversation:', err);
      throw err;
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              deleted: true
            };
          }
          return conv;
        });
      });
      
      // If the deleted conversation is selected, deselect it
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  };

  // Toggle archive status
  const handleArchiveToggle = async (conversationId: string, archived: boolean) => {
    try {
      if (archived) {
        await archiveConversation(conversationId);
      } else {
        await unarchiveConversation(conversationId);
      }
    } catch (err) {
      console.error('Error toggling archive status:', err);
      throw err;
    }
  };

  const value = {
    conversations,
    setConversations,
    templates,
    setTemplates,
    contacts: mockContacts, // Provide mock contacts
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

  return <SMSContext.Provider value={value}>{children}</SMSContext.Provider>;
}

export function useSMS() {
  const context = useContext(SMSContext);
  if (context === undefined) {
    throw new Error('useSMS must be used within an SMSProvider');
  }
  return context;
}