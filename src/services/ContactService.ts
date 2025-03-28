import axios from 'axios';
import { Contact } from '../types/sms';

// Define types
export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactImportResult {
  total: number;
  successful: number;
  failed: number;
  errors?: { row: number; error: string }[];
}

class ContactService {
  private apiURL: string;
  private authToken?: string;

  constructor(apiURL: string = '/api', authToken?: string) {
    this.apiURL = apiURL;
    this.authToken = authToken;
  }

  // Configure the API client with authentication
  private getClient() {
    const client = axios.create({
      baseURL: this.apiURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` })
      }
    });

    return client;
  }

  // Set auth token dynamically
  public setAuthToken(token: string) {
    this.authToken = token;
  }

  // Get all contacts
  public async getContacts(): Promise<Contact[]> {
    try {
      const response = await this.getClient().get('/contacts');
      return response.data.contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  // Get a specific contact
  public async getContact(id: string): Promise<Contact> {
    try {
      const response = await this.getClient().get(`/contacts/${id}`);
      return response.data.contact;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  }

  // Create a new contact
  public async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    try {
      const response = await this.getClient().post('/contacts', contact);
      return response.data.contact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  // Update an existing contact
  public async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    try {
      const response = await this.getClient().put(`/contacts/${id}`, contact);
      return response.data.contact;
    } catch (error) {
      console.error(`Error updating contact ${id}:`, error);
      throw error;
    }
  }

  // Delete a contact
  public async deleteContact(id: string): Promise<void> {
    try {
      await this.getClient().delete(`/contacts/${id}`);
    } catch (error) {
      console.error(`Error deleting contact ${id}:`, error);
      throw error;
    }
  }

  // Update contact opt-in status
  public async updateOptInStatus(id: string, optIn: boolean): Promise<Contact> {
    try {
      const response = await this.getClient().put(`/contacts/${id}/opt-in`, { optIn });
      return response.data.contact;
    } catch (error) {
      console.error(`Error updating opt-in status for contact ${id}:`, error);
      throw error;
    }
  }

  // Get contacts by list
  public async getContactsByList(listId: string): Promise<Contact[]> {
    try {
      const response = await this.getClient().get(`/lists/${listId}/contacts`);
      return response.data.contacts;
    } catch (error) {
      console.error(`Error fetching contacts for list ${listId}:`, error);
      throw error;
    }
  }

  // Get all contact lists
  public async getLists(): Promise<ContactList[]> {
    try {
      const response = await this.getClient().get('/lists');
      return response.data.lists;
    } catch (error) {
      console.error('Error fetching contact lists:', error);
      throw error;
    }
  }

  // Get a specific contact list
  public async getList(id: string): Promise<ContactList> {
    try {
      const response = await this.getClient().get(`/lists/${id}`);
      return response.data.list;
    } catch (error) {
      console.error(`Error fetching contact list ${id}:`, error);
      throw error;
    }
  }

  // Create a new contact list
  public async createList(name: string, description?: string): Promise<ContactList> {
    try {
      const response = await this.getClient().post('/lists', { name, description });
      return response.data.list;
    } catch (error) {
      console.error('Error creating contact list:', error);
      throw error;
    }
  }

  // Update an existing contact list
  public async updateList(id: string, data: { name?: string, description?: string }): Promise<ContactList> {
    try {
      const response = await this.getClient().put(`/lists/${id}`, data);
      return response.data.list;
    } catch (error) {
      console.error(`Error updating contact list ${id}:`, error);
      throw error;
    }
  }

  // Delete a contact list
  public async deleteList(id: string): Promise<void> {
    try {
      await this.getClient().delete(`/lists/${id}`);
    } catch (error) {
      console.error(`Error deleting contact list ${id}:`, error);
      throw error;
    }
  }

  // Add a contact to a list
  public async addContactToList(contactId: string, listId: string): Promise<void> {
    try {
      await this.getClient().post(`/lists/${listId}/contacts`, { contactId });
    } catch (error) {
      console.error(`Error adding contact ${contactId} to list ${listId}:`, error);
      throw error;
    }
  }

  // Remove a contact from a list
  public async removeContactFromList(contactId: string, listId: string): Promise<void> {
    try {
      await this.getClient().delete(`/lists/${listId}/contacts/${contactId}`);
    } catch (error) {
      console.error(`Error removing contact ${contactId} from list ${listId}:`, error);
      throw error;
    }
  }

  // Import contacts from CSV
  public async importContacts(file: File, options?: { listId?: string }): Promise<ContactImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options?.listId) {
        formData.append('listId', options.listId);
      }
      
      const response = await this.getClient().post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.result;
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  }

  // Export contacts to CSV
  public async exportContacts(options?: { listId?: string }): Promise<Blob> {
    try {
      const url = options?.listId 
        ? `/lists/${options.listId}/contacts/export` 
        : '/contacts/export';
      
      const response = await this.getClient().get(url, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting contacts:', error);
      throw error;
    }
  }

  // Get contact message history
  public async getContactMessageHistory(contactId: string): Promise<any[]> {
    try {
      const response = await this.getClient().get(`/contacts/${contactId}/messages`);
      return response.data.messages;
    } catch (error) {
      console.error(`Error fetching message history for contact ${contactId}:`, error);
      throw error;
    }
  }

  // Search contacts
  public async searchContacts(query: string): Promise<Contact[]> {
    try {
      const response = await this.getClient().get('/contacts/search', {
        params: { q: query }
      });
      return response.data.contacts;
    } catch (error) {
      console.error(`Error searching contacts with query "${query}":`, error);
      throw error;
    }
  }

  // Merge lists
  public async mergeLists(targetListId: string, sourceListIds: string[]): Promise<ContactList> {
    try {
      const response = await this.getClient().post(`/lists/${targetListId}/merge`, {
        sourceListIds
      });
      return response.data.list;
    } catch (error) {
      console.error(`Error merging lists into ${targetListId}:`, error);
      throw error;
    }
  }
}

// Create and export a default instance
const contactService = new ContactService();
export default contactService;

// Also export the class for creating custom instances
export { ContactService };