import React from 'react';
import { Conversation } from '../../types/sms';

interface ConversationHeaderProps {
  conversation: Conversation;
  onArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
  onDelete: (conversationId: string) => Promise<void>;
  onExport: () => void;
  onViewContact: () => void;
  onBlock: () => void;
  onAddToList: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onArchiveToggle,
  onDelete,
  onExport,
  onViewContact,
  onBlock,
  onAddToList
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">
          {conversation.customerName || conversation.phoneNumber}
        </h2>
        {conversation.unreadCount > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onArchiveToggle(conversation.id, !conversation.archived)}
          className="p-2 text-gray-600 hover:text-gray-900"
          title={conversation.archived ? 'Unarchive' : 'Archive'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(conversation.id)}
          className="p-2 text-gray-600 hover:text-gray-900"
          title="Delete"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        <button
          onClick={onExport}
          className="p-2 text-gray-600 hover:text-gray-900"
          title="Export"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          onClick={onViewContact}
          className="p-2 text-gray-600 hover:text-gray-900"
          title="View Contact"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
        <button
          onClick={onBlock}
          className="p-2 text-gray-600 hover:text-gray-900"
          title="Block"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </button>
        <button
          onClick={onAddToList}
          className="p-2 text-gray-600 hover:text-gray-900"
          title="Add to List"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConversationHeader;