import React from 'react';
import { useDrop } from 'react-dnd';
import { Folder, Conversation } from '../../types/sms';

interface DroppableFolderProps {
  folder: Folder;
  conversations: Conversation[];
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  onDrop: (conversationId: string, targetFolder: string) => void;
  isExpanded: boolean;
}

export const DroppableFolder: React.FC<DroppableFolderProps> = ({
  folder,
  conversations,
  isSelected,
  onSelect,
  onDrop,
  isExpanded
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'conversation',
    drop: (item: { id: string }) => {
      onDrop(item.id, folder.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      onClick={() => onSelect(folder.id)}
      className={`
        flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}
        ${isOver ? 'bg-primary/5' : ''}
      `}
    >
      <div className="flex-shrink-0">
        {folder.icon}
      </div>
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <span className="truncate">{folder.label}</span>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            {folder.getBadgeCount(conversations)}
          </span>
        </div>
      </div>
    </div>
  );
}; 