import React, { useEffect, useRef } from 'react';

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  position,
  onClose,
  className = ''
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-50 min-w-[200px] py-1 bg-white rounded-lg shadow-lg
        border border-gray-200 ${className}
      `}
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          disabled={item.disabled}
          className={`
            w-full px-4 py-2 text-left text-sm flex items-center gap-2
            hover:bg-gray-100 transition-colors
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${item.danger ? 'text-red-600 hover:text-red-700' : 'text-gray-700'}
          `}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu; 