import { useState, useEffect } from 'react';
import { Contact, ContactList } from '../types/sms';
import { mockContacts, mockContactLists } from '../mocks/smsData';

export function useSMSOperations() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load mock data on initialization
  useEffect(() => {
    setContacts(mockContacts);
    setLists(mockContactLists);
  }, []);

  // Create a new contact
  const createContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newContact: Contact = {
        ...contactData,
        id: `contact_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setContacts(prevContacts => [...prevContacts, newContact]);
      setIsLoading(false);
      return newContact;
    } catch (err) {
      setIsLoading(false);
      setError('Failed to create contact');
      console.error('Error creating contact:', err);
      throw err;
    }
  };

  // Update an existing contact
  const updateContact = async (contactId: string, contactData: Partial<Contact>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === contactId) {
            return {
              ...contact,
              ...contactData,
              updatedAt: new Date().toISOString()
            };
          }
          return contact;
        });
      });

      // Update selectedContact if it's the one being updated
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => prev ? {
          ...prev,
          ...contactData,
          updatedAt: new Date().toISOString()
        } : null);
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to update contact');
      console.error('Error updating contact:', err);
      throw err;
    }
  };

  // Delete a contact
  const deleteContact = async (contactId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactId));
      
      // Clear selectedContact if it's the one being deleted
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to delete contact');
      console.error('Error deleting contact:', err);
      throw err;
    }
  };

  // Toggle opt-in status for a contact
  const toggleOptIn = async (contactId: string, optIn: boolean) => {
    return updateContact(contactId, { optIn });
  };

  // Create a new contact list
  const createList = async (name: string, description?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newList: ContactList = {
        id: `list_${Date.now()}`,
        name,
        description,
        contacts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setLists(prevLists => [...prevLists, newList]);
      setIsLoading(false);
      return newList;
    } catch (err) {
      setIsLoading(false);
      setError('Failed to create list');
      console.error('Error creating list:', err);
      throw err;
    }
  };

  // Add contact to a list
  const addContactToList = async (contactId: string, listId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update lists
      setLists(prevLists => {
        return prevLists.map(list => {
          if (list.id === listId && !list.contacts.includes(contactId)) {
            return {
              ...list,
              contacts: [...list.contacts, contactId],
              updatedAt: new Date().toISOString()
            };
          }
          return list;
        });
      });

      // Update contact lists array
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === contactId) {
            const lists = contact.lists || [];
            if (!lists.includes(listId)) {
              return {
                ...contact,
                lists: [...lists, listId],
                updatedAt: new Date().toISOString()
              };
            }
          }
          return contact;
        });
      });

      // Update selectedContact if it's the one being updated
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => {
          if (!prev) return null;
          const lists = prev.lists || [];
          if (!lists.includes(listId)) {
            return {
              ...prev,
              lists: [...lists, listId],
              updatedAt: new Date().toISOString()
            };
          }
          return prev;
        });
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to add contact to list');
      console.error('Error adding contact to list:', err);
      throw err;
    }
  };

  // Remove contact from a list
  const removeContactFromList = async (contactId: string, listId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update lists
      setLists(prevLists => {
        return prevLists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              contacts: list.contacts.filter(id => id !== contactId),
              updatedAt: new Date().toISOString()
            };
          }
          return list;
        });
      });

      // Update contact lists array
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === contactId && contact.lists) {
            return {
              ...contact,
              lists: contact.lists.filter(id => id !== listId),
              updatedAt: new Date().toISOString()
            };
          }
          return contact;
        });
      });

      // Update selectedContact if it's the one being updated
      if (selectedContact?.id === contactId && selectedContact.lists) {
        setSelectedContact({
          ...selectedContact,
          lists: selectedContact.lists.filter(id => id !== listId),
          updatedAt: new Date().toISOString()
        });
      }

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to remove contact from list');
      console.error('Error removing contact from list:', err);
      throw err;
    }
  };

  // Select a contact
  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  return {
    contacts,
    selectedContact,
    lists,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    toggleOptIn,
    createList,
    addContactToList,
    removeContactFromList,
    selectContact
  };
}