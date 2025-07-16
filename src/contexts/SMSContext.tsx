// src/contexts/SMSContext.tsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Conversation, Contact, MessageTemplate } from '../types/sms';
import { mockTemplates } from '../mocks/smsData';
import { toast } from 'react-hot-toast';
import { getAllSms, getAllContacts, sendSms, upsertSms, updateSmsReadStatus, updateSmsArchiveStatus, updateSmsDeleteStatus, updateContact as updateContactApiCall } from '../apis/sms/apis';


interface SMSContextType {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  selectedConversation: Conversation | null;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  contacts: Contact[];
  templates: MessageTemplate[];
  selectedContact: Contact | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<Contact | null>>;
  sendMessage: (content: string, phoneNumber: string, conversationId?: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  handleArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string, deleted: boolean) => Promise<void>;
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<{ id: string; name: string }[]>([
    { id: 'wine-club', name: 'Wine Club' },
    { id: 'newsletter', name: 'Newsletter' },
    { id: 'vip', name: 'VIP Customers' }
  ]);

  // Initialize with mock data
  useEffect(() => {
    const interval = setInterval(() => {
      getAllSms()
        .then(data => {
          setConversations(data);
          if (selectedConversation) {
            const possibleNewSelected = data.find(data => data.id === selectedConversation.id);
            if (possibleNewSelected && possibleNewSelected.messages.length > selectedConversation.messages.length) {
              setSelectedConversation(possibleNewSelected);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching conversations:', err);
          setError('Failed to fetch conversations');
        });
      getAllContacts()
        .then(data => setContacts(data))
        .catch(err => {
          console.error('Error fetching contacts:', err);
          setError('Failed to fetch contacts');
        });
      setTemplates(mockTemplates);
    }, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Fetch messages
  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allSms = await getAllSms();
      setConversations(allSms);
      toast.success('Messages refreshed');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
      toast.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string, phoneNumber: string, conversationId?: string) => {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    try {
      // Simulate API delay
      await sendSms({ to: phoneNumber, message: content });
      const newConversation = await upsertSms({
        id: conversationId!,
        phone: phoneNumber,
        message: content,
        senderRole: 'admin'
      });
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  };

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      // Simulate API delay
      await updateSmsReadStatus(conversationId, true);
      
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
        await updateSmsReadStatus(conversationId, false);
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
      await updateSmsArchiveStatus(conversationId, true);

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
      await updateSmsArchiveStatus(conversationId, false);

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
  const deleteConversation = useCallback(async (conversationId: string, deleted: boolean) => {
    try {
      await updateSmsDeleteStatus(conversationId, deleted);

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
      let updatedContact = await updateContactApiCall(id, contactData);
      
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
      setSelectedContact(updatedContact);

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
    } finally {
      await new Promise(resolve => setTimeout(resolve, 200000000)); // Simulate delay
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
        selectedContact,
        setSelectedContact,
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