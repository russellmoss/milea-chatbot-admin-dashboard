import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';
import TemplateSelector from './TemplateSelector';
import FolderSidebar from './FolderSidebar';
import { Contact, Conversation, Message } from '../../types/sms';
import { markMessagesAsRead, markMessageAsRead, archiveConversation, unarchiveConversation, toggleConversationArchive } from '../../services/smsService';
import { toast } from 'react-hot-toast';
import { useSMSContext } from '../../contexts/SMSContext';

// Types
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

// Define folder types and their properties
interface Folder {
  id: string;
  label: string;
  icon: React.ReactNode;
  filter: (conversation: Conversation) => boolean;
}

interface DateRange {
  from: Date;
  to: Date;
}

const FOLDERS: Folder[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
      </svg>
    ),
    filter: (conversation) => !conversation.archived && !conversation.deleted
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    filter: (conversation) => conversation.archived && !conversation.deleted
  },
  {
    id: 'deleted',
    label: 'Deleted',
    icon: (
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    filter: (conversation) => conversation.deleted
  }
];

interface MessagingInboxProps {
  twilioApiKey?: string;
  twilioAccountSid?: string;
  contacts: Contact[];
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  onMarkAsRead: (conversation: Conversation) => void;
}

// Draggable Conversation Item Component
const DraggableConversationItem: React.FC<{
  conversation: Conversation;
  onSelect: (conversation: Conversation, event: React.MouseEvent) => void;
  onCheckboxSelect: (conversationId: string, event: React.MouseEvent) => void;
  onArchiveToggle: (conversationId: string, archived: boolean) => void;
  isSelected: boolean;
  isChecked: boolean;
}> = ({ conversation, onSelect, onCheckboxSelect, onArchiveToggle, isSelected, isChecked }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CONVERSATION',
    item: { id: conversation.id, currentFolder: conversation.archived ? 'archive' : 'inbox' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={(e) => onSelect(conversation, e)}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
        isSelected ? 'bg-gray-50' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckboxSelect(conversation.id, e)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-primary focus:ring-primary/20"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center flex-1">
              <h3 className="font-medium text-gray-900">
                {conversation.customerName || conversation.phoneNumber}
              </h3>
              {conversation.unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchiveToggle(conversation.id, !conversation.archived);
              }}
              className={`p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 ${
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
          <p className="text-sm text-gray-500 truncate">
            {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Droppable Folder Component
const DroppableFolder: React.FC<{
  folder: Folder;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  onDrop: (conversationId: string, targetFolder: string) => void;
}> = ({ folder, isSelected, onSelect, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CONVERSATION',
    drop: (item: { id: string; currentFolder: string }) => {
      if (item.currentFolder !== folder.id) {
        onDrop(item.id, folder.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      onClick={() => onSelect(folder.id)}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors duration-150 ${
        isSelected ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
      } ${isOver ? 'bg-primary/20' : ''}`}
    >
      {folder.icon}
      <span className="font-medium">{folder.label}</span>
    </div>
  );
};

