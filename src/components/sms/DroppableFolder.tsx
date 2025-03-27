import React from 'react';
import { useDrop } from 'react-dnd';
import { Folder } from '../../types/sms';

interface DroppableFolderProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  onDrop: (conversationId: string, targetFolder: string) => void;
}

export const DroppableFolder: React.FC<DroppableFolderProps> = ({
  folder,
  isSelected,
  onSelect,
  onDrop
}) => {
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