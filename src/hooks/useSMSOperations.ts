import { useState, useCallback } from 'react';
import { useSMS } from '../contexts/SMSContext';
import contactService from '../services/ContactService';
import twilioService from '../services/TwilioService';
import { 
  Contact, 
  Conversation, 
  Message, 
  MessageTemplate, 
  ContactList 
} from '../types/sms';

// Custom hook for SMS-related operations
export const useSMSOperations = () => {
  const smsContext = useSMS();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversations
  const listConversations = useCallback(() => {
    return smsContext.conversations;
  }, [smsContext.conversations]);

  const getConversation = useCallback((conversationId: string) => {
    return smsContext.conversations.find(conv => conv.id === conversationId);
  }, [smsContext.conversations]);

  const sendMessage = useCallback(async (content: string, to: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.sendMessage(content, to);
      return true;
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.sendMessage]);

  // Contacts
  const listContacts = useCallback(() => {
    return smsContext.contacts;
  }, [smsContext.contacts]);

  const getContact = useCallback((contactId: string) => {
    return smsContext.contacts.find(contact => contact.id === contactId);
  }, [smsContext.contacts]);

  const createContact = useCallback(async (contactData: Omit<Contact, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.createContact(contactData);
      return true;
    } catch (err) {
      setError('Failed to create contact');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.createContact]);

  const updateContact = useCallback(async (contactId: string, contactData: Partial<Contact>) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.updateContact(contactId, contactData);
      return true;
    } catch (err) {
      setError('Failed to update contact');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.updateContact]);

  const deleteContact = useCallback(async (contactId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.deleteContact(contactId);
      return true;
    } catch (err) {
      setError('Failed to delete contact');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.deleteContact]);

  // Contact Lists
  const listContactLists = useCallback(() => {
    return smsContext.lists || [];
  }, [smsContext.lists]);

  const createContactList = useCallback(async (name: string, description?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.createList(name, description);
      return true;
    } catch (err) {
      setError('Failed to create contact list');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.createList]);

  const addContactToList = useCallback(async (contactId: string, listId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.addContactToList(contactId, listId);
      return true;
    } catch (err) {
      setError('Failed to add contact to list');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.addContactToList]);

  const removeContactFromList = useCallback(async (contactId: string, listId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.removeContactFromList(contactId, listId);
      return true;
    } catch (err) {
      setError('Failed to remove contact from list');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.removeContactFromList]);

  // Import/Export
  const importContacts = useCallback(async (file: File, listId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await contactService.importContacts(file, { listId });
      return result;
    } catch (err) {
      setError('Failed to import contacts');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportContacts = useCallback(async (listId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const blob = await contactService.exportContacts({ listId });
      return blob;
    } catch (err) {
      setError('Failed to export contacts');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Messaging Templates
  const listTemplates = useCallback(() => {
    return smsContext.templates;
  }, [smsContext.templates]);

  const createTemplate = useCallback(async (template: Omit<MessageTemplate, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      // Implement create template logic
      return true;
    } catch (err) {
      setError('Failed to create template');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Opt-in Management
  const toggleOptIn = useCallback(async (contactId: string, optIn: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      await smsContext.toggleContactOptIn(contactId, optIn);
      return true;
    } catch (err) {
      setError('Failed to update opt-in status');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [smsContext.toggleContactOptIn]);

  // Search Functionality
  const searchContacts = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await contactService.searchContacts(query);
      return results;
    } catch (err) {
      setError('Failed to search contacts');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Conversations
    listConversations,
    getConversation,
    sendMessage,

    // Contacts
    listContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,

    // Contact Lists
    listContactLists,
    createContactList,
    addContactToList,
    removeContactFromList,

    // Import/Export
    importContacts,
    exportContacts,

    // Templates
    listTemplates,
    createTemplate,

    // Opt-in
    toggleOptIn,

    // Search
    searchContacts,

    // State Helpers
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

export default useSMSOperations;