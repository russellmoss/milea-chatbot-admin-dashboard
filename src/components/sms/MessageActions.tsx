import React, { useState } from 'react';
import { Message } from '../../types/sms';

interface MessageActionsProps {
  message: Message;
  onAction: (action: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onAction
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action: string) => {
    onAction(action);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        title="Message actions"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleAction('copy')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Copy message
            </button>
            <button
              onClick={() => handleAction('forward')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Forward message
            </button>
            {message.direction === 'outbound' && (
              <button
                onClick={() => handleAction('resend')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Resend message
              </button>
            )}
            <button
              onClick={() => handleAction('delete')}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              role="menuitem"
            >
              Delete message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageActions;