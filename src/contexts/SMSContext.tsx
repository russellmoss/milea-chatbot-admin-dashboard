import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  Conversation, 
  Message, 
  MessageTemplate, 
  Contact, 
  BulkMessageCampaign 
} from '../types/sms';

// Mock data for development purposes
import { 
  MOCK_CONVERSATIONS, 
  MOCK_TEMPLATES, 
  MOCK_CONTACTS 
} from './mockSMSData';

export interface SMSContextType {
  conversations: Conversation[];
  contacts: Contact[];
  templates: MessageTemplate[];
  selectedConversation: Conversation | null;
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  campaigns: any[]; // Replace with proper Campaign type when available
  campaignsLoading: boolean;
  campaignsError: string | null;
  lists: string[]; // Add lists property
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  handleArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
}

// Define the context actions/functions
interface SMSContextActions {
  // Messaging actions
  selectConversation: (conversationId: string) => void;
  createConversation: (phoneNumber: string, initialMessage: string) => Promise<void>;
  sendMessage: (content: string, to: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  
  // Contact actions
  selectContact: (contactId: string) => void;
  createContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleContactOptIn: (id: string, optIn: boolean) => Promise<void>;
  
  // List actions
  selectList: (listName: string) => void;
  createList: (name: string, description?: string) => Promise<void>;
  addContactToList: (contactId: string, listId: string) => Promise<void>;
  removeContactFromList: (contactId: string, listId: string) => Promise<void>;
  
  // Reset state
  resetState: () => void;
}

// Combine state and actions
type SMSContextTypeCombined = SMSContextType & SMSContextActions;

// Create the context
const SMSContext = createContext<SMSContextTypeCombined | undefined>(undefined);

// Create the provider component
interface SMSProviderProps {
  children: ReactNode;
}

export const SMSProvider: React.FC<SMSProviderProps> = ({ children }) => {
  const [state, setState] = useState<SMSContextTypeCombined>({
    conversations: MOCK_CONVERSATIONS,
    contacts: MOCK_CONTACTS,
    templates: MOCK_TEMPLATES,
    selectedConversation: null,
    selectedContact: null,
    isLoading: false,
    error: null,
    campaigns: [],
    campaignsLoading: false,
    campaignsError: null,
    lists: [],
    setConversations: () => {},
    setSelectedConversation: () => {},
    handleArchiveToggle: async () => {},
    selectConversation: () => {},
    createConversation: async () => {},
    sendMessage: async () => {},
    markConversationAsRead: async () => {},
    selectContact: () => {},
    createContact: async () => {},
    updateContact: async () => {},
    deleteContact: async () => {},
    toggleContactOptIn: async () => {},
    selectList: () => {},
    createList: async () => {},
    addContactToList: async () => {},
    removeContactFromList: async () => {},
    resetState: () => {}
  });

  // Load mock data
  const loadMockData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, campaignsLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        campaigns: [],
        campaignsLoading: false
      }));
    } catch (error) {
      console.error('Error loading mock data:', error);
      setState(prev => ({
        ...prev,
        campaignsError: 'Failed to load campaigns',
        campaignsLoading: false
      }));
    }
  }, []);
  
  // Messaging actions
  const selectConversation = useCallback((conversationId: string) => {
    const conversation = state.conversations.find(c => c.id === conversationId) || null;
    setState(prev => ({ ...prev, selectedConversation: conversation }));
    
    // If conversation has unread messages, mark it as read
    if (conversation && (conversation.unreadCount ?? 0) > 0) {
      markConversationAsRead(conversationId);
    }
  }, [state.conversations]);
  
  const createConversation = useCallback(async (phoneNumber: string, initialMessage: string) => {
    try {
      // Simulate API call
      setState(prev => ({ ...prev, campaignsLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        direction: 'outbound',
        content: initialMessage,
        timestamp: new Date().toISOString(),
        status: 'sent',
        read: false
      };
      
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        phoneNumber,
        customerName: null,
        messages: [newMessage],
        unreadCount: 0,
        lastMessageAt: newMessage.timestamp,
        timestamp: newMessage.timestamp,
        archived: false,
        deleted: false
      };
      
      setState(prev => ({
        ...prev,
        conversations: [newConversation, ...prev.conversations],
        selectedConversation: newConversation,
        campaignsLoading: false
      }));
    } catch (error) {
      console.error('Error creating conversation:', error);
      setState(prev => ({
        ...prev,
        campaignsError: 'Failed to create conversation',
        campaignsLoading: false
      }));
    }
  }, []);
  
  const sendMessage = useCallback(async (content: string, to: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In a real implementation, this would send the message via your API
      console.log(`Sending message to ${to}: ${content}`);
      
      // Create a new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        direction: 'outbound',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        read: false
      };

      // Update conversations with the new message
      setState(prev => {
        const updatedConversations = prev.conversations.map(conv => {
          if (conv.phoneNumber === to) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessageAt: newMessage.timestamp,
              timestamp: newMessage.timestamp
            };
          }
          return conv;
        });

        // If no conversation exists for this number, create a new one
        if (!updatedConversations.some(conv => conv.phoneNumber === to)) {
          const newConversation: Conversation = {
            id: `conv_${Date.now()}`,
            phoneNumber: to,
            customerName: null,
            messages: [newMessage],
            unreadCount: 0,
            lastMessageAt: newMessage.timestamp,
            timestamp: newMessage.timestamp,
            archived: false,
            deleted: false
          };
          updatedConversations.push(newConversation);
        }

        return {
          ...prev,
          conversations: updatedConversations,
          isLoading: false
        };
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to send message. Please try again.',
        isLoading: false
      }));
      console.error('Error sending message:', err);
    }
  }, []);
  
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        ),
        selectedConversation: prev.selectedConversation?.id === conversationId
          ? { ...prev.selectedConversation, unreadCount: 0 }
          : prev.selectedConversation
      }));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, []);
  
  // Contact actions
  const selectContact = useCallback((contactId: string) => {
    const contact = state.contacts.find(c => c.id === contactId) || null;
    setState(prev => ({ ...prev, selectedContact: contact }));
  }, [state.contacts]);
  
  const createContact = useCallback(async (contact: Omit<Contact, 'id'>) => {
    try {
      // Simulate API call
      setState(prev => ({ ...prev, campaignsLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new contact with ID and timestamps
      const newContact: Contact = {
        ...contact,
        id: `contact_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setState(prev => ({
        ...prev,
        contacts: [newContact, ...prev.contacts],
        selectedContact: newContact,
        campaignsLoading: false
      }));
    } catch (error) {
      console.error('Error creating contact:', error);
      setState(prev => ({
        ...prev,
        campaignsError: 'Failed to create contact',
        campaignsLoading: false
      }));
    }
  }, []);
  
  const updateContact = useCallback(async (id: string, contact: Partial<Contact>) => {
    try {
      // Simulate API call
      setState(prev => ({ ...prev, campaignsLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the contact
      const updatedContact = {
        ...state.contacts.find(c => c.id === id),
        ...contact,
        updatedAt: new Date().toISOString()
      } as Contact;
      
      setState(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => c.id === id ? updatedContact : c),
        selectedContact: prev.selectedContact?.id === id ? updatedContact : prev.selectedContact,
        campaignsLoading: false
      }));
    } catch (error) {
      console.error('Error updating contact:', error);
      setState(prev => ({
        ...prev,
        campaignsError: 'Failed to update contact',
        campaignsLoading: false
      }));
    }
  }, [state.contacts]);
  
  const deleteContact = useCallback(async (id: string) => {
    try {
      // Simulate API call
      setState(prev => ({ ...prev, campaignsLoading: true }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        contacts: prev.contacts.filter(c => c.id !== id),
        selectedContact: prev.selectedContact?.id === id ? null : prev.selectedContact,
        campaignsLoading: false
      }));
    } catch (error) {
      console.error('Error deleting contact:', error);
      setState(prev => ({
        ...prev,
        campaignsError: 'Failed to delete contact',
        campaignsLoading: false
      }));
    }
  }, []);
  
  const toggleContactOptIn = useCallback(async (id: string, optIn: boolean) => {
    try {
      await updateContact(id, { optIn });
    } catch (error) {
      console.error('Error toggling opt-in status:', error);
    }
  }, [updateContact]);
  
  // List actions
  const selectList = useCallback((listName: string) => {
    // Implementation needed
  }, []);
  
  const createList = useCallback(async (name: string, description?: string) => {
    // Implementation needed
  }, []);
  
  const addContactToList = useCallback(async (contactId: string, listId: string) => {
    // Implementation needed
  }, []);
  
  const removeContactFromList = useCallback(async (contactId: string, listId: string) => {
    // Implementation needed
  }, []);
  
  // Reset state (useful for testing or logout)
  const resetState = useCallback(() => {
    setState({
      ...state,
      conversations: [],
      contacts: [],
      templates: [],
      selectedConversation: null,
      selectedContact: null,
      isLoading: false,
      error: null,
      campaigns: [],
      campaignsLoading: false,
      campaignsError: null,
      lists: []
    });
  }, [state]);
  
  // Combine state and actions into context value
  const value: SMSContextTypeCombined = {
    ...state,
    selectConversation,
    createConversation,
    sendMessage,
    markConversationAsRead,
    selectContact,
    createContact,
    updateContact,
    deleteContact,
    toggleContactOptIn,
    selectList,
    createList,
    addContactToList,
    removeContactFromList,
    resetState
  };
  
  return (
    <SMSContext.Provider value={value}>
      {children}
    </SMSContext.Provider>
  );
};

// Custom hook to use SMS context
export const useSMS = (): SMSContextTypeCombined => {
  const context = useContext(SMSContext);
  if (context === undefined) {
    throw new Error('useSMS must be used within an SMSProvider');
  }
  return context;
};

export const useSMSContext = () => {
  const context = useContext(SMSContext);
  if (context === undefined) {
    throw new Error('useSMSContext must be used within an SMSProvider');
  }
  return context;
};

export default SMSContext;