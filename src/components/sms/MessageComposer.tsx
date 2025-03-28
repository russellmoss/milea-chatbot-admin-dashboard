import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageTemplate } from '../../types/sms';
import { useMessage } from '../../contexts/MessageContext';
import { useSocket } from '../../contexts/SocketContext';

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  onTemplateSelect: (templateId: string) => void;
  templates: MessageTemplate[];
  recipientPhone: string;
  conversationId?: string;
  isExpanded?: boolean;
  width?: number;
  onWidthChange?: (width: number) => void;
  onExpandedChange?: (expanded: boolean) => void;
  onCancel: () => void;
  initialMessage?: string;
  conversation: { id: string };
  onToggleExpand: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = React.memo(({
  onSend,
  onTemplateSelect,
  templates,
  recipientPhone,
  conversationId = '',
  isExpanded = false,
  width = 400,
  onWidthChange,
  onExpandedChange,
  onCancel,
  initialMessage = '',
  conversation,
  onToggleExpand
}) => {
  const { draftMessages, setDraftMessage, clearDraftMessage } = useMessage();
  const { isConnected } = useSocket();
  const [message, setMessage] = useState(initialMessage);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_MESSAGE_LENGTH = 160;

  // Log initial props
  useEffect(() => {
    console.log('MessageComposer: Initialized with props', {
      recipientPhone,
      conversationId,
      templatesCount: templates.length,
      isConnected,
      hasDraft: !!draftMessages[conversationId || ''],
      isExpanded,
      width
    });
  }, [recipientPhone, conversationId, templates.length, isConnected, draftMessages, isExpanded, width]);

  // Load draft message if exists
  useEffect(() => {
    if (conversationId && draftMessages[conversationId]) {
      console.log('MessageComposer: Loading draft message', {
        conversationId,
        draftLength: draftMessages[conversationId].length
      });
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

  // Cleanup function
  useEffect(() => {
    return () => {
      if (message.trim()) {
        setDraftMessage(conversation.id, message);
      } else {
        clearDraftMessage(conversation.id);
      }
    };
  }, []); // Only run on unmount

  // Save draft message when message changes
  useEffect(() => {
    if (message.trim()) {
      setDraftMessage(conversation.id, message);
    } else {
      clearDraftMessage(conversation.id);
    }
  }, [message, conversation.id, setDraftMessage, clearDraftMessage]);

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    console.log('MessageComposer: Message changed', {
      newLength: newMessage.length,
      conversationId,
      hasDraft: !!draftMessages[conversationId || '']
    });
    setMessage(newMessage);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    console.log('MessageComposer: Template selected', {
      templateId,
      conversationId
    });
    onTemplateSelect(templateId);
  };

  // Handle send
  const handleSend = useCallback(async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, onSend]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setMessage('');
    onCancel();
  }, [onCancel]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Handle attachment button click
  const handleAttachmentClick = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
    // TODO: Implement attachment functionality
    console.log('Attachment button clicked');
  };

  // Handle width changes
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(width);
    }
  }, [width, onWidthChange]);

  // Handle expanded state changes
  useEffect(() => {
    if (onExpandedChange) {
      onExpandedChange(isExpanded);
    }
  }, [isExpanded, onExpandedChange]);

  return (
    <div 
      className={`border-t border-gray-200 bg-white p-4 transition-all duration-300 ${
        isExpanded ? 'shadow-lg' : ''
      }`}
      style={{ 
        width: isExpanded ? `${width}px` : 'auto',
        minWidth: isExpanded ? '300px' : 'auto',
        maxWidth: isExpanded ? '800px' : 'auto'
      }}
    >
      <form onSubmit={handleSend} className="flex flex-col space-y-2">
        {/* Formatting toolbar */}
        <div className="flex items-center space-x-2 pb-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Templates"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleAttachmentClick}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Attach File"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        </div>

        {/* Template dropdown */}
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
                        handleTemplateSelect(template.id);
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

        {/* Message input area */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none ${
                isExpanded ? 'min-h-[200px]' : 'min-h-[60px]'
              } max-h-[300px]`}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || isSending || !isConnected}
            className={`p-3 rounded-lg flex-shrink-0 self-end transition-colors duration-200 ${
              !message.trim() || isSending || !isConnected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            title={!isConnected ? "You're offline" : isSending ? "Sending..." : "Send message"}
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
          You're offline. Messages will be sent when you're back online.
        </div>
      )}
    </div>
  );
});

export default MessageComposer;