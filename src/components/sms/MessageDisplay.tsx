import React, { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Message, Conversation } from '../../types/sms';
import MessageActions from './MessageActions';

interface MessageDisplayProps {
  messages: Message[];
  customerName: string | null;
  phoneNumber: string;
  onMarkAsRead: (conversation: Conversation) => void;
  conversation: Conversation;
  onMessageAction: (action: string, messageId: string) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  messages, 
  customerName, 
  phoneNumber, 
  onMarkAsRead,
  conversation,
  onMessageAction
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Auto-mark as read when viewing
  useEffect(() => {
    if (conversation.unreadCount > 0) {
      onMarkAsRead(conversation);
    }
  }, [conversation, onMarkAsRead]);

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;
    setShouldAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  // Format date for header
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
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

  // Sort messages within each group by timestamp
  Object.keys(groupedMessages).forEach(date => {
    groupedMessages[date].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  // No messages 
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start the conversation by sending a message.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto bg-gray-50 p-4"
      onScroll={handleScroll}
    >
      <div className="space-y-8">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
                {formatDateHeader(new Date(date))}
              </span>
            </div>

            {dateMessages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setSelectedMessageId(message.id)}
                onMouseLeave={() => setSelectedMessageId(null)}
              >
                <div className={`relative max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
                  message.direction === 'outbound'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={`flex items-center mt-1 text-xs ${
                    message.direction === 'outbound' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    <span>{formatMessageTime(message.timestamp)}</span>
                    {message.direction === 'outbound' && (
                      <span className="ml-2 flex items-center">
                        {message.status === 'sent' && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {message.status === 'delivered' && (
                          <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {message.status === 'read' && (
                          <svg className="w-3 h-3 ml-0.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>

                  {selectedMessageId === message.id && (
                    <div className="absolute top-2 right-2">
                      <MessageActions
                        message={message}
                        onAction={(action) => onMessageAction(action, message.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageDisplay;