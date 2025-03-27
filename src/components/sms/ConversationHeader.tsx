import React, { useState } from 'react';
import { Conversation } from '../../types/sms';

interface ConversationHeaderProps {
  conversation: Conversation;
  onExport: () => void;
  onViewContact?: () => void; // Optional - for viewing contact details
  onBlock?: () => void; // Optional - for blocking a number
  onAddToList?: () => void; // Optional - for adding to a contact list
  onArchiveToggle: (conversationId: string, archived: boolean) => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onExport,
  onViewContact,
  onBlock,
  onAddToList,
  onArchiveToggle
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber: string) => {
    // Basic formatting: +1 (234) 567-8901
    const cleaned = phoneNumber.replace(/\D/g, '');
    let formatted = phoneNumber; // Default to original if can't format
    
    if (cleaned.length === 10) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return formatted;
  };

  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {conversation.customerName || formatPhoneNumber(conversation.phoneNumber)}
        </h3>
        {conversation.customerName && (
          <p className="text-sm text-gray-500">{formatPhoneNumber(conversation.phoneNumber)}</p>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={onExport}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          title="Export conversation"
        >
          <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        
        {onViewContact && (
          <button 
            onClick={onViewContact}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            title="View contact details"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Contact
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            title="More actions"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {onAddToList && (
                  <button
                    onClick={() => {
                      onAddToList();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Add to list
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(conversation.phoneNumber);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Copy phone number
                </button>
                {onBlock && (
                  <button
                    onClick={() => {
                      onBlock();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Block number
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onArchiveToggle(conversation.id, !conversation.archived)}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
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
    </div>
  );
};

export default ConversationHeader;