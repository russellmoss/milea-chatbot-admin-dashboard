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