import React, { useState } from 'react';
import { Conversation } from '../../types/sms';
import { format } from 'date-fns';

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
  const [showActions, setShowActions] = useState(false);
  
  const formatLastActive = (date: string) => {
    try {
      return format(new Date(date), "MMM d, h:mm a");
    } catch (e) {
      return "Unknown";
    }
  };

  const handleArchiveToggle = async () => {
    try {
      await onArchiveToggle(conversation.id, !conversation.archived);
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        await onDelete(conversation.id);
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
          {conversation.customerName 
            ? `${conversation.customerName.charAt(0)}`
            : '#'}
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {conversation.customerName || conversation.phoneNumber}
          </h2>
          <p className="text-sm text-gray-500">
            Last active: {formatLastActive(conversation.lastMessageAt)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleArchiveToggle}
          className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
          title={conversation.archived ? 'Unarchive' : 'Archive'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </button>
        
        <button
          onClick={onViewContact}
          className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
          title="View Contact"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="More Actions"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    onExport();
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export Conversation
                </button>
                <button
                  onClick={() => {
                    onAddToList();
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Add to List
                </button>
                <button
                  onClick={() => {
                    onBlock();
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Block Number
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;