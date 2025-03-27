import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useSMS } from '../../contexts/SMSContext';
import { Conversation, Message, MessageTemplate } from '../../types/sms';
import FolderSidebar from './FolderSidebar';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';

const FOLDERS = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
      </svg>
    ),
    filter: (conversation: Conversation) => !conversation.archived && !conversation.deleted,
    getBadgeCount: (conversations: Conversation[]) => conversations.filter(c => !c.archived && !c.deleted).length
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    filter: (conversation: Conversation) => conversation.archived && !conversation.deleted,
    getBadgeCount: (conversations: Conversation[]) => conversations.filter(c => c.archived && !c.deleted).length
  }
];

const SMS: React.FC = () => {
  const { socket } = useSocket();
  const { 
    conversations, 
    templates,
    sendMessage,
    markConversationAsRead,
    handleArchiveToggle,
    setSelectedConversation
  } = useSMS();
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new-message', (message: Message) => {
      // Update conversations with the new message
      const updatedConversations = conversations.map(conv => {
        if (conv.phoneNumber === (message as any).phoneNumber) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            lastMessageAt: message.timestamp,
            timestamp: message.timestamp,
            unreadCount: message.direction === 'inbound' ? (conv.unreadCount || 0) + 1 : conv.unreadCount
          };
        }
        return conv;
      });
      const updatedConversation = updatedConversations.find(conv => conv.phoneNumber === (message as any).phoneNumber) || null;
      setSelectedConversation(updatedConversation);
    });

    // Listen for message read status updates
    socket.on('message-read', (messageId: string) => {
      const currentConversation = conversations.find(conv => conv.messages.some(msg => msg.id === messageId));
      if (currentConversation) {
        markConversationAsRead(currentConversation.id);
      }
    });

    // Listen for message status updates
    socket.on('message-status-update', ({ messageId, status }: { messageId: string; status: Message['status'] }) => {
      // Update message status in the conversations
      const updatedConversations = conversations.map(conv => {
        const updatedMessages = conv.messages.map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        );
        return {
          ...conv,
          messages: updatedMessages
        };
      });
      setSelectedConversation(updatedConversations.find(conv => conv.messages.some(msg => msg.id === messageId)) || null);
    });

    return () => {
      socket.off('new-message');
      socket.off('message-read');
      socket.off('message-status-update');
    };
  }, [socket, conversations, markConversationAsRead, setSelectedConversation]);

  const handleSendMessage = async (content: string) => {
    const currentConversation = conversations.find(conv => conv.id === selectedConversations.values().next().value);
    if (!socket || !currentConversation) return;

    try {
      await sendMessage(content, currentConversation.phoneNumber);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error (show toast, etc.)
    }
  };

  const handleMessageAction = (action: string, messageId: string) => {
    if (!socket) return;

    switch (action) {
      case 'mark-read':
        socket.emit('mark-message-read', messageId);
        break;
      // Add other message actions as needed
    }
  };

  const handleConversationSelect = (conversation: Conversation, event: React.MouseEvent) => {
    if (event.shiftKey) {
      event.preventDefault();
      const newSelection = new Set(selectedConversations);
      if (newSelection.has(conversation.id)) {
        newSelection.delete(conversation.id);
      } else {
        newSelection.add(conversation.id);
      }
      setSelectedConversations(newSelection);
      return;
    }

    setSelectedConversation(conversation);
  };

  const handleTemplateSelect = (template: MessageTemplate): string => {
    // Process template variables if needed
    return template.content;
  };

  const filteredConversations = conversations.filter(conversation => {
    const folder = FOLDERS.find(f => f.id === selectedFolder);
    if (!folder) return true;
    return folder.filter(conversation);
  });

  const currentConversation = conversations.find(conv => conv.id === selectedConversations.values().next().value);

  return (
    <div className="flex h-full">
      <FolderSidebar
        folders={FOLDERS}
        conversations={conversations}
        selectedFolder={selectedFolder}
        onFolderSelect={setSelectedFolder}
        onArchiveToggle={handleArchiveToggle}
        onDrop={() => {}}
        isExpanded={true}
      />
      <div className="flex-1 flex flex-col">
        <ConversationList
          conversations={filteredConversations}
          selectedConversations={selectedConversations}
          onConversationSelect={handleConversationSelect}
          onArchiveToggle={handleArchiveToggle}
          searchQuery={searchQuery}
        />
        {currentConversation && (
          <div className="flex-1 flex flex-col">
            <ConversationHeader
              conversation={currentConversation}
              onArchiveToggle={handleArchiveToggle}
              onExport={() => {}}
              onViewContact={() => {}}
              onBlock={() => {}}
              onAddToList={() => {}}
            />
            <MessageDisplay
              messages={currentConversation.messages}
              customerName={currentConversation.customerName}
              phoneNumber={currentConversation.phoneNumber}
              onMarkAsRead={(conversation) => {
                markConversationAsRead(conversation.id);
              }}
              conversation={currentConversation}
              onMessageAction={handleMessageAction}
            />
            <MessageComposer
              onSend={handleSendMessage}
              onTemplateSelect={handleTemplateSelect}
              templates={templates}
              recipientPhone={currentConversation.phoneNumber}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SMS; 