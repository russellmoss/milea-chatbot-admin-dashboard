// SMS and messaging related types

// Conversation represents a thread of messages between the winery and a customer
export interface Conversation {
    id: string;
    phoneNumber: string;
    customerName: string | null;
    lastMessage: string;
    lastMessageTime: string;
    unread: boolean;
    messages: Message[];
  }
  
  // Message represents a single text message in a conversation
  export interface Message {
    id: string;
    direction: 'inbound' | 'outbound';
    content: string;
    timestamp: string;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    mediaUrls?: string[];
  }
  
  // MessageTemplate represents a reusable message template
  export interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    category: string;
  }
  
  // Contact represents a customer or lead in the contact database
  export interface Contact {
    id?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    birthdate?: string;
    tags?: string[];
    notes?: string;
    optIn: boolean;
    lists?: string[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  // ContactList represents a grouping of contacts
  export interface ContactList {
    id: string;
    name: string;
    description?: string;
    contactCount: number;
    createdAt: string;
    updatedAt: string;
  }
  
  // ContactImportResult represents the result of a contact import operation
  export interface ContactImportResult {
    total: number;
    successful: number;
    failed: number;
    errors?: { row: number; error: string }[];
  }
  
  // BulkMessageCampaign represents a campaign to send messages to multiple contacts
  export interface BulkMessageCampaign {
    id: string;
    name: string;
    message: string;
    recipients: {
      contactIds?: string[];
      listIds?: string[];
      phoneNumbers?: string[];
    };
    scheduledTime?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
    stats?: {
      total: number;
      sent: number;
      delivered: number;
      failed: number;
      responses: number;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  // ContactEvent represents an event related to a contact
  export interface ContactEvent {
    id: string;
    contactId: string;
    type: 'message_sent' | 'message_received' | 'opt_in' | 'opt_out' | 'added_to_list' | 'removed_from_list' | 'updated' | 'created';
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }

  // Bulk Message Campaign represents a mass messaging effort
export interface BulkMessageCampaign {
  id: string;
  name: string;
  message: string;
  recipients: {
    contactIds?: string[];
    listIds?: string[];
    phoneNumbers?: string[];
  };
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  stats?: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    responses: number;
  };
  createdAt: string;
  updatedAt: string;
}