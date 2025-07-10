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
      {/* Base Sidebar with Icons */}
      <div className="w-12 h-full bg-white border-r border-gray-200">
        <div className="p-2">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div className="space-y-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-center p-2"
                onClick={() => onFolderSelect(folder.id)}
              >
                <div className={`${selectedFolder === folder.id ? 'text-primary' : 'text-gray-600'}`}>
                  {folder.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
                isSelected={selectedFolder === folder.id}
                onSelect={onFolderSelect}
                onDrop={onDrop}
                isExpanded={isExpanded}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Archive Panel */}
      <div 
        className={`h-full bg-white border-r border-gray-200 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isArchiveView ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}
      >
        <div className="h-full flex flex-col">
          {/* Archive Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Archived Conversations</h2>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {archivedCount}
                </span>
              </div>
              <button
                onClick={() => onFolderSelect('inbox')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Archive Content */}
          <div className="flex-1 overflow-y-auto">
            {archivedConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No archived conversations
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {archivedConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUnarchive(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {conversation.firstname + ' ' + conversation.lastname || conversation.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {conversation.messages[conversation.messages.length - 1]?.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
                      </span>
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