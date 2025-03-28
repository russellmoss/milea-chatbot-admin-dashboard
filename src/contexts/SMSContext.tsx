// src/contexts/SMSContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { Conversation, Message, Contact, MessageTemplate } from '../types/sms';
import { mockConversations, mockContacts, mockTemplates } from '../mocks/smsData';
import { toast } from 'react-hot-toast';

interface SMSContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  selectedConversation: Conversation | null;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  contacts: Contact[];
  templates: MessageTemplate[];
  selectedContacts: Contact[];
  setSelectedContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  sendMessage: (content: string, phoneNumber: string, conversationId?: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  handleArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  toggleReadStatus: (conversationId: string) => Promise<void>;
  createContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  lists: { id: string; name: string }[];
  createList: (name: string) => Promise<{ id: string; name: string }>;
  addContactToList: (contactId: string, listId: string) => Promise<void>;
  removeContactFromList: (contactId: string, listId: string) => Promise<void>;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

export const SMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([
    { id: 'wine-club', name: 'Wine Club' },
    { id: 'newsletter', name: 'Newsletter' },
    { id: 'vip', name: 'VIP Customers' }
  ]);

  // Initialize with mock data
  useEffect(() => {
    setConversations(mockConversations);
    setContacts(mockContacts);
    setTemplates(mockTemplates);
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll just use our mock data with a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh with mock data
      setConversations(mockConversations);
      toast.success('Messages refreshed');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
      toast.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, phoneNumber: string, conversationId?: string) => {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        direction: 'outbound',
        content,
        phoneNumber,
        timestamp: new Date().toISOString(),
        status: 'sent',
        read: true,
        conversationId: conversationId || ''
      };
      
      // Find or create conversation
      let convo = conversations.find(c => c.id === conversationId || c.phoneNumber === phoneNumber);
      
      if (convo) {
        // Update existing conversation
        setConversations(prevConversations => 
          prevConversations.map(c => {
            if (c.id === convo?.id) {
              return {
                ...c,
                messages: [...c.messages, newMessage],
                lastMessageAt: newMessage.timestamp,
                timestamp: newMessage.timestamp
              };
            }
            return c;
          })
        );
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          customerName: null,
          phoneNumber,
          messages: [newMessage],
          unreadCount: 0,
          lastMessageAt: newMessage.timestamp,
          timestamp: newMessage.timestamp,
          archived: false,
          deleted: false
        };
        
        setConversations(prev => [newConversation, ...prev]);
        
        // Also select the new conversation
        setSelectedConversation(newConversation);
      }
      
      // Simulate message being delivered after a delay
      setTimeout(() => {
        setConversations(prevConversations => 
          prevConversations.map(c => {
            if (c.id === (convo?.id || `conv_${Date.now()}`)) {
              return {
                ...c,
                messages: c.messages.map(m => {
                  if (m.id === newMessage.id) {
                    return { ...m, status: 'delivered' };
                  }
                  return m;
                })
              };
            }
            return c;
          })
        );
      }, 1000);
      
      return;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }, [conversations]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setConversations(prevConversations => 
        prevConversations.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              unreadCount: 0,
              messages: c.messages.map(m => ({
                ...m,
                read: true
              }))
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw new Error('Failed to mark conversation as read');
    }
  }, []);

  // Mark specific message as read
  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setConversations(prevConversations => 
        prevConversations.map(c => {
          const hasMessage = c.messages.some(m => m.id === messageId);
          if (hasMessage) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === messageId) {
                  return { ...m, read: true };
                }
                return m;
              })
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }, []);

  // Toggle read status for a conversation
  const toggleReadStatus = useCallback(async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;
      
      const isRead = conversation.unreadCount === 0;
      
      if (isRead) {
        // Mark as unread
        setConversations(prevConversations => 
          prevConversations.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                unreadCount: 1
              };
            }
            return c;
          })
        );
      } else {
        // Mark as read
        await markConversationAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error toggling read status:', error);
      throw new Error('Failed to toggle read status');
    }
  }, [conversations, markConversationAsRead]);

  // Archive conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setConversations(prevConversations => 
        prevConversations.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              archived: true,
              archivedAt: new Date().toISOString()
            };
          }
          return c;
        })
      );
      
      // If the archived conversation is currently selected, clear selection
      setSelectedConversation(prev => {
        if (prev?.id === conversationId) {
          return null;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw new Error('Failed to archive conversation');
    }
  }, []);

  // Unarchive conversation
  const unarchiveConversation = useCallback(async (conversationId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setConversations(prevConversations => 
        prevConversations.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              archived: false,
              archivedAt: undefined
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error unarchiving conversation:', error);
      throw new Error('Failed to unarchive conversation');
    }
  }, []);

  // Archive/unarchive toggle
  const handleArchiveToggle = useCallback(async (conversationId: string, archived: boolean) => {
    try {
      if (archived) {
        await archiveConversation(conversationId);
        toast.success('Conversation archived');
      } else {
        await unarchiveConversation(conversationId);
        toast.success('Conversation moved to inbox');
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update conversation');
    }
  }, [archiveConversation, unarchiveConversation]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversations(prevConversations => 
        prevConversations.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              deleted: true
            };
          }
          return c;
        })
      );
      
      // If the deleted conversation is currently selected, clear selection
      setSelectedConversation(prev => {
        if (prev?.id === conversationId) {
          return null;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }, []);

  // Create contact
  const createContact = useCallback(async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newContact: Contact = {
        ...contactData,
        id: `contact_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setContacts(prev => [...prev, newContact]);
      
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }
  }, []);

  // Update contact
  const updateContact = useCallback(async (id: string, contactData: Partial<Contact>) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let updatedContact: Contact | null = null;
      
      setContacts(prev => 
        prev.map(c => {
          if (c.id === id) {
            updatedContact = {
              ...c,
              ...contactData,
              updatedAt: new Date().toISOString()
            };
            return updatedContact;
          }
          return c;
        })
      );
      
      if (!updatedContact) {
        throw new Error('Contact not found');
      }
      
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }
  }, []);

  // Delete contact
  const deleteContact = useCallback(async (id: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw new Error('Failed to delete contact');
    }
  }, []);

  // Create list
  const createList = useCallback(async (name: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newList = { id: `list_${Date.now()}`, name };
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      throw new Error('Failed to create list');
    }
  }, []);

  // Add contact to list
  const addContactToList = useCallback(async (contactId: string, listId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setContacts(prev => 
        prev.map(c => {
          if (c.id === contactId) {
            const updatedLists = c.lists ? [...c.lists] : [];
            if (!updatedLists.includes(listId)) {
              updatedLists.push(listId);
            }
            return {
              ...c,
              lists: updatedLists,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error adding contact to list:', error);
      throw new Error('Failed to add contact to list');
    }
  }, []);

  // Remove contact from list
  const removeContactFromList = useCallback(async (contactId: string, listId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setContacts(prev => 
        prev.map(c => {
          if (c.id === contactId && c.lists) {
            return {
              ...c,
              lists: c.lists.filter(id => id !== listId),
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error removing contact from list:', error);
      throw new Error('Failed to remove contact from list');
    }
  }, []);

  return (
    <SMSContext.Provider
      value={{
        conversations,
        setConversations,
        selectedConversation,
        setSelectedConversation,
        contacts,
        templates,
        selectedContacts,
        setSelectedContacts,
        sendMessage,
        markConversationAsRead,
        markMessageAsRead,
        handleArchiveToggle,
        archiveConversation,
        unarchiveConversation,
        deleteConversation,
        isLoading,
        error,
        fetchMessages,
        toggleReadStatus,
        createContact,
        updateContact,
        deleteContact,
        lists,
        createList,
        addContactToList,
        removeContactFromList
      }}
    >
      {children}
    </SMSContext.Provider>
  );
};

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (context === undefined) {
    throw new Error('useSMS must be used within an SMSProvider');
  }
  return context;
};