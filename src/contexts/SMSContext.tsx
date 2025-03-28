import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  Conversation, 
  Message, 
  MessageTemplate, 
  Contact, 
  BulkMessageCampaign,
  Campaign,
  ContactList
} from '../types/sms';
import { useAuth } from './AuthContext';
import { useMessage } from './MessageContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  increment, 
  arrayUnion, 
  serverTimestamp, 
  Timestamp, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  limit,
  startAfter,
  DocumentData,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { smsService, archiveConversation, unarchiveConversation } from '../services/smsService';

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
  campaigns: Campaign[];
  campaignsLoading: boolean;
  campaignsError: string | null;
  lists: ContactList[];
  messages: Message[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setSelectedConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
  handleArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
  fetchMessages: () => Promise<void>;
  sendMessage: (phoneNumber: string, content: string, conversationId?: string) => Promise<Message>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: (phoneNumber: string) => Promise<string>;
  archiveConversation: (conversationId: string) => Promise<void>;
  unarchiveConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  createContact: (contact: Omit<Contact, 'id'>) => Promise<string>;
  updateContact: (contactId: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  createTemplate: (template: Omit<MessageTemplate, 'id'>) => Promise<string>;
  updateTemplate: (templateId: string, updates: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  createCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<string>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  createList: (list: Omit<ContactList, 'id'>) => Promise<string>;
  updateList: (listId: string, updates: Partial<ContactList>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
}

// Define the context actions/functions
interface SMSContextActions {
  // Messaging actions
  selectConversation: (conversationId: string) => void;
  createConversation: (phoneNumber: string, initialMessage: string) => Promise<void>;
  sendMessage: (content: string, to: string, conversationId?: string) => Promise<Message>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  addIncomingMessage: (message: Message & { phoneNumber: string }) => Promise<void>;
  
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
  fetchMessages: () => Promise<void>;
}

// Combine state and actions
type SMSContextTypeCombined = SMSContextType & SMSContextActions;

// Create the context
const SMSContext = createContext<SMSContextTypeCombined | undefined>(undefined);

// Create the provider component
interface SMSProviderProps {
  children: ReactNode;
}

interface SMSState {
  conversations: Conversation[];
  contacts: Contact[];
  templates: MessageTemplate[];
  selectedConversation: Conversation | null;
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  campaigns: Campaign[];
  lists: ContactList[];
  messages: Message[];
}

export const SMSProvider: React.FC<SMSProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addIncomingMessage } = useMessage();
  const [state, setState] = useState<SMSState>({
    conversations: MOCK_CONVERSATIONS,
    contacts: MOCK_CONTACTS,
    templates: MOCK_TEMPLATES,
    selectedConversation: null,
    selectedContact: null,
    isLoading: false,
    error: null,
    campaigns: [],
    lists: [],
    messages: []
  });

  // Real-time listener for conversations
  useEffect(() => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Query conversations for the current user
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('userId', '==', user.uid),
        where('deleted', '==', false),
        orderBy('lastMessageAt', 'desc'),
        limit(50) // Limit initial load
      );

      // Set up real-time listener
      const unsubscribeConversations = onSnapshot(
        conversationsQuery,
        async (snapshot) => {
          try {
            const conversations = await Promise.all(
              snapshot.docs.map(async (docSnapshot) => {
                const conversation = docSnapshot.data() as Conversation;
                // Get the latest messages for each conversation
                const messagesQuery = query(
                  collection(db, 'messages'),
                  where('conversationId', '==', docSnapshot.id),
                  orderBy('timestamp', 'desc'),
                  limit(20) // Limit messages per conversation
                );
                
                const messagesSnapshot = await getDocs(messagesQuery);
                const messages = messagesSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as Message[];

                return {
                  ...conversation,
                  id: docSnapshot.id,
                  messages: messages.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  )
                };
              })
            );

            setState(prev => ({
              ...prev,
              conversations,
              isLoading: false
            }));
          } catch (error) {
            console.error('Error processing conversation snapshot:', error);
            setState(prev => ({
              ...prev,
              error: 'Failed to process conversation updates',
              isLoading: false
            }));
          }
        },
        (error) => {
          console.error('Error in conversations listener:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to listen to conversation updates',
            isLoading: false
          }));
        }
      );

      // Cleanup listener on unmount
      return () => {
        unsubscribeConversations();
      };
    } catch (error) {
      console.error('Error setting up conversations listener:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to set up conversation listener',
        isLoading: false
      }));
    }
  }, [user]);

  // Real-time listener for selected conversation messages
  useEffect(() => {
    if (!user || !state.selectedConversation) return;

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', state.selectedConversation.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          try {
            const messages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Message[];

            setState(prev => ({
              ...prev,
              selectedConversation: {
                ...prev.selectedConversation!,
                messages: messages.sort((a, b) => 
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
              }
            }));
          } catch (error) {
            console.error('Error processing message snapshot:', error);
            toast.error('Failed to update messages');
          }
        },
        (error) => {
          console.error('Error in messages listener:', error);
          toast.error('Failed to listen to message updates');
        }
      );

      return () => {
        unsubscribeMessages();
      };
    } catch (error) {
      console.error('Error setting up messages listener:', error);
      toast.error('Failed to set up message listener');
    }
  }, [user, state.selectedConversation?.id]);

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
  
  // Contact actions
  const selectContact = useCallback((contactId: string) => {
    const contact = state.contacts.find(c => c.id === contactId) || null;
    setState(prev => ({ ...prev, selectedContact: contact }));
  }, [state.contacts]);
  
  const createContact = useCallback(async (contact: Omit<Contact, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const contactsRef = collection(db, 'contacts');
      const newContact = {
        ...contact,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(contactsRef, newContact);
      return docRef.id;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }, [user]);
  
  const updateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const contactRef = doc(db, 'contacts', contactId);
      await updateDoc(contactRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }, [user]);
  
  const deleteContact = useCallback(async (contactId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const contactRef = doc(db, 'contacts', contactId);
      await updateDoc(contactRef, {
        deleted: true
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }, [user]);
  
  const toggleContactOptIn = useCallback(async (id: string, optIn: boolean) => {
    try {
      await updateContact(id, { optIn });
    } catch (error) {
      console.error('Error toggling opt-in status:', error);
    }
  }, [updateContact]);
  
  // List actions
  const selectList = useCallback((listName: string) => {
    const list = state.lists.find(l => l.name === listName) || null;
    setState(prev => ({ ...prev, selectedList: list }));
  }, [state.lists]);
  
  const createList = useCallback(async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const listsRef = collection(db, 'lists');
      const newList = {
        name,
        description,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(listsRef, newList);
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }, [user]);
  
  const addContactToList = useCallback(async (contactId: string, listId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const listRef = doc(db, 'lists', listId);
      await updateDoc(listRef, {
        contactIds: arrayUnion(contactId),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding contact to list:', error);
      throw error;
    }
  }, [user]);
  
  const removeContactFromList = useCallback(async (contactId: string, listId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const listRef = doc(db, 'lists', listId);
      await updateDoc(listRef, {
        contactIds: arrayRemove(contactId),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing contact from list:', error);
      throw error;
    }
  }, [user]);
  
  // Reset state (useful for testing or logout)
  const resetState = useCallback(() => {
    setState({
      conversations: [],
      contacts: [],
      templates: [],
      selectedConversation: null,
      selectedContact: null,
      isLoading: true,
      error: null,
      campaigns: [],
      lists: [],
      messages: []
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get the backend URL from environment variables or use ngrok URL
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://milea-chatbot.ngrok.io';
      
      // Fetch messages from the backend
      const response = await fetch(`${backendUrl}/api/messages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const messages = await response.json();
      
      // Update state with fetched messages
      setState(prev => ({
        ...prev,
        conversations: messages,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch messages',
        isLoading: false
      }));
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedConversations = await smsService.fetchConversations();
      setState(prev => ({
        ...prev,
        conversations: fetchedConversations,
        isLoading: false
      }));
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch conversations',
        isLoading: false
      }));
    }
  }, [user]);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    try {
      const fetchedTemplates = await smsService.fetchTemplates();
      setState(prev => ({
        ...prev,
        templates: fetchedTemplates,
        isLoading: false
      }));
    } catch (err) {
      console.error('Error fetching templates:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch templates',
        isLoading: false
      }));
    }
  }, [user]);

  // Combine state and actions into context value
  const value: SMSContextTypeCombined = {
    conversations: state.conversations,
    contacts: state.contacts,
    templates: state.templates,
    selectedConversation: state.selectedConversation,
    selectedContact: state.selectedContact,
    isLoading: state.isLoading,
    error: state.error,
    campaigns: state.campaigns,
    campaignsLoading: false,
    campaignsError: null,
    lists: state.lists,
    messages: state.messages,
    setConversations: (conversations) => {
      if (typeof conversations === 'function') {
        setState(prev => ({ ...prev, conversations: conversations(prev.conversations) }));
      } else {
        setState(prev => ({ ...prev, conversations }));
      }
    },
    setSelectedConversation: (conversation) => {
      if (typeof conversation === 'function') {
        setState(prev => ({ ...prev, selectedConversation: conversation(prev.selectedConversation) }));
      } else {
        setState(prev => ({ ...prev, selectedConversation: conversation }));
      }
    },
    handleArchiveToggle: async (conversationId: string, archived: boolean) => {
      try {
        if (archived) {
          await archiveConversation(conversationId);
        } else {
          await unarchiveConversation(conversationId);
        }
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, archived } : conv
          )
        }));
      } catch (error) {
        console.error('Error toggling conversation archive status:', error);
        throw error;
      }
    },
    selectConversation: async (conversationId: string) => {
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        setState(prev => ({ ...prev, selectedConversation: conversation }));
      }
    },
    createConversation: (async (phoneNumber: string, initialMessage?: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const conversationsRef = collection(db, 'conversations');
        const newConversation = {
          phoneNumber,
          messages: [],
          unreadCount: 0,
          lastMessageAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          archived: false,
          deleted: false,
          userId: user.uid,
          customerName: phoneNumber
        };

        const docRef = await addDoc(conversationsRef, newConversation);
        
        // If initial message is provided, send it
        if (initialMessage) {
          await smsService.sendSMS(phoneNumber, initialMessage, docRef.id);
          return;
        }
        
        return docRef.id;
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
    }) as ((phoneNumber: string) => Promise<string>) & ((phoneNumber: string, initialMessage: string) => Promise<void>),
    sendMessage: async (content: string, to: string, conversationId?: string): Promise<Message> => {
      return await smsService.sendSMS(to, content, conversationId);
    },
    markConversationAsRead: async (conversationId: string) => {
      await smsService.markConversationAsRead(conversationId);
    },
    addIncomingMessage: async (message: Message & { phoneNumber: string }) => {
      setState(prev => {
        const conversationIndex = prev.conversations.findIndex(
          conv => conv.phoneNumber === message.phoneNumber
        );

        if (conversationIndex === -1) {
          // New conversation
          const newConversation: Conversation = {
            id: message.conversationId || '',
            phoneNumber: message.phoneNumber,
            messages: [message],
            unreadCount: 1,
            lastMessageAt: message.timestamp,
            timestamp: message.timestamp,
            archived: false,
            deleted: false,
            userId: user?.uid,
            customerName: message.phoneNumber
          };
          return {
            ...prev,
            conversations: [newConversation, ...prev.conversations],
            selectedConversation: newConversation
          };
        }

        // Update existing conversation
        const updatedConversations = [...prev.conversations];
        const conversation = updatedConversations[conversationIndex];
        conversation.messages.push(message);
        conversation.lastMessageAt = message.timestamp;
        conversation.unreadCount += 1;
        updatedConversations[conversationIndex] = conversation;

        return {
          ...prev,
          conversations: updatedConversations,
          selectedConversation: conversation
        };
      });
    },
    selectContact: (contactId: string) => {
      const contact = state.contacts.find(c => c.id === contactId) || null;
      setState(prev => ({ ...prev, selectedContact: contact }));
    },
    createContact: (async (contact: Omit<Contact, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const contactsRef = collection(db, 'contacts');
        const newContact = {
          ...contact,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(contactsRef, newContact);
        return docRef.id;
      } catch (error) {
        console.error('Error creating contact:', error);
        throw error;
      }
    }) as ((contact: Omit<Contact, 'id'>) => Promise<string>) & ((contact: Omit<Contact, 'id'>) => Promise<void>),
    updateContact: async (id: string, contact: Partial<Contact>) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const contactRef = doc(db, 'contacts', id);
        await updateDoc(contactRef, {
          ...contact,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
      }
    },
    deleteContact: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const contactRef = doc(db, 'contacts', id);
        await updateDoc(contactRef, {
          deleted: true
        });
      } catch (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }
    },
    toggleContactOptIn: async (id: string, optIn: boolean) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const contactRef = doc(db, 'contacts', id);
        await updateDoc(contactRef, {
          optIn,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error toggling contact opt-in:', error);
        throw error;
      }
    },
    selectList: (listName: string) => {
      const list = state.lists.find(l => l.name === listName) || null;
      setState(prev => ({ ...prev, selectedList: list }));
    },
    createList: (async (listOrName: string | Omit<ContactList, 'id'>, description?: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const listsRef = collection(db, 'lists');
        const newList = typeof listOrName === 'string' ? {
          name: listOrName,
          description,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : {
          ...listOrName,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const docRef = await addDoc(listsRef, newList);
        if (typeof listOrName === 'string') {
          return;
        }
        return docRef.id;
      } catch (error) {
        console.error('Error creating list:', error);
        throw error;
      }
    }) as ((list: Omit<ContactList, 'id'>) => Promise<string>) & ((name: string, description?: string) => Promise<void>),
    addContactToList: async (contactId: string, listId: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const listRef = doc(db, 'lists', listId);
        await updateDoc(listRef, {
          contactIds: arrayUnion(contactId),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error adding contact to list:', error);
        throw error;
      }
    },
    removeContactFromList: async (contactId: string, listId: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const listRef = doc(db, 'lists', listId);
        await updateDoc(listRef, {
          contactIds: arrayRemove(contactId),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error removing contact from list:', error);
        throw error;
      }
    },
    resetState: () => {
      setState({
        conversations: [],
        contacts: [],
        templates: [],
        selectedConversation: null,
        selectedContact: null,
        isLoading: true,
        error: null,
        campaigns: [],
        lists: [],
        messages: []
      });
    },
    fetchMessages: async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Get the backend URL from environment variables or use ngrok URL
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://milea-chatbot.ngrok.io';
        
        // Fetch messages from the backend
        const response = await fetch(`${backendUrl}/api/messages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const messages = await response.json();
        
        // Update state with fetched messages
        setState(prev => ({
          ...prev,
          conversations: messages,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch messages',
          isLoading: false
        }));
      }
    },
    markMessageAsRead: async (messageId: string) => {
      await smsService.markMessageAsRead(messageId);
    },
    createTemplate: async () => '',
    updateTemplate: async () => {},
    deleteTemplate: async () => {},
    createCampaign: async () => '',
    updateCampaign: async () => {},
    deleteCampaign: async () => {},
    updateList: async () => {},
    deleteList: async () => {},
    fetchConversations: async () => {
      if (!user) return;
      try {
        const fetchedConversations = await smsService.fetchConversations();
        setState(prev => ({
          ...prev,
          conversations: fetchedConversations,
          isLoading: false
        }));
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to fetch conversations',
          isLoading: false
        }));
      }
    },
    fetchTemplates: async () => {
      if (!user) return;
      try {
        const fetchedTemplates = await smsService.fetchTemplates();
        setState(prev => ({
          ...prev,
          templates: fetchedTemplates,
          isLoading: false
        }));
      } catch (err) {
        console.error('Error fetching templates:', err);
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to fetch templates',
          isLoading: false
        }));
      }
    },
    archiveConversation: async (conversationId: string) => {
      try {
        await archiveConversation(conversationId);
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, archived: true } : conv
          )
        }));
      } catch (error) {
        console.error('Error archiving conversation:', error);
        throw error;
      }
    },
    unarchiveConversation: async (conversationId: string) => {
      try {
        await unarchiveConversation(conversationId);
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv =>
            conv.id === conversationId ? { ...conv, archived: false } : conv
          )
        }));
      } catch (error) {
        console.error('Error unarchiving conversation:', error);
        throw error;
      }
    },
    deleteConversation: async (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
          deleted: true
        });
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.filter(conv => conv.id !== conversationId)
        }));
      } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    }
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