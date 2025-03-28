import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, isToday, isYesterday, isWithinInterval, parseISO } from 'date-fns';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';
import TemplateSelector from './TemplateSelector';
import FolderSidebar from './FolderSidebar';
import ConversationList from './ConversationList';
import ComposeModal from './ComposeModal';
import { Conversation, Message, Folder, DateRange, MessageTemplate } from '../../types/sms';
import { toast } from 'react-hot-toast';
import { useSMS } from '../../contexts/SMSContext';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
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

interface FilterState {
  searchQuery: string;
  filterType: 'all' | 'unread' | 'archived';
  dateRange: DateRange | null;
}

const MessagingInbox: React.FC = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { draftMessages, setDraftMessage, clearDraftMessage } = useMessage();
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
    handleArchiveToggle,
    fetchMessages
  } = useSMS();

  const [selectedFolder, setSelectedFolder] = useState('inbox');
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
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  // Add new state for keyboard navigation
  const [focusedConversationIndex, setFocusedConversationIndex] = useState<number>(-1);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Add new state for filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    filterType: 'all',
    dateRange: null
  });

  // Load initial data
  useEffect(() => {
    // This would normally fetch data, but our mock data is already loaded
    // We can still simulate a loading state for realism
    if (conversations.length === 0) {
      fetchMessages();
    }
  }, [fetchMessages, conversations.length]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  // Filter conversations based on selected folder, search query, and filters
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation: Conversation) => {
      // Apply folder filter
      const folder = FOLDERS.find(f => f.id === selectedFolder);
      if (!folder) return false;
      const matchesFolder = folder.filter(conversation);
      if (!matchesFolder) return false;

      // Apply search filter
      const matchesSearch = filters.searchQuery === '' || 
        conversation.customerName?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        conversation.phoneNumber.includes(filters.searchQuery) ||
        conversation.messages.some(msg => 
          msg.content.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );

      // Apply filter type
      const matchesFilterType = 
        filters.filterType === 'all' ||
        (filters.filterType === 'unread' && conversation.unreadCount > 0) ||
        (filters.filterType === 'archived' && conversation.archived);

      // Apply date range filter
      const matchesDateRange = !filters.dateRange || (
        isWithinInterval(parseISO(conversation.lastMessageAt), {
          start: filters.dateRange.from,
          end: filters.dateRange.to
        })
      );

      return matchesSearch && matchesFilterType && matchesDateRange;
    });
  }, [conversations, selectedFolder, filters]);

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

    try {
      await sendMessage(content, selectedConversation.phoneNumber, selectedConversation.id);
      
      // Clear draft message after sending
      clearDraftMessage(selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle marking a conversation as read
  const handleMarkAsRead = (conversation: Conversation) => {
    markConversationAsRead(conversation.id);
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
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && selectedConversation) {
      setDraftMessage(selectedConversation.id, template.content);
      setShowTemplates(false);
    }
  };

  // Handle dropping a conversation into a folder
  const handleDrop = async (conversationId: string, targetFolder: string) => {
    try {
      const conversation = conversations.find((c: Conversation) => c.id === conversationId);
      if (!conversation) return;

      // Determine the action based on the target folder
      if (targetFolder === 'inbox' && conversation.archived) {
        await handleArchiveToggle(conversationId, false);
      } else if (targetFolder === 'archive' && !conversation.archived) {
        await handleArchiveToggle(conversationId, true);
      } else if (targetFolder === 'deleted') {
        await deleteConversation(conversationId);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      toast.error('Failed to move conversation');
    }
  };

  // Handle message actions
  const handleMessageAction = async (action: string) => {
    if (!selectedMessage) return;
    
    try {
      switch (action) {
        case 'copy':
          await navigator.clipboard.writeText(selectedMessage.content);
          toast.success('Message copied to clipboard');
          break;
        case 'delete':
          // This would normally delete from the database
          // Here we just filter it from the local state
          if (selectedConversation) {
            const updatedConversations = conversations.map(conv => {
              if (conv.id === selectedConversation.id) {
                return {
                  ...conv,
                  messages: conv.messages.filter(msg => msg.id !== selectedMessage.id)
                };
              }
              return conv;
            });
            setConversations(updatedConversations);
            toast.success('Message deleted');
          }
          break;
        case 'forward':
          toast('Forward functionality coming soon', {
            icon: 'ℹ️',
            duration: 3000
          });
          break;
        default:
          console.warn('Unknown message action:', action);
      }
    } catch (error) {
      console.error('Error handling message action:', error);
      toast.error('Failed to perform action');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle keyboard events if we're not in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedConversationIndex(prev => {
          if (prev <= 0) return filteredConversations.length - 1;
          return prev - 1;
        });
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedConversationIndex(prev => {
          if (prev >= filteredConversations.length - 1) return 0;
          return prev + 1;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedConversationIndex >= 0 && focusedConversationIndex < filteredConversations.length) {
          const conversation = filteredConversations[focusedConversationIndex];
          handleConversationSelect(conversation, e as unknown as React.MouseEvent);
        }
        break;

      case 'Escape':
        e.preventDefault();
        if (selectedConversation) {
          setSelectedConversation(null);
        } else if (isComposeModalOpen) {
          setIsComposeModalOpen(false);
        }
        break;

      case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setIsComposeModalOpen(true);
        }
        break;

      case '?':
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
        break;
    }
  }, [filteredConversations, focusedConversationIndex, selectedConversation, isComposeModalOpen]);

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset focused index when conversations change
  useEffect(() => {
    setFocusedConversationIndex(-1);
  }, [filteredConversations]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      filterType: 'all',
      dateRange: null
    });
  };

  const handleExportConversation = () => {
    // TODO: Implement export functionality
    console.log('Export conversation');
  };

  const handleViewContact = () => {
    // TODO: Implement view contact functionality
    console.log('View contact');
  };

  const handleBlockContact = () => {
    // TODO: Implement block contact functionality
    console.log('Block contact');
  };

  const handleAddToList = () => {
    // TODO: Implement add to list functionality
    console.log('Add to list');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Sidebar */}
        <FolderSidebar
          folders={FOLDERS}
          conversations={conversations}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          onArchiveToggle={handleArchiveToggle}
          onDrop={handleDrop}
          isExpanded={isSidebarExpanded}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col border-b">
            {/* Top bar with search and actions */}
            <div className="flex items-center justify-between p-4">
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
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowKeyboardShortcuts(prev => !prev)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Keyboard shortcuts (?)"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsComposeModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  title="New message (⌘N)"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Compose
                </button>
              </div>
            </div>

            {/* Filters bar */}
            <div className="px-4 py-3 bg-gray-50 border-t">
              <div className="flex items-center gap-4">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search conversations... (⌘K)"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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

                {/* Filter type buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilterChange({ filterType: 'all' })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filters.filterType === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterChange({ filterType: 'unread' })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filters.filterType === 'unread'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => handleFilterChange({ filterType: 'archived' })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filters.filterType === 'archived'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Archived
                  </button>
                </div>

                {/* Date range selector */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleFilterChange({
                      dateRange: {
                        from: e.target.value ? new Date(e.target.value) : new Date(),
                        to: filters.dateRange?.to || new Date()
                      }
                    })}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleFilterChange({
                      dateRange: {
                        from: filters.dateRange?.from || new Date(),
                        to: e.target.value ? new Date(e.target.value) : new Date()
                      }
                    })}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Clear filters button */}
                {(filters.searchQuery || filters.filterType !== 'all' || filters.dateRange) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 flex overflow-hidden">
            <ConversationList
              conversations={filteredConversations}
              selectedConversations={selectedConversations}
              onConversationSelect={handleConversationSelect}
              onArchiveToggle={handleArchiveToggle}
              searchQuery={filters.searchQuery}
              focusedIndex={focusedConversationIndex}
            />

            {/* Message Display */}
            {selectedConversations.size === 1 && selectedConversation && (
              <div className="flex-1 flex flex-col border-l">
                <ConversationHeader
                  conversation={selectedConversation}
                  onArchiveToggle={handleArchiveToggle}
                  onDelete={handleDeleteConversation}
                  onExport={handleExportConversation}
                  onViewContact={handleViewContact}
                  onBlock={handleBlockContact}
                  onAddToList={handleAddToList}
                />
                <MessageDisplay
                  messages={selectedConversation.messages}
                  customerName={selectedConversation.customerName}
                  phoneNumber={selectedConversation.phoneNumber}
                  onMarkAsRead={handleMarkAsRead}
                  conversation={selectedConversation}
                  onMessageAction={handleMessageAction}
                />
                <MessageComposer
                  onSend={handleSendMessage}
                  onTemplateSelect={handleTemplateSelect}
                  templates={templates}
                  recipientPhone={selectedConversation.phoneNumber}
                  conversationId={selectedConversation.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Navigation</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                      <span>Up/Down arrows</span>
                      <span className="text-gray-400">Navigate conversations</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Enter</span>
                      <span className="text-gray-400">Select conversation</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Escape</span>
                      <span className="text-gray-400">Close conversation/modal</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                      <span>⌘N</span>
                      <span className="text-gray-400">New message</span>
                    </li>
                    <li className="flex justify-between">
                      <span>⌘K</span>
                      <span className="text-gray-400">Search conversations</span>
                    </li>
                    <li className="flex justify-between">
                      <span>?</span>
                      <span className="text-gray-400">Show/hide shortcuts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
};

export default MessagingInbox;