import React, { useState } from 'react';
import { MessageTemplate } from '../../types/sms';
import { sendSMS } from '../../services/TwilioService';
import TemplateSelector from './TemplateSelector';

interface MessageComposerProps {
  onSend: (message: string) => Promise<void>;
  onTemplateSelect: (template: MessageTemplate) => string;
  templates: MessageTemplate[];
  recipientPhone: string; // Add this prop
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onTemplateSelect,
  templates,
  recipientPhone
}) => {
  const [message, setMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      // Send message via Twilio service
      await sendSMS(recipientPhone, message.trim());
      // Then update UI
      await onSend(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyTemplate = (template: MessageTemplate): string => {
    const processedContent = onTemplateSelect(template);
    setMessage(processedContent);
    setShowTemplates(false);
    return processedContent;
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowTemplates(true)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          title="Select template"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className={`p-2 rounded-full ${
            message.trim() && !isSending
              ? 'bg-primary text-white hover:bg-darkBrown'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {showTemplates && (
        <TemplateSelector
          templates={templates}
          onSelectTemplate={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default MessageComposer;