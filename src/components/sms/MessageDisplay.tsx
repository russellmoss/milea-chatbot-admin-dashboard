import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Message, Conversation } from '../../types/sms';
import { markMessageAsRead } from '../../services/smsService';
import { toast } from 'react-hot-toast';

interface MessageDisplayProps {
  messages: Message[];
  customerName: string | null;
  phoneNumber: string;
  onMarkAsRead: (updatedConversation: Conversation) => void;
  conversation: Conversation;
  onArchive?: (conversation: Conversation) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  messages, 
  customerName, 
  phoneNumber, 
  onMarkAsRead,
  conversation,
  onArchive
}) => {
  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // State for showing keyboard shortcuts helper
  const [showShortcuts, setShowShortcuts] = useState(false);
  // State for tracking message read status changes
  const [readStatusChanges, setReadStatusChanges] = useState<Set<string>>(new Set());

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          // Mark selected message as read
          const selectedMessage = messages.find(m => m.direction === 'inbound' && !m.read);
          if (selectedMessage) {
            handleMessageRead(selectedMessage.id);
          }
          break;
        case 'u':
          // Mark selected message as unread
          const lastReadMessage = messages.find(m => m.direction === 'inbound' && m.read);
          if (lastReadMessage) {
            handleMessageUnread(lastReadMessage.id);
          }
          break;
        case '?':
          // Toggle shortcuts helper
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [messages]);

  // Handle marking a single message as read
  const handleMessageRead = (messageId: string) => {
    try {
      const updatedConversation = markMessageAsRead(conversation, messageId);
      onMarkAsRead(updatedConversation);
      
      // Add visual feedback for read status change
      setReadStatusChanges(prev => new Set([...Array.from(prev), messageId]));
      setTimeout(() => {
        setReadStatusChanges(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(messageId);
          return newSet;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to mark message as read');
      console.error('Error marking message as read:', error);
    }
  };

  // Handle marking a single message as unread
  const handleMessageUnread = (messageId: string) => {
    try {
      const updatedConversation = markMessageAsRead(conversation, messageId, false);
      onMarkAsRead(updatedConversation);
      
      // Add visual feedback for unread status change
      setReadStatusChanges(prev => new Set([...Array.from(prev), messageId]));
      setTimeout(() => {
        setReadStatusChanges(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(messageId);
          return newSet;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to mark message as unread');
      console.error('Error marking message as unread:', error);
    }
  };

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  // Get message status text with read receipt
  const getStatusText = (message: Message) => {
    if (message.direction !== 'outbound') return null;
    
    if (message.readAt) {
      return `Read ${format(new Date(message.readAt), 'MMM d, h:mm a')}`;
    }
    
    switch (message.status) {
      case 'sent': return 'Sent';
      case 'delivered': return 'Delivered';
      case 'read': return 'Read';
      case 'failed': return 'Failed';
      default: return null;
    }
  };

  // Get message status icon with read receipt
  const getStatusIcon = (message: Message) => {
    if (message.direction !== 'outbound') return null;

    if (message.readAt) {
      return (
        <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    switch (message.status) {
      case 'sent':
        return (
          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = messages.reduce((groups, message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as { [date: string]: Message[] });

  // Get date header label
  const getDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {customerName || phoneNumber}
            </h2>
            {customerName && (
              <p className="text-sm text-gray-500">{phoneNumber}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onArchive && (
              <button
                onClick={() => onArchive(conversation)}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors duration-150 ${
                  conversation.archived ? 'text-primary' : 'text-gray-400'
                }`}
                title={conversation.archived ? 'Unarchive conversation' : 'Archive conversation'}
              >
                <svg 
                  className="w-5 h-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts helper */}
      {showShortcuts && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Keyboard Shortcuts</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> Mark message as read</li>
            <li><kbd className="px-2 py-1 bg-gray-100 rounded">U</kbd> Mark message as unread</li>
            <li><kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd> Toggle shortcuts</li>
          </ul>
        </div>
      )}

      {/* Messages container */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.direction === 'inbound' ? 'justify-start' : 'justify-end'
              }`}
              onClick={() => message.direction === 'inbound' && !message.read && handleMessageRead(message.id)}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 transition-all duration-300 ${
                  message.direction === 'inbound'
                    ? message.read
                      ? 'bg-gray-100' // Read inbound messages
                      : 'bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100' // Unread inbound messages
                    : message.read
                      ? 'bg-primary/10' // Read outbound messages
                      : 'bg-primary/20 border border-primary/30' // Unread outbound messages
                } ${
                  readStatusChanges.has(message.id)
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : ''
                }`}
              >
                <p className="text-sm text-gray-800">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.direction === 'outbound' && (
                    <div className="flex items-center space-x-1 ml-2">
                      {getStatusIcon(message)}
                      <span className={`text-xs ${
                        message.readAt ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {getStatusText(message)}
                      </span>
                    </div>
                  )}
                  {message.direction === 'inbound' && !message.read && (
                    <span className="text-xs text-blue-500 ml-2">New</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">?</kbd> for shortcuts
        </div>
      </div>
    </div>
  );
};

export default MessageDisplay;