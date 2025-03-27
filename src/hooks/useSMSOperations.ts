import { useState, useCallback } from 'react';
import { useSMS } from '../contexts/SMSContext';
import contactService from '../services/ContactService';
import { sendSMS } from '../services/TwilioService';
import { 
  Contact, 
  Conversation, 
  Message, 
  MessageTemplate, 
  ContactList,
  BulkMessageCampaign
} from '../types/sms';

// Custom hook for SMS-related operations
export const useSMSOperations = () => {
  const {
    contacts,
    selectedContact,
    createContact,
    updateContact,
    deleteContact,
    toggleContactOptIn,
    lists,
    createList,
    addContactToList,
    removeContactFromList,
    conversations,
    sendMessage: contextSendMessage,
    templates
  } = useSMS();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversations
  const listConversations = useCallback(() => {
    return conversations;
  }, [conversations]);

  const getConversation = useCallback((conversationId: string) => {
    return conversations.find((conv: Conversation) => conv.id === conversationId);
  }, [conversations]);

  const sendMessage = useCallback(async (content: string, to: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await contextSendMessage(content, to);
      return true;
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contextSendMessage]);

  // Contact Lists
  const listContactLists = useCallback(() => {
    return lists || [];
  }, [lists]);

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
    return templates;
  }, [templates]);

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

  const handleCreateContact = useCallback(async (contact: Omit<Contact, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      await createContact(contact);
    } catch (err) {
      setError('Failed to create contact');
      console.error('Error creating contact:', err);
    } finally {
      setIsLoading(false);
    }
  }, [createContact]);

  const handleUpdateContact = useCallback(async (id: string, contact: Partial<Contact>) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateContact(id, contact);
    } catch (err) {
      setError('Failed to update contact');
      console.error('Error updating contact:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateContact]);

  const handleDeleteContact = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteContact(id);
    } catch (err) {
      setError('Failed to delete contact');
      console.error('Error deleting contact:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deleteContact]);

  const handleToggleOptIn = useCallback(async (id: string, optIn: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      await toggleContactOptIn(id, optIn);
    } catch (err) {
      setError('Failed to update opt-in status');
      console.error('Error toggling opt-in:', err);
    } finally {
      setIsLoading(false);
    }
  }, [toggleContactOptIn]);

  const handleCreateList = useCallback(async (name: string, description?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await createList(name, description);
    } catch (err) {
      setError('Failed to create list');
      console.error('Error creating list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [createList]);

  const handleAddContactToList = useCallback(async (contactId: string, listId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await addContactToList(contactId, listId);
    } catch (err) {
      setError('Failed to add contact to list');
      console.error('Error adding contact to list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [addContactToList]);

  const handleRemoveContactFromList = useCallback(async (contactId: string, listId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await removeContactFromList(contactId, listId);
    } catch (err) {
      setError('Failed to remove contact from list');
      console.error('Error removing contact from list:', err);
    } finally {
      setIsLoading(false);
    }
  }, [removeContactFromList]);

  return {
    // Conversations
    listConversations,
    getConversation,
    sendMessage,

    // Contacts
    contacts,
    selectedContact,
    createContact: handleCreateContact,
    updateContact: handleUpdateContact,
    deleteContact: handleDeleteContact,

    // Contact Lists
    lists,
    listContactLists,
    createList: handleCreateList,
    addContactToList: handleAddContactToList,
    removeContactFromList: handleRemoveContactFromList,

    // Import/Export
    importContacts,
    exportContacts,

    // Templates
    listTemplates,
    createTemplate,

    // Opt-in
    toggleOptIn: handleToggleOptIn,

    // Search
    searchContacts,

    // State Helpers
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

export default useSMSOperations;