import React, { useState, useRef, useEffect } from 'react';
import { MessageTemplate } from '../../types/sms';
import { useSMS } from '../../contexts/SMSContext';
import { useSocket } from '../../contexts/SocketContext';
import TemplateSelector from './TemplateSelector';
import { toast } from 'react-hot-toast';

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  onTemplateSelect: (templateId: string) => void;
  templates: MessageTemplate[];
  recipientPhone: string;
  conversationId?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTemplateSelect,
  templates,
  recipientPhone,
  conversationId
}) => {
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { socket, isConnected } = useSocket();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || !isConnected) return;

    setIsSending(true);
    setError(null);

    try {
      await onSend(message);
      
      // Clear input
      setMessage('');
      
      // Show success toast
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Format text (bold, italic, etc.)
  const formatText = (type: 'bold' | 'italic' | 'link') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    let formatted = '';
    
    switch (type) {
      case 'bold':
        formatted = `*${selectedText}*`;
        break;
      case 'italic':
        formatted = `_${selectedText}_`;
        break;
      case 'link':
        formatted = selectedText ? `[${selectedText}](url)` : '[](url)';
        break;
      default:
        return;
    }
    
    const newMessage = message.substring(0, start) + formatted + message.substring(end);
    setMessage(newMessage);
    
    // Focus and select the formatted text after state update
    setTimeout(() => {
      textarea.focus();
      if (type === 'link' && !selectedText) {
        // Place cursor inside the empty brackets
        textarea.setSelectionRange(start + 1, start + 1);
      } else {
        // Select the formatted text
        textarea.setSelectionRange(start, start + formatted.length);
      }
    }, 0);
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isSending || !isConnected}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Templates"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isSending || !isConnected}
            className={`p-2 rounded-lg ${
              !message.trim() || isSending || !isConnected
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>

      {showTemplates && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Templates</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onTemplateSelect(template.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isConnected && (
        <div className="mt-2 text-sm text-yellow-600">
          Disconnected from server. Attempting to reconnect...
        </div>
      )}
    </div>
  );
};

export default MessageComposer;