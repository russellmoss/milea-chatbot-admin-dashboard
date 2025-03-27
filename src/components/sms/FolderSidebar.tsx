import React from 'react';
import { Conversation } from '../../types/sms';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { archiveConversation, unarchiveConversation } from '../../services/smsService';
import { DroppableFolder } from './DroppableFolder';

interface Folder {
  id: string;
  label: string;
  icon: React.ReactNode;
  filter: (conversation: Conversation) => boolean;
  getBadgeCount: (conversations: Conversation[]) => number;
}

interface FolderSidebarProps {
  folders: Folder[];
  conversations: Conversation[];
  selectedFolder: string;
  onFolderSelect: (folderId: string) => void;
  onArchiveToggle: (conversationId: string, archived: boolean) => void;
  onDrop: (conversationId: string, targetFolder: string) => void;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  conversations,
  selectedFolder,
  onFolderSelect,
  onArchiveToggle,
  onDrop
}) => {
  const isArchiveView = selectedFolder === 'archive';
  const archivedConversations = conversations.filter(conv => conv.archived && !conv.deleted);
  const archivedCount = archivedConversations.length;

  const handleUnarchive = async (conversation: Conversation) => {
    toast((t) => (
      <div className="flex flex-col items-center">
        <p className="mb-2">Move conversation back to inbox?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await unarchiveConversation(conversation.id);
                onArchiveToggle(conversation.id, false);
                toast.dismiss(t.id);
              } catch (error) {
                // Error is already handled by the service
                toast.dismiss(t.id);
              }
            }}
            className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Yes, unarchive
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  return (
    <div className="relative flex h-full">
      {/* Main Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
          <div className="space-y-2">
            {folders.map((folder) => (
              <DroppableFolder
                key={folder.id}
                folder={folder}
                isSelected={selectedFolder === folder.id}
                onSelect={onFolderSelect}
                onDrop={onDrop}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Archive Panel */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-gray-50 border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isArchiveView ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Archive Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Archived Conversations</h2>
                {archivedCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {archivedCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => onFolderSelect('inbox')}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Archive Content */}
          <div className="flex-1 overflow-y-auto">
            {archivedConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No archived conversations
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {archivedConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {conversation.customerName || conversation.phoneNumber}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUnarchive(conversation)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title="Move to inbox"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <span className="text-xs text-gray-500">
                          {format(new Date(conversation.lastMessageAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {conversation.messages.length} messages
                      </span>
                      <button
                        onClick={() => onFolderSelect('inbox')}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        View conversation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderSidebar; 