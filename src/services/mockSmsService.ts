import { Conversation, Message, MessageTemplate, Contact } from '../types/sms';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random errors (20% chance)
const simulateRandomError = async () => {
  await delay(300);
  if (Math.random() < 0.2) {
    throw new Error('Simulated random error occurred');
  }
};

// Mock data
const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    customerName: 'John Doe',
    phoneNumber: '+1234567890',
    messages: [
      {
        id: 'msg_1',
        direction: 'inbound',
        content: 'Hello, how can I help you?',
        timestamp: new Date().toISOString(),
        status: 'received',
        read: true,
        conversationId: 'conv_1'
      }
    ],
    unreadCount: 0,
    lastMessageAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    archived: false,
    deleted: false
  }
];

const mockContacts: Contact[] = [
  {
    id: 'contact_1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    email: 'john@example.com',
    birthdate: '1990-01-01',
    tags: ['VIP'],
    notes: 'Regular customer',
    optIn: true,
    lists: ['VIP'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockTemplates: MessageTemplate[] = [
  {
    id: 'template_1',
    name: 'Welcome Message',
    content: 'Welcome to our service! How can we help you today?',
    category: 'welcome',
    variables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockSmsService = {
  // Conversation operations
  async getConversations(): Promise<Conversation[]> {
    await delay(800);
    await simulateRandomError();
    return mockConversations;
  },

  async sendMessage(content: string, phoneNumber: string, conversationId?: string): Promise<Message> {
    await delay(500);
    await simulateRandomError();

    const message: Message = {
      id: `msg_${Date.now()}`,
      direction: 'outbound',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      read: true,
      conversationId: conversationId || `conv_${Date.now()}`,
      phoneNumber
    };

    return message;
  },

  async markAsRead(id: string): Promise<void> {
    await delay(300);
    await simulateRandomError();
  },

  async archiveConversation(conversationId: string): Promise<void> {
    await delay(400);
    await simulateRandomError();
  },

  async unarchiveConversation(conversationId: string): Promise<void> {
    await delay(400);
    await simulateRandomError();
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await delay(300);
    await simulateRandomError();
  },

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    await delay(700);
    await simulateRandomError();
    return mockContacts;
  },

  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    await delay(600);
    await simulateRandomError();

    const newContact: Contact = {
      id: `contact_${Date.now()}`,
      ...contact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newContact;
  },

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    await delay(500);
    await simulateRandomError();

    const existingContact = mockContacts.find(c => c.id === id);
    if (!existingContact) {
      throw new Error('Contact not found');
    }

    const updatedContact: Contact = {
      ...existingContact,
      ...contact,
      updatedAt: new Date().toISOString()
    };

    return updatedContact;
  },

  async deleteContact(id: string): Promise<void> {
    await delay(400);
    await simulateRandomError();
  },

  // Template operations
  async getTemplates(): Promise<MessageTemplate[]> {
    await delay(600);
    await simulateRandomError();
    return mockTemplates;
  }
}; 