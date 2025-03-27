import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';
import TemplateSelector from './TemplateSelector';
import FolderSidebar from './FolderSidebar';
import { Contact, Conversation, Message, Folder } from '../../types/sms';
import { markMessagesAsRead, markMessageAsRead, archiveConversation, unarchiveConversation, toggleConversationArchive } from '../../services/smsService';
import { toast } from 'react-hot-toast';
import { useSMSContext } from '../../contexts/SMSContext';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageActions from './MessageActions';

// Types
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
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
  onCheckboxSelect: (conversationId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
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

// Update the MessageDisplay props interface
interface MessageDisplayProps {
  messages: Message[];
  customerName: string | null;
  phoneNumber: string;
  onMarkAsRead: (conversation: Conversation) => void;
  conversation: Conversation;
  onArchive: (conversationId: string, archived: boolean) => Promise<void>;
}

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
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

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

  // Handle batch archive
  const handleBatchArchive = async () => {
    try {
      const loadingToast = toast.loading(`Archiving ${selectedConversations.size} conversations...`);
      
      // Archive each selected conversation
      for (const conversationId of Array.from(selectedConversations)) {
        await toggleConversationArchive(conversationId, true);
      }

      // Update conversations list
      const updatedConversations = conversations.map((conv: Conversation) => 
        selectedConversations.has(conv.id) 
          ? { ...conv, archived: true }
          : conv
      );
      setConversations(updatedConversations);

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
  const handleCheckboxSelect = (conversationId: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
      const newSelection = new Set<string>();
      filteredConversations.forEach((conv: Conversation) => {
        newSelection.add(conv.id);
      });
      setSelectedConversations(newSelection);
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
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    if (!twilioApiKey || !twilioAccountSid) {
      toast.error('Twilio credentials not configured');
      return;
    }

    try {
      const existingConversation = conversations.find(
        conv => conv.phoneNumber === selectedConversation.phoneNumber
      );

      const newMessageObj: Message = {
        id: Date.now().toString(),
        direction: 'outbound',
        content: newMessage,
        timestamp: new Date().toISOString(),
        status: 'sent',
        read: false
      };

      if (existingConversation) {
        const updatedConversation: Conversation = {
          ...existingConversation,
          messages: [...existingConversation.messages, newMessageObj],
          lastMessageAt: newMessageObj.timestamp,
          timestamp: newMessageObj.timestamp
        };

        const updatedConversations = conversations.map(conv => 
          conv.id === existingConversation.id ? updatedConversation : conv
        );
        setConversations(updatedConversations);
        setSelectedConversation(updatedConversation);
      } else {
        const contact = contacts.find(c => c.phoneNumber === selectedConversation.phoneNumber);
        const customerName = contact ? `${contact.firstName} ${contact.lastName}` : null;
        
        const newConversation: Conversation = {
          id: Date.now().toString(),
          customerName,
          phoneNumber: selectedConversation.phoneNumber,
          messages: [newMessageObj],
          lastMessageAt: newMessageObj.timestamp,
          timestamp: newMessageObj.timestamp,
          unreadCount: 0,
          archived: false,
          deleted: false
        };

        setConversations([...conversations, newConversation]);
        setSelectedConversation(newConversation);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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
    handleSendMessage();
    return content;
  };

  // Handle dropping a conversation into a folder
  const handleDrop = async (conversationId: string, targetFolder: string) => {
    try {
      const conversation = conversations.find((c: Conversation) => c.id === conversationId);
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

  // Update the handleArchiveToggle function to handle both single and batch operations
  const handleArchiveToggle = (conversationId: string, archived: boolean) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    const updatedConversations = conversations.map(conv => 
      conv.id === conversationId ? { ...conv, archived } : conv
    );
    setConversations(updatedConversations);

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
                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Conversation archived
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {conversation.customerName || conversation.phoneNumber}
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
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-darkBrown focus:outline-none"
            >
              Undo
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
        position: 'bottom-right',
      });
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
    if (!selectedConversation) return;
    // In a real implementation, this would export the conversation
    toast('Export functionality coming soon');
  };

  const handleViewContact = () => {
    if (!selectedConversation) return;
    // In a real implementation, this would show contact details
    toast('Contact details coming soon');
  };

  const handleBlock = () => {
    if (!selectedConversation) return;
    // In a real implementation, this would block the number
    toast('Block functionality coming soon');
  };

  const handleAddToList = () => {
    if (!selectedConversation) return;
    // In a real implementation, this would add to a contact list
    toast('Add to list functionality coming soon');
  };

  const handleMessageAction = (action: string, messageId: string) => {
    if (!selectedConversation) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: conv.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                status: action === 'resend' ? 'pending' : msg.status,
                error: action === 'resend' ? undefined : msg.error
              };
            }
            return msg;
          })
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
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
            {filteredConversations.map((conversation: Conversation) => (
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
            <div className="flex-1 flex flex-col">
              <ConversationHeader 
                conversation={selectedConversation}
                onExport={handleExport}
                onViewContact={handleViewContact}
                onBlock={handleBlock}
                onAddToList={handleAddToList}
              />
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.direction === 'inbound'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-primary text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <MessageActions
                          message={message}
                          onDelete={handleMessageDelete}
                          onEdit={handleMessageEdit}
                          onCopy={handleMessageCopy}
                          onForward={handleMessageForward}
                          onResend={handleMessageResend}
                          onViewDetails={handleMessageViewDetails}
                        />
                      </div>
                      <p className="text-xs mt-1 opacity-75">
                        {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBrown disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
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
    </DndProvider>
  );
};

export default MessagingInbox;