import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useTransition } from 'react';
import { Message, Conversation } from '../../types/sms';
import MessageActions from './MessageActions';
import { useMessage } from '../../contexts/MessageContext';

interface MessageDisplayProps {
  messages: Message[];
  customerName: string | null;
  phoneNumber: string;
  conversation: Conversation;
  onMarkAsRead: (conversation: Conversation) => void;
  onMessageSelect: (messageId: string) => void;
  onMessageAction: (action: string) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = React.memo(({
  messages,
  customerName,
  phoneNumber,
  conversation,
  onMarkAsRead,
  onMessageSelect,
  onMessageAction
}) => {
  const { setDraftMessage, clearDraftMessage } = useMessage();
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize message groups
  const messageGroups = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const key = isToday(date) ? 'Today' :
                 isYesterday(date) ? 'Yesterday' :
                 format(date, 'MMMM d, yyyy');
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(message);
    });
    return groups;
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle message selection with transition
  const handleMessageSelect = useCallback((messageId: string) => {
    startTransition(() => {
      onMessageSelect(messageId);
    });
  }, [onMessageSelect]);

  // Handle message action with transition
  const handleMessageAction = useCallback((action: string) => {
    startTransition(() => {
      onMessageAction(action);
    });
  }, [onMessageAction]);

  // Mark conversation as read when scrolled to bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        onMarkAsRead(conversation);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [conversation, onMarkAsRead]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-6"
    >
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="sticky top-0 z-10">
            <div className="flex items-center justify-center">
              <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                {date}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {dateMessages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.direction === 'outbound'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  onClick={() => handleMessageSelect(message.id)}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`mt-1 text-xs ${
                    message.direction === 'outbound' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageDisplay.displayName = 'MessageDisplay';

export default MessageDisplay;