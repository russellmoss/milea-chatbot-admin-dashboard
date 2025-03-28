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
  const [focusedConversationIndex, setFocusedConversationIndex] = useState<number>(-1);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Load initial data
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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

    // For single selection, clear the set and add only the selected conversation
    setSelectedConversations(new Set([conversation.id]));
    setCurrentConversation(conversation);
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (content: string) => {
    if (!socket || !currentConversation) return;

    try {
      await sendMessage(content, currentConversation.phoneNumber);
      await fetchMessages();
      // Refresh the current conversation to get the new message
      const updatedConversation = conversations.find(conv => conv.id === currentConversation.id);
      if (updatedConversation) {
        setCurrentConversation(updatedConversation);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Handle template selection
      console.log('Selected template:', template);
    }
  };

  const handleMarkAsRead = (conversation: Conversation) => {
    markConversationAsRead(conversation.id);
  };

  const filteredConversations = conversations.filter(conversation => {
    const folder = FOLDERS.find(f => f.id === selectedFolder);
    if (!folder) return true;
    return folder.filter(conversation);
  });

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setSelectedConversations(new Set());
      }
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
        <div className="flex-1 flex overflow-hidden">
          <ConversationList
            conversations={filteredConversations}
            selectedConversations={selectedConversations}
            onConversationSelect={handleConversationSelect}
            onArchiveToggle={handleArchiveToggle}
            searchQuery={searchQuery}
            focusedIndex={focusedConversationIndex}
          />
          {currentConversation ? (
            <div className="flex-1 flex flex-col border-l">
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
                onMarkAsRead={handleMarkAsRead}
                conversation={currentConversation}
                onMessageAction={handleMessageAction}
                onMessageSelect={(messageId: string) => {
                  const message = currentConversation.messages.find(msg => msg.id === messageId);
                  if (message) {
                    setSelectedMessage(message);
                  }
                }}
              />
              <MessageComposer
                onSend={handleSendMessage}
                onTemplateSelect={handleTemplateSelect}
                templates={templates}
                recipientPhone={currentConversation.phoneNumber}
                conversationId={currentConversation.id}
                onCancel={() => {}}
                conversation={currentConversation}
                onToggleExpand={() => {}}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMS; 