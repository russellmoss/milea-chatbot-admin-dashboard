// SMS and messaging related types

// Conversation represents a thread of messages with a single contact
export interface Conversation {
    id: string;
    sessionId: string;
    userId: string;
    commerce7Id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    birthdate?: string;
    messages: Message[];
    unreadCount: number;
    lastMessageAt: string;
    timestamp: string;
    archived: boolean;
    deleted: boolean;
    archivedAt?: string;
}
  
// Message represents a single text message in a conversation
export interface Message {
    id: string;
    direction: 'inbound' | 'outbound';
    content: string;
    phoneNumber?: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'failed' | 'received' | 'read';
    read: boolean;
    userId?: string;
    conversationId?: string;
    readAt?: string;
    readBy?: string;
    error?: string;
}
  
// MessageTemplate represents a reusable message template
export interface MessageTemplate {
    id: string;
    name: string;
    content: string;
    variables: string[];
    category: string;
    createdAt: string;
    updatedAt: string;
    userId?: string;
}
  
// Contact represents a customer or lead in the contact database
export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    optIn: boolean;
    createdAt: string;
    updatedAt: string;
    userId?: string;
    lists?: string[];  // Array of list IDs that this contact belongs to
    tags?: string[];   // Array of tags associated with the contact
    birthdate?: string;  // Optional birthdate field
    notes?: string;    // Optional notes field
}
  
// ContactList represents a grouping of contacts
export interface ContactList {
    id: string;
    name: string;
    description?: string;
    contacts: string[];
    createdAt: string;
    updatedAt: string;
    userId?: string;
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

export interface Folder {
  id: string;
  label: string;
  icon: React.ReactNode;
  filter: (conversation: Conversation) => boolean;
  getBadgeCount: (conversations: Conversation[]) => number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}