import React, { useState, useRef, useEffect } from 'react';

interface MessageComposerProps {
  onSendMessage: (content: string, to?: string) => void;
  initialText?: string;
  to?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSendMessage, initialText = '', to }) => {
  const [message, setMessage] = useState(initialText);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update message when initialText changes
  useEffect(() => {
    if (initialText) {
      setMessage(initialText);
    }
  }, [initialText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending) return;
    
    try {
      setIsSending(true);
      await onSendMessage(message, to);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="border border-gray-300 rounded-md overflow-hidden">
        {/* Formatting toolbar */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex">
          <button
            type="button"
            onClick={() => formatText('bold')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
            title="Bold"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.5 10a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm-4-7a2 2 0 100 4 2 2 0 000-4zm8 8a2 2 0 11-4 0 2 2 0 014 0zM6.5 18a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
            title="Italic"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-3-1a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('link')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
            title="Link"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="mx-1 border-l border-gray-300"></div>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
            title="Emoji"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
            title="Attach File"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-3 border-0 focus:ring-0 focus:outline-none resize-none"
          rows={1}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {/* Character count or other metrics could go here */}
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className={`px-4 py-2 rounded-md ${
            !message.trim() || isSending
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-darkBrown'
          }`}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageComposer;