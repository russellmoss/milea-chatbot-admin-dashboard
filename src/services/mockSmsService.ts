import { mockConversations, mockContacts, mockTemplates } from '../mocks/smsData';
import { Conversation, Contact, Message, MessageTemplate } from '../types/sms';

// Add delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockSmsService = {
  // Conversations
  getConversations: async (): Promise<Conversation[]> => {
    await delay(800); // Simulate network delay
    return [...mockConversations];
  },
  
  sendMessage: async (content: string, phoneNumber: string, conversationId?: string): Promise<Message> => {
    await delay(500);
    
    // Create new message
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      direction: 'outbound',
      content,
      phoneNumber,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: true,
      conversationId
    };
    
    return newMessage;
  },
  
  markAsRead: async (conversationId: string): Promise<void> => {
    await delay(300);
    // In a real app, this would update the database
    return;
  },
  
  archiveConversation: async (conversationId: string): Promise<void> => {
    await delay(400);
    // In a real app, this would update the database
    return;
  },
  
  unarchiveConversation: async (conversationId: string): Promise<void> => {
    await delay(400);
    // In a real app, this would update the database
    return;
  },
  
  deleteConversation: async (conversationId: string): Promise<void> => {
    await delay(500);
    // In a real app, this would update the database
    return;
  },
  
  // Contacts
  getContacts: async (): Promise<Contact[]> => {
    await delay(700);
    return [...mockContacts];
  },
  
  createContact: async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
    await delay(600);
    
    const newContact: Contact = {
      ...contact,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newContact;
  },
  
  updateContact: async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    await delay(500);
    
    // Find the contact to update
    const existingContact = mockContacts.find(c => c.id === id);
    if (!existingContact) {
      throw new Error('Contact not found');
    }
    
    // Return updated contact
    return {
      ...existingContact,
      ...contact,
      updatedAt: new Date().toISOString()
    };
  },
  
  deleteContact: async (id: string): Promise<void> => {
    await delay(400);
    // In a real app, this would update the database
    return;
  },
  
  // Templates
  getTemplates: async (): Promise<MessageTemplate[]> => {
    await delay(600);
    return [...mockTemplates];
  },
  
  // Simulate random failures to test error handling
  simulateRandomError: async (): Promise<void> => {
    await delay(300);
    if (Math.random() < 0.2) { // 20% chance of failure
      throw new Error('A random error occurred. This is just for testing error handling.');
    }
    return;
  }
}; 