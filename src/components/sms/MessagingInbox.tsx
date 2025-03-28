import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';
import TemplateSelector from './TemplateSelector';
import FolderSidebar from './FolderSidebar';
import { Conversation, Message, Folder, DateRange, MessageTemplate } from '../../types/sms';
import { toast } from 'react-hot-toast';
import { useSMS } from '../../contexts/SMSContext';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageActions from './MessageActions';

const FOLDERS: Folder[] = [
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
  },
  {
    id: 'deleted',
    label: 'Deleted',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    filter: (conversation: Conversation) => conversation.deleted,
    getBadgeCount: (conversations: Conversation[]) => conversations.filter(c => c.deleted).length
  }
];

interface ConversationHeaderProps {
  conversation: Conversation;
  onArchiveToggle: (conversationId: string, archived: boolean) => Promise<void>;
  onDelete: (conversationId: string) => Promise<void>;
  onExport: () => void;
  onViewContact: () => void;
  onBlock: () => void;
  onAddToList: () => void;
}

const MessagingInbox: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { 
    conversations, 
    setConversations, 
    selectedConversation, 
    setSelectedConversation,
    sendMessage,
    markConversationAsRead,
    markMessageAsRead,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    isLoading,
    error: contextError,
    templates,
    handleArchiveToggle
  } = useSMS();

  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportDateRange, setExportDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [error, setError] = useState<string | null>(null);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  // Handle real-time updates from socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: Message) => {
      setConversations((prevConversations: Conversation[]) => {
        const conversationIndex = prevConversations.findIndex(
          (conv: Conversation) => conv.phoneNumber === message.phoneNumber
        );

        if (conversationIndex === -1) {
          // New conversation
          const newConversation: Conversation = {
            id: Date.now().toString(),
            customerName: null,
            phoneNumber: message.phoneNumber || '',
            messages: [message],
            lastMessageAt: message.timestamp,
            timestamp: message.timestamp,
            unreadCount: 1,
            archived: false,
            deleted: false,
            userId: user?.uid
          };
          return [...prevConversations, newConversation];
        }

        // Update existing conversation
        const updatedConversations = [...prevConversations];
        const conversation = updatedConversations[conversationIndex];
        conversation.messages.push(message);
        conversation.lastMessageAt = message.timestamp;
        conversation.unreadCount += 1;
        updatedConversations[conversationIndex] = conversation;
        return updatedConversations;
      });
    };

    const handleMessageStatusUpdate = (data: { messageId: string; status: Message['status'] }) => {
      setConversations((prevConversations: Conversation[]) => {
        return prevConversations.map((conv: Conversation) => {
          const messageIndex = conv.messages.findIndex((msg: Message) => msg.id === data.messageId);
          if (messageIndex !== -1) {
            const updatedMessages = [...conv.messages];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              status: data.status
            };
            return { ...conv, messages: updatedMessages };
          }
          return conv;
        });
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-status-update', handleMessageStatusUpdate);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-status-update', handleMessageStatusUpdate);
    };
  }, [socket, isConnected, setConversations, user?.uid]);

  // Filter conversations based on selected folder and search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation: Conversation) => {
      const folder = FOLDERS.find(f => f.id === selectedFolder);
      if (!folder) return false;
      
      const matchesFolder = folder.filter(conversation);
      const matchesSearch = searchQuery === '' || 
        conversation.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.phoneNumber.includes(searchQuery);
      
      return matchesFolder && matchesSearch;
    });
  }, [conversations, selectedFolder, searchQuery]);

  // Handle conversation selection
  const handleConversationSelect = async (conversation: Conversation, event: React.MouseEvent) => {
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

    // Clear any existing selection
    setSelectedConversations(new Set());
    
    // Set the selected conversation
    setSelectedConversation(conversation);
    
    if (conversation.unreadCount > 0) {
      try {
        await markConversationAsRead(conversation.id);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
        toast.error('Failed to mark conversation as read');
      }
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string): Promise<void> => {
    if (!selectedConversation || !content.trim() || !isConnected) return;

    // Create a new message object with initial status
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      direction: 'outbound' as const,
      timestamp: new Date().toISOString(),
      read: true,
      status: 'sent' // Initial status, will be updated by server
    };

    // Update the conversation with the new message
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessageAt: newMessage.timestamp,
            unreadCount: 0
          };
        }
        return conv;
      });
    });

    try {
      // Send the message and wait for response
      const response = await sendMessage(selectedConversation.phoneNumber, content, selectedConversation.id);
      
      // Update the message with the server response
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === newMessage.id ? { ...msg, status: response.status } : msg
              )
            };
          }
          return conv;
        });
      });

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      // Update the message status to failed
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === newMessage.id ? { ...msg, status: 'failed' } : msg
              )
            };
          }
          return conv;
        });
      });
      toast.error('Failed to send message');
    }
  };

  // Handle marking a conversation as read
  const handleMarkAsRead = async () => {
    if (!selectedConversation) return;
    try {
      await markConversationAsRead(selectedConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark conversation as read');
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      
      // Clear selection if deleting selected conversation
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }

      toast.success('Conversation deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  };

  // Handle applying a message template
  const handleApplyTemplate = (templateId: string) => {
    // TODO: Implement template application
  };

  // Handle dropping a conversation into a folder
  const handleDrop = async (conversationId: string, targetFolder: string) => {
    try {
      const conversation = conversations.find((c: Conversation) => c.id === conversationId);
      if (!conversation) return;

      // Determine the action based on the target folder
      const actions = {
        inbox: () => handleArchiveToggle(conversationId, false),
        archive: () => handleArchiveToggle(conversationId, true),
        deleted: () => {
          // Implement delete functionality
          toast.error('Delete functionality not implemented');
        }
      };

      const action = actions[targetFolder as keyof typeof actions];
      if (action) {
        await action();
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Failed to move conversation');
    }
  };

  const handleMessageDelete = (messageId: string) => {
    if (!selectedConversation) return;
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: conv.messages.filter(msg => msg.id !== messageId)
        };
      }
      return conv;
    });
    setConversations(updatedConversations);
  };

  const handleMessageEdit = (messageId: string, content: string) => {
    if (!selectedConversation) return;
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: conv.messages.map(msg => 
            msg.id === messageId ? { ...msg, content } : msg
          )
        };
      }
      return conv;
    });
    setConversations(updatedConversations);
  };

  const handleMessageCopy = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.content);
      toast.success('Message copied to clipboard');
    }
  };

  const handleMessageForward = () => {
    if (selectedMessage) {
      toast('Forward functionality coming soon');
    }
  };

  const handleMessageResend = () => {
    if (selectedMessage) {
      toast('Message resent');
    }
  };

  const handleMessageViewDetails = () => {
    if (selectedMessage) {
      toast('Message details coming soon');
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  const handleViewContact = () => {
    // TODO: Implement contact view functionality
  };

  const handleBlock = () => {
    // TODO: Implement block functionality
  };

  const handleAddToList = () => {
    // TODO: Implement add to list functionality
  };

  const handleMessageAction = async (messageId: string, action: string) => {
    try {
      switch (action) {
        case 'mark-read':
          await markMessageAsRead(messageId);
          break;
        // Add more message actions as needed
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform message action');
    }
  };

  const handleArchiveSelected = () => {
    // Update conversations list
    const updatedConversations = conversations.map((conv: Conversation) => 
      selectedConversations.has(conv.id) 
        ? { ...conv, archived: true }
        : conv
    );
    setConversations(updatedConversations);

    // Clear selection
    setSelectedConversations(new Set());
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <div className="flex-none border-b border-gray-200 p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
              <button
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError(null)}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="fill-current h-4 w-4" role="button" viewBox="0 0 20 20">
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${
                    isSidebarExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedFolder === 'inbox' ? 'Inbox' : 
                 selectedFolder === 'archive' ? 'Archive' : 'Deleted'}
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {selectedConversations.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedConversations.size} selected
                </span>
                <button
                  onClick={handleArchiveSelected}
                  className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Archive Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-[auto_1fr_1fr] overflow-hidden">
          {/* Sidebar Column */}
          <div className="relative border-r border-gray-200">
            <FolderSidebar
              folders={FOLDERS}
              conversations={conversations}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
              onArchiveToggle={handleArchiveToggle}
              onDrop={handleDrop}
              isExpanded={isSidebarExpanded}
            />
          </div>

          {/* Conversations List */}
          <div className="flex flex-col min-w-0 border-r border-gray-200">
            <ConversationList
              conversations={filteredConversations}
              selectedConversations={selectedConversations}
              onConversationSelect={handleConversationSelect}
              onArchiveToggle={handleArchiveToggle}
              searchQuery={searchQuery}
            />
          </div>

          {/* Message Display */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedConversation ? (
              <>
                <ConversationHeader
                  conversation={selectedConversation}
                  onArchiveToggle={handleArchiveToggle}
                  onDelete={handleDeleteConversation}
                  onExport={handleExport}
                  onViewContact={handleViewContact}
                  onBlock={handleBlock}
                  onAddToList={handleAddToList}
                />
                <MessageDisplay
                  messages={selectedConversation.messages}
                  onMessageAction={handleMessageAction}
                  customerName={selectedConversation.customerName}
                  phoneNumber={selectedConversation.phoneNumber}
                  onMarkAsRead={handleMarkAsRead}
                  conversation={selectedConversation}
                />
                <MessageComposer
                  onTemplateSelect={handleApplyTemplate}
                  templates={templates}
                  recipientPhone={selectedConversation.phoneNumber}
                  conversationId={selectedConversation.id}
                  onSend={handleSendMessage}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default MessagingInbox;