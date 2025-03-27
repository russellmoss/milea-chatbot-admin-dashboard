import { Message, Conversation } from '../types/sms';
import { toast } from 'react-hot-toast';

// Function to mark messages as read
export const markMessagesAsRead = (
  conversation: Conversation,
  markAsRead: boolean = true
): Conversation => {
  const updatedMessages = conversation.messages.map(message => ({
    ...message,
    read: markAsRead
  }));

  // Recalculate unread count based on inbound messages
  const unreadCount = markAsRead
    ? 0
    : updatedMessages.filter(m => m.direction === 'inbound').length;

  // Show toast notification
  toast.success(
    markAsRead 
      ? `Marked ${updatedMessages.length} messages as read`
      : `Marked ${updatedMessages.length} messages as unread`,
    { duration: 2000 }
  );

  return {
    ...conversation,
    unreadCount,
    messages: updatedMessages
  };
};

// Function to mark a single message as read
export const markMessageAsRead = (
  conversation: Conversation,
  messageId: string,
  markAsRead: boolean = true
): Conversation => {
  const updatedMessages = conversation.messages.map(message => 
    message.id === messageId ? { ...message, read: markAsRead } : message
  );

  // Recalculate unread count based on inbound messages
  const unreadCount = markAsRead
    ? updatedMessages.filter(m => m.direction === 'inbound' && !m.read).length
    : updatedMessages.filter(m => m.direction === 'inbound').length;

  // Show toast notification
  toast.success(
    markAsRead 
      ? 'Message marked as read'
      : 'Message marked as unread',
    { duration: 2000 }
  );

  return {
    ...conversation,
    unreadCount,
    messages: updatedMessages
  };
};

// Function to update read receipt for an outbound message
export const updateMessageReadReceipt = (
  conversation: Conversation,
  messageId: string,
  readBy: string
): Conversation => {
  const updatedMessages = conversation.messages.map(message => 
    message.id === messageId 
      ? { 
          ...message, 
          status: 'read' as const,
          readAt: new Date().toISOString(),
          readBy
        } 
      : message
  );

  // Show toast notification
  toast.success('Message read receipt updated', { duration: 2000 });

  return {
    ...conversation,
    messages: updatedMessages
  };
};

// Function to check if a message has been read
export const isMessageRead = (message: Message): boolean => {
  return message.readAt !== undefined;
};

// Function to get read receipt timestamp
export const getReadReceiptTimestamp = (message: Message): string | null => {
  return message.readAt || null;
};

// Function to get read receipt recipient
export const getReadReceiptRecipient = (message: Message): string | null => {
  return message.readBy || null;
};

export const archiveConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Archiving conversation...');

    // In a real app, this would be an API call
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the conversation in the database
    const updatedConversation = await updateConversation(conversationId, {
      archived: true,
      archivedAt: new Date().toISOString()
    });

    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success('Conversation archived');

    return updatedConversation;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    toast.error('Failed to archive conversation');
    throw error;
  }
};

export const unarchiveConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    // Show loading toast
    const loadingToast = toast.loading('Moving conversation back to inbox...');

    // In a real app, this would be an API call
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the conversation in the database
    const updatedConversation = await updateConversation(conversationId, {
      archived: false,
      archivedAt: null
    });

    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success('Conversation moved to inbox');

    return updatedConversation;
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    toast.error('Failed to move conversation to inbox');
    throw error;
  }
};

export const toggleConversationArchive = async (conversationId: string, archived: boolean): Promise<Conversation> => {
  try {
    // Show loading toast
    const loadingToast = toast.loading(archived ? 'Archiving conversation...' : 'Moving conversation back to inbox...');

    // In a real app, this would be an API call
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the conversation in the database
    const updatedConversation = await updateConversation(conversationId, {
      archived,
      archivedAt: archived ? new Date().toISOString() : null
    });

    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success(archived ? 'Conversation archived' : 'Conversation moved to inbox');

    return updatedConversation;
  } catch (error) {
    console.error('Error toggling conversation archive status:', error);
    toast.error(archived ? 'Failed to archive conversation' : 'Failed to move conversation to inbox');
    throw error;
  }
};

// Helper function to update conversation in database
const updateConversation = async (conversationId: string, updates: Partial<Conversation>): Promise<Conversation> => {
  // In a real app, this would be an API call to update the conversation
  // For now, we'll just return a mock updated conversation
  return {
    id: conversationId,
    customerName: 'John Doe',
    phoneNumber: '+1234567890',
    messages: [],
    unreadCount: 0,
    lastMessageAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    archived: updates.archived || false,
    deleted: false,
    ...updates
  };
}; 