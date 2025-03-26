import React, { useState } from 'react';
import { format } from 'date-fns';
import { Conversation } from './MessagingInbox';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
  error: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

  // Filter conversations based on search query and filter status
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.phoneNumber.includes(searchQuery) || 
      (conversation.customerName && conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'unread' && conversation.unread) ||
      (filterStatus === 'read' && !conversation.unread);
    
    return matchesSearch && matchesFilter;
  });

  // Sort conversations by last message time (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  // Handle create new conversation
  const handleNewConversation = () => {
    // In a real implementation, this would open a modal to enter phone number and message
    const phoneNumber = prompt('Enter phone number (format: +12345678901):');
    if (!phoneNumber) return;
    
    const initialMessage = prompt('Enter your message:');
    if (!initialMessage) return;
    
    // This would normally dispatch to a parent component or context
    console.log(`New conversation with ${phoneNumber}: ${initialMessage}`);
  };

  return (
    <div className="w-full h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Messages</h2>
          <button 
            onClick={handleNewConversation}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'unread'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-3 py-1 text-sm rounded-md ${
              filterStatus === 'read'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No conversations found
          </div>
        ) : (
          <ul>
            {sortedConversations.map((conversation) => (
              <li 
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
                } ${
                  conversation.unread ? 'font-semibold' : ''
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {conversation.customerName || conversation.phoneNumber}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(conversation.lastMessageTime), 'MM/dd/yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {conversation.lastMessage}
                </p>
                {conversation.unread && (
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-1"></span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ConversationList;