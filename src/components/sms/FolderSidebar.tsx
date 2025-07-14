import React, { useState, useRef } from 'react';
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
  isExpanded: boolean;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  conversations,
  selectedFolder,
  onFolderSelect,
  onArchiveToggle,
  onDrop,
  isExpanded
}) => {
  const collapseTimeoutRef = useRef<NodeJS.Timeout>();
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
    <div className="h-full flex">
      {/* Expandable Content */}
      <div 
        className={`h-full bg-white border-r border-gray-200 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-52 opacity-100' : 'w-0 opacity-0'}`}
      >
        <div className="p-4 w-52">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Folders</h2>
          <div className="space-y-2">
            {folders.map((folder) => (
              <DroppableFolder
                key={folder.id}
                folder={folder}
                conversations={conversations}
                isSelected={selectedFolder === folder.id}
                onSelect={onFolderSelect}
                onDrop={onDrop}
                isExpanded={isExpanded}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderSidebar; 