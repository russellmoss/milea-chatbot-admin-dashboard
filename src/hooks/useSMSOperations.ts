// src/hooks/useSMSOperations.ts
import { useState, useCallback } from 'react';
import { Contact } from '../types/sms';
import { useSMS } from '../contexts/SMSContext';

/**
 * Hook for SMS operations like contact management and messaging
 */
export const useSMSOperations = () => {
  const {
    contacts,
    createContact,
    updateContact,
    deleteContact,
    lists,
    createList,
    addContactToList,
    removeContactFromList,
    isLoading,
    error
  } = useSMS();
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Toggle a contact's opt-in status
  const toggleOptIn = useCallback(async (contactId: string, status: boolean) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }
      
      // Update the contact with the new opt-in status
      await updateContact(contactId, {
        ...contact,
        optIn: status
      });
    } catch (error) {
      console.error('Error toggling opt-in status:', error);
      throw error;
    }
  }, [contacts, updateContact]);
  
  // Select a contact
  const selectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
  }, []);
  
  return {
    contacts,
    selectedContact,
    createContact,
    updateContact,
    deleteContact,
    toggleOptIn,
    lists,
    createList,
    addContactToList,
    removeContactFromList,
    selectContact,
    isLoading,
    error
  };
};