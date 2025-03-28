import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useSMS } from '../../contexts/SMSContext';
import { Conversation, Message, MessageTemplate } from '../../types/sms';
import FolderSidebar from './FolderSidebar';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';
import { toast } from 'react-hot-toast';

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
    setSelectedConversation,
    fetchMessages,
    isLoading,
    deleteConversation
  } = useSMS();
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Handle template selection
      console.log('Selected template:', template);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const folder = FOLDERS.find(f => f.id === selectedFolder);
    if (!folder) return true;
    return folder.filter(conversation);
  });

  const currentConversation = conversations.find(conv => conv.id === selectedConversations.values().next().value);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      toast.success('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Messages
              </>
            )}
          </button>
        </div>
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
              onDelete={() => handleDeleteConversation(currentConversation.id)}
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
              conversationId={currentConversation.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SMS; 