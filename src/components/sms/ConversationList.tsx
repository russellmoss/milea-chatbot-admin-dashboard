import React, { useState, useEffect } from 'react';
import { Conversation } from '../../types/sms';
import { format, isToday, isYesterday } from 'date-fns';
import { useSMS } from '../../contexts/SMSContext';
import ContextMenu from '../common/ContextMenu';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversations: Set<string>;
  onConversationSelect: (conversation: Conversation, event: React.MouseEvent) => void;
  onArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
  searchQuery: string;
  focusedIndex: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversations,
  onConversationSelect,
  onArchiveToggle,
  searchQuery,
  focusedIndex
}) => {
  const { markConversationAsRead, toggleReadStatus, deleteConversation, contacts } = useSMS();
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    conversation: Conversation;
    position: { x: number; y: number };
  } | null>(null);

  // Log initial props
  useEffect(() => {
    console.log('ConversationList: Initialized with props', {
      totalConversations: conversations.length,
      selectedCount: selectedConversations.size,
      searchQuery,
      focusedIndex,
      contactsCount: contacts.length
    });
  }, [conversations.length, selectedConversations.size, searchQuery, focusedIndex, contacts.length]);

  const formatTimestamp = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'h:mm a');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMM d');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    console.log('ConversationList: Context menu opened', {
      conversationId: conversation.id,
      customerName: conversation.customerName,
      position: { x: e.clientX, y: e.clientY }
    });
    setContextMenu({
      conversation,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleAddToContacts = (conversation: Conversation) => {
    console.log('ConversationList: Adding to contacts', {
      conversationId: conversation.id,
      phoneNumber: conversation.phoneNumber,
      customerName: conversation.customerName
    });
    // TODO: Implement add to contacts functionality
  };

  const isContactExists = (phoneNumber: string) => {
    return contacts.some(contact => contact.phoneNumber === phoneNumber);
  };

  const handleConversationClick = (conversation: Conversation, event: React.MouseEvent) => {
    console.log('ConversationList: Conversation clicked', {
      conversationId: conversation.id,
      customerName: conversation.customerName,
      isSelected: selectedConversations.has(conversation.id),
      isShiftKey: event.shiftKey
    });
    onConversationSelect(conversation, event);
  };

  const handleArchiveToggle = async (conversationId: string, archived: boolean) => {
    console.log('ConversationList: Toggling archive status', {
      conversationId,
      archived,
      currentStatus: conversations.find(c => c.id === conversationId)?.archived
    });
    await onArchiveToggle(conversationId, archived);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    console.log('ConversationList: Deleting conversation', {
      conversationId,
      isSelected: selectedConversations.has(conversationId)
    });
    await deleteConversation(conversationId);
  };

  const handleToggleRead = async (conversationId: string) => {
    console.log('ConversationList: Toggling read status', {
      conversationId,
      currentStatus: conversations.find(c => c.id === conversationId)?.unreadCount === 0
    });
    await toggleReadStatus(conversationId);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conversation, index) => {
              const isUnread = conversation.unreadCount > 0;
              const isSelected = selectedConversations.has(conversation.id);
              const isHovered = hoveredConversation === conversation.id;
              const isFocused = index === focusedIndex;
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const isExistingContact = isContactExists(conversation.phoneNumber);

              return (
                <li
                  key={conversation.id}
                  onClick={(e) => handleConversationClick(conversation, e)}
                  onContextMenu={(e) => handleContextMenu(e, conversation)}
                  onMouseEnter={() => setHoveredConversation(conversation.id)}
                  onMouseLeave={() => setHoveredConversation(null)}
                  className={`
                    relative flex items-center p-4 cursor-pointer
                    border-l-4 transition-colors duration-150
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent'}
                    ${isHovered ? 'bg-gray-50' : ''}
                    ${isFocused ? 'bg-primary/10 ring-2 ring-primary ring-inset' : ''}
                  `}
                  tabIndex={0}
                  role="button"
                  aria-selected={isSelected}
                  aria-label={`Conversation with ${conversation.customerName || conversation.phoneNumber}`}
                >
                  {/* Unread indicator */}
                  {isUnread && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <div className="flex-1 min-w-0 ml-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`
                        text-sm truncate
                        ${isUnread ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}
                      `}>
                        {conversation.customerName || conversation.phoneNumber}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimestamp(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`
                      text-sm truncate mt-1
                      ${isUnread ? 'font-medium text-gray-900' : 'text-gray-600'}
                    `}>
                      {lastMessage?.content || 'No messages'}
                    </p>
                  </div>

                  {/* Action buttons - visible on hover */}
                  <div className={`
                    flex items-center space-x-2 ml-4
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                    transition-opacity duration-150
                  `}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, conversation);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                      title="More actions"
                    >
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: contextMenu.conversation.unreadCount > 0 ? 'Mark as read' : 'Mark as unread',
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={contextMenu.conversation.unreadCount > 0
                      ? "M5 13l4 4L19 7"
                      : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    }
                  />
                </svg>
              ),
              onClick: () => handleToggleRead(contextMenu.conversation.id)
            },
            {
              label: contextMenu.conversation.archived ? 'Unarchive' : 'Archive',
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              ),
              onClick: () => handleArchiveToggle(
                contextMenu.conversation.id,
                !contextMenu.conversation.archived
              )
            },
            {
              label: 'Delete conversation',
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              ),
              onClick: () => handleDeleteConversation(contextMenu.conversation.id),
              danger: true
            },
            {
              label: isContactExists(contextMenu.conversation.phoneNumber) ? 'Contact exists' : 'Add to contacts',
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              ),
              onClick: () => handleAddToContacts(contextMenu.conversation),
              disabled: isContactExists(contextMenu.conversation.phoneNumber)
            }
          ]}
        />
      )}
    </div>
  );
};

export default ConversationList;