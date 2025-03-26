import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Message } from './MessagingInbox';

interface MessageDisplayProps {
  messages: Message[];
  customerName: string | null;
  phoneNumber: string;
  onMarkAsRead: () => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages, customerName, phoneNumber, onMarkAsRead }) => {
  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  // Get message status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
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
      case 'read':
        return (
          <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {Object.keys(groupedMessages).map(date => (
        <div key={date}>
          <div className="flex justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {getDateHeader(date)}
            </div>
          </div>
          
          {groupedMessages[date].map(message => (
            <div 
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                  message.direction === 'outbound' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
                <div className={`text-xs mt-1 flex justify-end items-center ${
                  message.direction === 'outbound' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.timestamp)}
                  {message.direction === 'outbound' && (
                    <span className="ml-1">
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageDisplay;