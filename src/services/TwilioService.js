import axios from 'axios';
import { Conversation, Message, MessageTemplate } from './MessagingInbox';

// Define the API service class
class TwilioService {
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

  // Get all conversations
  public async getConversations(): Promise<Conversation[]> {
    try {
      const response = await this.getClient().get('/twilio/conversations');
      return response.data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation
  public async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await this.getClient().get(`/twilio/conversations/${conversationId}/messages`);
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a new message
  public async sendMessage(to: string, body: string, mediaUrls?: string[]): Promise<Message> {
    try {
      const response = await this.getClient().post('/twilio/send', {
        to,
        body,
        mediaUrls
      });
      return response.data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark conversation as read
  public async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await this.getClient().put(`/twilio/conversations/${conversationId}/read`);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  // Get message templates
  public async getTemplates(): Promise<MessageTemplate[]> {
    try {
      const response = await this.getClient().get('/twilio/templates');
      return response.data.templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Create a new template
  public async createTemplate(template: Omit<MessageTemplate, 'id'>): Promise<MessageTemplate> {
    try {
      const response = await this.getClient().post('/twilio/templates', template);
      return response.data.template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Update a template
  public async updateTemplate(id: string, template: Partial<MessageTemplate>): Promise<MessageTemplate> {
    try {
      const response = await this.getClient().put(`/twilio/templates/${id}`, template);
      return response.data.template;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  // Delete a template
  public async deleteTemplate(id: string): Promise<void> {
    try {
      await this.getClient().delete(`/twilio/templates/${id}`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  // Export conversation to CSV format
  public async exportConversation(conversationId: string): Promise<Blob> {
    try {
      const response = await this.getClient().get(`/twilio/conversations/${conversationId}/export`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting conversation:', error);
      throw error;
    }
  }

  // Get customer information
  public async getCustomerInfo(phoneNumber: string): Promise<any> {
    try {
      const response = await this.getClient().get(`/customers/phone/${phoneNumber}`);
      return response.data.customer;
    } catch (error) {
      console.error('Error fetching customer info:', error);
      throw error;
    }
  }

  // Create a new conversation
  public async createConversation(phoneNumber: string, initialMessage: string): Promise<Conversation> {
    try {
      const response = await this.getClient().post('/twilio/conversations', {
        phoneNumber,
        initialMessage
      });
      return response.data.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
}

// Create and export a default instance
const twilioService = new TwilioService();
export default twilioService;

// Also export the class for creating custom instances
export { TwilioService };