import React from 'react';
import { Conversation } from '../../types/sms';
import { format } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversations: Set<string>;
  onConversationSelect: (conversation: Conversation, event: React.MouseEvent) => void;
  onArchiveToggle: (conversationId: string, archived: boolean) => void;
  searchQuery: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversations,
  onConversationSelect,
  onArchiveToggle,
  searchQuery
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                onClick={(e) => onConversationSelect(conversation, e)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedConversations.has(conversation.id) ? 'bg-gray-50' : ''
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