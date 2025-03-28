import { Conversation, Message, MessageTemplate, Contact, ContactList } from '../types/sms';
import { getAuth } from 'firebase/auth';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://milea-chatbot.ngrok.io';

const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const archiveConversation = async (conversationId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/archive`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to archive conversation');
    }
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

export const unarchiveConversation = async (conversationId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/unarchive`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to unarchive conversation');
    }
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    throw error;
  }
};

export const smsService = {
  async sendSMS(phoneNumber: string, content: string, conversationId?: string): Promise<Message> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/send-sms`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phoneNumber, content, conversationId })
    });
    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }
    return response.json();
  },

  async fetchConversations(): Promise<Conversation[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/conversations`, {
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }
    return response.json();
  },

  async fetchConversationMessages(conversationId: string): Promise<Message[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/messages`, {
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to fetch conversation messages');
    }
    return response.json();
  },

  async markMessageAsRead(messageId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/messages/${messageId}/read`, {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }
  },

  async markConversationAsRead(conversationId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}/read`, {
      method: 'POST',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to mark conversation as read');
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  },

  async fetchTemplates(): Promise<MessageTemplate[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/templates`, {
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  },

  async createContact(contact: Omit<Contact, 'id'>): Promise<string> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contact)
    });
    if (!response.ok) {
      throw new Error('Failed to create contact');
    }
    const result = await response.json();
    return result.id;
  },

  async updateContact(contactId: string, updates: Partial<Contact>): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/contacts/${contactId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update contact');
    }
  },

  async deleteContact(contactId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/contacts/${contactId}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to delete contact');
    }
  },

  async createList(list: Omit<ContactList, 'id'>): Promise<string> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/lists`, {
      method: 'POST',
      headers,
      body: JSON.stringify(list)
    });
    if (!response.ok) {
      throw new Error('Failed to create list');
    }
    const result = await response.json();
    return result.id;
  },

  async updateList(listId: string, updates: Partial<ContactList>): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/lists/${listId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update list');
    }
  },

  async deleteList(listId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/lists/${listId}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      throw new Error('Failed to delete list');
    }
  }
}; 