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
  toggleReadStatus: (conversationId: string) => Promise<void>;
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

  // Log context initialization
  useEffect(() => {
    console.log('SMSContext: Initializing provider', {
      hasSocket: !!socket,
      isConnected,
      userId: user?.uid,
      initialConversationsCount: conversations.length,
      initialTemplatesCount: templates.length,
      initialContactsCount: contacts.length
    });
  }, [socket, isConnected, user?.uid]);

  // Load initial data
  useEffect(() => {
    console.log('SMSContext: Loading initial data');
    fetchMessages();
    fetchTemplates();
    fetchContacts();
  }, []);

  // Sort conversations by most recent message
  const sortConversations = (convs: Conversation[]): Conversation[] => {
    return [...convs].sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  };

  // Listen for socket events
  useEffect(() => {
    if (!socket) {
      console.warn('SMSContext: No socket connection available');
      return;
    }

    console.log('SMSContext: Setting up socket event listeners');

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      console.log('SMSContext: Received new message via socket', {
        messageId: message.id,
        direction: message.direction,
        phoneNumber: message.phoneNumber,
        timestamp: message.timestamp
      });

      setConversations(prevConversations => {
        const conversationIndex = prevConversations.findIndex(
          conv => conv.phoneNumber === message.phoneNumber
        );

        if (conversationIndex === -1) {
          console.log('SMSContext: Creating new conversation for message', {
            phoneNumber: message.phoneNumber,
            messageId: message.id
          });
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

        console.log('SMSContext: Updating existing conversation', {
          conversationId: prevConversations[conversationIndex].id,
          messageId: message.id
        });

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
      console.log('SMSContext: Received message status update', {
        messageId: data.messageId,
        newStatus: data.status
      });

      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          const messageIndex = conv.messages.findIndex(msg => msg.id === data.messageId);
          if (messageIndex !== -1) {
            console.log('SMSContext: Updating message status', {
              conversationId: conv.id,
              messageId: data.messageId,
              oldStatus: conv.messages[messageIndex].status,
              newStatus: data.status
            });

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
      console.log('SMSContext: Cleaning up socket event listeners');
      socket.off('new-message', handleNewMessage);
      socket.off('message-status-update', handleMessageStatusUpdate);
    };
  }, [socket]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching messages from mock data...');
      
      // Use mock data directly
      const sortedConversations = sortConversations(mockConversations);
      
      // Verify conversation structure
      console.log('Verifying conversation structure:', {
        totalConversations: sortedConversations.length,
        sampleConversation: sortedConversations[0] ? {
          id: sortedConversations[0].id,
          customerName: sortedConversations[0].customerName,
          phoneNumber: sortedConversations[0].phoneNumber,
          messageCount: sortedConversations[0].messages.length,
          unreadCount: sortedConversations[0].unreadCount,
          lastMessageAt: sortedConversations[0].lastMessageAt,
          timestamp: sortedConversations[0].timestamp,
          archived: sortedConversations[0].archived,
          deleted: sortedConversations[0].deleted
        } : null
      });

      // Verify message structure
      if (sortedConversations.length > 0) {
        const sampleMessage = sortedConversations[0].messages[0];
        console.log('Verifying message structure:', {
          sampleMessage: sampleMessage ? {
            id: sampleMessage.id,
            direction: sampleMessage.direction,
            content: sampleMessage.content,
            phoneNumber: sampleMessage.phoneNumber,
            timestamp: sampleMessage.timestamp,
            status: sampleMessage.status,
            read: sampleMessage.read,
            conversationId: sampleMessage.conversationId
          } : null
        });
      }

      // Verify phone number format
      const invalidPhoneNumbers = sortedConversations.filter(conv => 
        !/^\+1 \(\d{3}\) \d{3}-\d{4}$/.test(conv.phoneNumber)
      );
      
      if (invalidPhoneNumbers.length > 0) {
        console.warn('Found conversations with invalid phone number format:', 
          invalidPhoneNumbers.map(conv => ({
            id: conv.id,
            phoneNumber: conv.phoneNumber
          }))
        );
      }

      // Verify message timestamps
      const invalidTimestamps = sortedConversations.filter(conv => 
        !conv.messages.every(msg => new Date(msg.timestamp).toString() !== 'Invalid Date')
      );
      
      if (invalidTimestamps.length > 0) {
        console.warn('Found messages with invalid timestamps:', 
          invalidTimestamps.map(conv => ({
            id: conv.id,
            messageCount: conv.messages.length
          }))
        );
      }

      setConversations(sortedConversations);
      console.log('Successfully loaded conversations:', {
        total: sortedConversations.length,
        unreadCount: sortedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
        archivedCount: sortedConversations.filter(conv => conv.archived).length,
        deletedCount: sortedConversations.filter(conv => conv.deleted).length
      });
    } catch (error) {
      console.error('Error in fetchMessages:', error);
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
      setTemplates(mockTemplates);
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
      setContacts(mockContacts);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string, phoneNumber: string, conversationId?: string): Promise<Message> => {
    console.log('SMSContext: Attempting to send message', {
      contentLength: content.length,
      phoneNumber,
      conversationId,
      isConnected,
      timestamp: new Date().toISOString()
    });

    if (!isConnected || !socket) {
      console.error('SMSContext: Cannot send message - socket not connected');
      throw new Error('Socket connection not established');
    }

    if (!phoneNumber) {
      console.error('SMSContext: Cannot send message - phone number is required');
      throw new Error('Phone number is required');
    }

    // Create optimistic message with guaranteed conversationId
    const messageConversationId = conversationId || `conv_${Date.now()}`;
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      direction: 'outbound',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: true,
      conversationId: messageConversationId,
      phoneNumber
    };

    console.log('SMSContext: Created optimistic message', {
      messageId: optimisticMessage.id,
      conversationId: optimisticMessage.conversationId
    });

    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      console.log('SMSContext: Updating UI optimistically');
      setConversations(prev => {
        const updated = [...prev];
        const conversationIndex = updated.findIndex(c => c.id === messageConversationId);
        
        if (conversationIndex !== -1) {
          console.log('SMSContext: Found existing conversation, updating messages', {
            conversationId: messageConversationId
          });
          updated[conversationIndex] = {
            ...updated[conversationIndex],
            messages: [...updated[conversationIndex].messages, optimisticMessage],
            lastMessageAt: optimisticMessage.timestamp,
            timestamp: optimisticMessage.timestamp,
            unreadCount: 0
          };
        } else {
          console.log('SMSContext: Creating new conversation for message', {
            conversationId: messageConversationId
          });
          // Create new conversation
          const newConversation: Conversation = {
            id: messageConversationId,
            customerName: null,
            phoneNumber: phoneNumber,
            messages: [optimisticMessage],
            unreadCount: 0,
            lastMessageAt: optimisticMessage.timestamp,
            timestamp: optimisticMessage.timestamp,
            archived: false,
            deleted: false
          };
          updated.push(newConversation);
        }
        return updated;
      });

      // Emit message through socket
      console.log('SMSContext: Emitting message through socket');
      socket.emit('send-message', {
        content,
        phoneNumber,
        conversationId: messageConversationId
      });

      console.log('SMSContext: Message sent successfully');
      return optimisticMessage;
    } catch (error) {
      console.error('SMSContext: Error sending message', {
        error,
        messageId: optimisticMessage.id,
        conversationId: messageConversationId
      });
      setError(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string): Promise<void> => {
    try {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map(msg => ({
                ...msg,
                read: true,
                readAt: new Date().toISOString(),
                readBy: user?.uid
              }))
            };
          }
          return conv;
        });
      });
    } catch (error) {
      toast.error('Failed to mark conversation as read');
      throw error;
    }
  };

  // Toggle read status
  const toggleReadStatus = async (conversationId: string): Promise<void> => {
    try {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            const isRead = conv.unreadCount === 0;
            return {
              ...conv,
              unreadCount: isRead ? 1 : 0,
              messages: conv.messages.map(msg => ({
                ...msg,
                read: !isRead,
                readAt: !isRead ? new Date().toISOString() : undefined,
                readBy: !isRead ? user?.uid : undefined
              }))
            };
          }
          return conv;
        });
      });
    } catch (error) {
      toast.error('Failed to toggle read status');
      throw error;
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string): Promise<void> => {
    try {
      setConversations(prev => {
        return prev.map(conv => {
          const messageIndex = conv.messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...conv.messages];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              read: true,
              readAt: new Date().toISOString(),
              readBy: user?.uid
            };
            
            // Update unread count
            const unreadCount = updatedMessages.filter(msg => !msg.read).length;
            
            return {
              ...conv,
              messages: updatedMessages,
              unreadCount
            };
          }
          return conv;
        });
      });
    } catch (error) {
      toast.error('Failed to mark message as read');
      throw error;
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
    handleArchiveToggle,
    toggleReadStatus
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