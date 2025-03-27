import React, { useState } from 'react';
import { format } from 'date-fns';
import { Conversation } from '../../types/sms';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onArchiveToggle: (conversationId: string, archived: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onArchiveToggle,
  searchQuery,
  onSearchChange
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  // Filter conversations based on search query and filter status
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.phoneNumber.includes(searchQuery) || 
      (conversation.customerName && conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conversation.messages[conversation.messages.length - 1]?.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && conversation.unreadCount > 0) ||
      (filterStatus === 'read' && conversation.unreadCount === 0);

    return matchesSearch && matchesFilter;
  });

  // Sort conversations by last message time (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return (
    <div className="w-full h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Messages</h2>
          <button 
            onClick={() => {
              // In a real implementation, this would open a modal to enter phone number and message
              const phoneNumber = prompt('Enter phone number (format: +12345678901):');
              if (!phoneNumber) return;
              
              const initialMessage = prompt('Enter your message:');
              if (!initialMessage) return;
              
              // This would normally dispatch to a parent component or context
              console.log(`New conversation with ${phoneNumber}: ${initialMessage}`);
            }}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown"
          >
            New Message
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'unread' | 'read')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="all">All Conversations</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No conversations found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sortedConversations.map((conversation) => (
              <li
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.customerName || conversation.phoneNumber}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveToggle(conversation.id, !conversation.archived);
                    }}
                    className={`p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 ${
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;