const MessagingInbox: React.FC<MessagingInboxProps> = ({
  twilioApiKey,
  twilioAccountSid,
  contacts,
  conversations: initialConversations,
  onConversationSelect,
  onMarkAsRead
}) => {
  const { conversations, setConversations, selectedConversation, setSelectedConversation } = useSMSContext();
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());

  // Filter conversations based on selected folder and search query
  const filteredConversations = useMemo(() => {
    return conversations.filter(conversation => {
      const folder = FOLDERS.find(f => f.id === selectedFolder);
      if (!folder) return false;
      
      const matchesFolder = folder.filter(conversation);
      const matchesSearch = searchQuery === '' || 
        conversation.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.phoneNumber.includes(searchQuery);
      
      return matchesFolder && matchesSearch;
    });
  }, [conversations, selectedFolder, searchQuery]);

  // Handle batch archive
  const handleBatchArchive = async () => {
    try {
      const loadingToast = toast.loading(`Archiving ${selectedConversations.size} conversations...`);
      
      // Archive each selected conversation
      for (const conversationId of selectedConversations) {
        await toggleConversationArchive(conversationId, true);
      }

      // Update conversations list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          selectedConversations.has(conv.id) 
            ? { ...conv, archived: true }
            : conv
        )
      );

      // Clear selection
      setSelectedConversations(new Set());
      
      // Clear selected conversation if it was archived
      if (selectedConversation && selectedConversations.has(selectedConversation.id)) {
        setSelectedConversation(null);
      }

      toast.dismiss(loadingToast);
      toast.success(`Archived ${selectedConversations.size} conversations`);
    } catch (error) {
      console.error('Error in batch archive:', error);
      toast.error('Failed to archive some conversations');
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation, event: React.MouseEvent) => {
    // If shift key is pressed, toggle selection
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

    // Otherwise, select the conversation normally
    setSelectedConversation(conversation);
    onConversationSelect(conversation);
    
    if (conversation.unreadCount > 0) {
      const updatedConversation = markMessagesAsRead(conversation);
      onMarkAsRead(updatedConversation);
    }
  };

  // Handle checkbox selection
  const handleCheckboxSelect = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelection = new Set(selectedConversations);
    if (newSelection.has(conversationId)) {
      newSelection.delete(conversationId);
    } else {
      newSelection.add(conversationId);
    }
    setSelectedConversations(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedConversations.size === filteredConversations.length) {
      setSelectedConversations(new Set());
    } else {
      setSelectedConversations(new Set(filteredConversations.map(conv => conv.id)));
    }
  };

  // Handle marking all messages as read
  const handleMarkAllAsRead = () => {
    if (!selectedConversation) return;
    
    try {
      const updatedConversation = markMessagesAsRead(selectedConversation);
      onMarkAsRead(updatedConversation);
    } catch (error) {
      toast.error('Failed to mark messages as read');
      console.error('Error marking messages as read:', error);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string, to: string) => {
    if (!twilioApiKey || !twilioAccountSid) {
      toast.error('Twilio credentials not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const existingConversation = conversations.find(
        conv => conv.phoneNumber === to
      );

      if (existingConversation) {
        const newMessage: Message = {
          id: Date.now().toString(),
          direction: 'outbound',
          content,
          timestamp: new Date().toISOString(),
          status: 'sent',
          read: false
        };

        const updatedConversation: Conversation = {
          ...existingConversation,
          messages: [...existingConversation.messages, newMessage],
          lastMessageAt: newMessage.timestamp,
          timestamp: newMessage.timestamp
        };

        onConversationSelect(updatedConversation);
        setSelectedConversation(updatedConversation);
      } else {
        const contact = contacts.find(c => c.phoneNumber === to);
        const customerName = contact ? `${contact.firstName} ${contact.lastName}` : null;
        
        const newConversation: Conversation = {
          id: Date.now().toString(),
          customerName,
          phoneNumber: to,
          messages: [{
            id: Date.now().toString(),
            direction: 'outbound',
            content,
            timestamp: new Date().toISOString(),
            status: 'sent',
            read: false
          }],
          unreadCount: 0,
          lastMessageAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          archived: false,
          deleted: false
        };

        onConversationSelect(newConversation);
        setSelectedConversation(newConversation);
      }
    } catch (error) {
      setError('Failed to send message');
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle marking a conversation as read
  const handleMarkAsRead = (conversation: Conversation) => {
    const updatedConversation = markMessagesAsRead(conversation);
    onMarkAsRead(updatedConversation);
    
    if (selectedConversation?.id === conversation.id) {
      setSelectedConversation(updatedConversation);
    }
  };

  // Handle applying a message template
  const handleApplyTemplate = (template: MessageTemplate): string => {
    if (!selectedConversation) return template.content;
    
    let content = template.content;
    // Add logic to replace variables based on context
    handleSendMessage(content, selectedConversation.phoneNumber);
    return content;
  };

  // Add archive handler function
  const handleArchiveConversation = (conversation: Conversation) => {
    const updatedConversation: Conversation = {
      ...conversation,
      archived: !conversation.archived,
      deleted: false // Ensure it's not deleted when archiving
    };
    
    // Update the conversation in the list
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id ? updatedConversation : conv
    );
    
    // Update selected conversation if it's the one being archived
    if (selectedConversation?.id === conversation.id) {
      setSelectedConversation(updatedConversation);
    }
    
    // Call the parent handler if provided
    onConversationSelect(updatedConversation);
  };

  const handleArchiveToggle = async (conversationId: string, archived: boolean) => {
    try {
      // Call the appropriate service function based on the action
      const updatedConversation = await toggleConversationArchive(conversationId, archived);

      // Update the conversations list with the updated conversation
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? updatedConversation 
            : conv
        )
      );

      // If the conversation is currently selected and we're archiving it,
      // clear the selection
      if (selectedConversation?.id === conversationId && archived) {
        setSelectedConversation(null);
      }

      // Show toast notification with undo button when archiving
      if (archived) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg 
                    className="h-10 w-10 text-primary" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Conversation archived
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {updatedConversation.customerName || updatedConversation.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleArchiveToggle(conversationId, false);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80 focus:outline-none"
              >
                Undo
              </button>
            </div>
          </div>
        ), {
          duration: 5000, // Show for 5 seconds
          position: 'bottom-right',
        });
      }
    } catch (error) {
      // Error is already handled by the service
      console.error('Error in handleArchiveToggle:', error);
    }
  };

  // Handle dropping a conversation into a folder
  const handleDrop = async (conversationId: string, targetFolder: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      // Determine the action based on the target folder
      const actions = {
        inbox: () => toggleConversationArchive(conversationId, false),
        archive: () => toggleConversationArchive(conversationId, true),
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Folder Navigation */}
        <FolderSidebar
          folders={FOLDERS}
          conversations={conversations}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          onArchiveToggle={handleArchiveToggle}
          onDrop={handleDrop}
        />

        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {FOLDERS.find(f => f.id === selectedFolder)?.label || 'Conversations'}
              </h2>
              {selectedConversation && selectedConversation.unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Batch Action Bar */}
          {selectedConversations.size > 0 && (
            <div className="px-4 py-2 bg-primary/5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedConversations.size === filteredConversations.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-gray-600">
                  {selectedConversations.size} selected
                </span>
              </div>
              <button
                onClick={handleBatchArchive}
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Archive Selected
              </button>
            </div>
          )}

          <div className="overflow-y-auto h-[calc(100vh-8rem)]">
            {filteredConversations.map((conversation) => (
              <DraggableConversationItem
                key={conversation.id}
                conversation={conversation}
                onSelect={handleConversationSelect}
                onCheckboxSelect={handleCheckboxSelect}
                onArchiveToggle={handleArchiveToggle}
                isSelected={selectedConversation?.id === conversation.id}
                isChecked={selectedConversations.has(conversation.id)}
              />
            ))}
          </div>
        </div>

        {/* Message Display */}
        <div className="flex-1 bg-gray-50">
          {selectedConversation ? (
            <MessageDisplay
              messages={selectedConversation.messages}
              customerName={selectedConversation.customerName}
              phoneNumber={selectedConversation.phoneNumber}
              onMarkAsRead={handleMarkAsRead}
              conversation={selectedConversation}
              onArchive={handleArchiveConversation}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to view messages
            </div>
          )}
        </div>

        {/* Template Selector Modal */}
        {showTemplates && (
    <div className="flex h-full">
      {/* Folder Navigation */}
      <FolderSidebar
        folders={FOLDERS}
        conversations={conversations}
        selectedFolder={selectedFolder}
        onFolderSelect={setSelectedFolder}
        onArchiveToggle={handleArchiveToggle}
      />

      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {FOLDERS.find(f => f.id === selectedFolder)?.label || 'Conversations'}
            </h2>
            {selectedConversation && selectedConversation.unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary/80"
              >
                Mark all as read
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Batch Action Bar */}
        {selectedConversations.size > 0 && (
          <div className="px-4 py-2 bg-primary/5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedConversations.size === filteredConversations.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-gray-600">
                {selectedConversations.size} selected
              </span>
            </div>
            <button
              onClick={handleBatchArchive}
              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Archive Selected
            </button>
          </div>
        )}

        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={(e) => handleConversationSelect(conversation, e)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedConversations.has(conversation.id)}
                  onChange={(e) => handleCheckboxSelect(conversation.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center flex-1">
                      <h3 className="font-medium text-gray-900">
                        {conversation.customerName || conversation.phoneNumber}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveToggle(conversation.id, !conversation.archived);
                      }}
                      className={`p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 ${
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
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Display */}
      <div className="flex-1 bg-gray-50">
        {selectedConversation ? (
          <MessageDisplay
            messages={selectedConversation.messages}
            customerName={selectedConversation.customerName}
            phoneNumber={selectedConversation.phoneNumber}
            onMarkAsRead={handleMarkAsRead}
            conversation={selectedConversation}
            onArchive={handleArchiveConversation}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TemplateSelector
              templates={templates}
              onSelectTemplate={handleApplyTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInbox;