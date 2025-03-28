import React, { useState, useRef, useEffect } from 'react';
import { MessageTemplate } from '../../types/sms';
import { useMessage } from '../../contexts/MessageContext';
import { useSocket } from '../../contexts/SocketContext';

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
  conversationId = ''
}) => {
  const { draftMessages, setDraftMessage } = useMessage();
  const { isConnected } = useSocket();
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize from draft message if available
  useEffect(() => {
    if (conversationId && draftMessages[conversationId]) {
      setMessage(draftMessages[conversationId]);
    } else {
      setMessage('');
    }
  }, [conversationId, draftMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Save draft as user types
  useEffect(() => {
    if (conversationId) {
      setDraftMessage(conversationId, message);
    }
  }, [conversationId, message, setDraftMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || !isConnected) return;

    setIsSending(true);
    setError(null);

    try {
      await onSend(message);
      
      // Clear input on successful send
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter without shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        {/* Formatting toolbar */}
        <div className="flex items-center space-x-2 pb-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Templates"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>
          
          {/* Additional formatting buttons could go here */}
          
          {showTemplates && (
            <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
              <h3 className="font-medium text-gray-900 mb-2">Templates</h3>
              <div className="max-h-48 overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="text-sm text-gray-500">No templates available</p>
                ) : (
                  <div className="space-y-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          onTemplateSelect(template.id);
                          setShowTemplates(false);
                        }}
                        className="block w-full text-left p-2 text-sm hover:bg-gray-100 rounded"
                      >
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-gray-600 truncate">{template.content}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none min-h-[60px] max-h-[150px]"
            disabled={isSending || !isConnected}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || isSending || !isConnected}
            className={`p-3 rounded-lg flex-shrink-0 self-end ${
              !message.trim() || isSending || !isConnected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-darkBrown'
            }`}
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isConnected && (
        <div className="mt-2 text-sm text-yellow-600">
          You're currently offline. Messages will be sent when you reconnect.
        </div>
      )}
    </div>
  );
};

export default MessageComposer;