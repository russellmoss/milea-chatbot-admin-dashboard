import React, { useState, useRef, useEffect } from 'react';
import { Contact } from '../../types/sms';

interface MessageComposerProps {
  onSendMessage: (content: string, to?: string) => void;
  initialText?: string;
  to?: string;
  contacts?: Contact[];
}

interface TokenPreview {
  token: string;
  value: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  onSendMessage, 
  initialText = '', 
  to,
  contacts = [] 
}) => {
  const [message, setMessage] = useState(initialText);
  const [isSending, setIsSending] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [selectedPersonalization, setSelectedPersonalization] = useState<string | null>(null);
  const [showTokenPreview, setShowTokenPreview] = useState(false);
  const [tokenPreviews, setTokenPreviews] = useState<TokenPreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Character limit configuration
  const MAX_CHARACTERS = 1600; // Maximum characters per message
  const WARNING_THRESHOLD = 1400; // Start warning when close to limit
  const SMS_SEGMENT_SIZE = 160; // Characters per SMS segment

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

  // Personalization options
  const personalizationOptions = [
    { key: '{firstName}', label: 'First Name' },
    { key: '{lastName}', label: 'Last Name' },
    { key: '{fullName}', label: 'Full Name' },
    { key: '{phoneNumber}', label: 'Phone Number' },
    { key: '{email}', label: 'Email' }
  ];

  // Calculate message segments
  const calculateSegments = (text: string): number => {
    return Math.ceil(text.length / SMS_SEGMENT_SIZE);
  };

  // Generate token previews
  const generateTokenPreviews = (text: string): TokenPreview[] => {
    const recipientContact = contacts.find(c => c.phoneNumber === to);
    if (!recipientContact) return [];

    const previews: TokenPreview[] = [];
    const tokenRegex = /{(\w+)}/g;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      const token = match[0];
      const key = match[1];
      let value = '';

      switch (key) {
        case 'firstName':
          value = recipientContact.firstName;
          break;
        case 'lastName':
          value = recipientContact.lastName;
          break;
        case 'fullName':
          value = `${recipientContact.firstName} ${recipientContact.lastName}`;
          break;
        case 'phoneNumber':
          value = recipientContact.phoneNumber;
          break;
        case 'email':
          value = recipientContact.email || '';
          break;
      }

      if (value) {
        previews.push({ token, value });
      }
    }

    return previews;
  };

  // Update token previews when message changes
  useEffect(() => {
    const previews = generateTokenPreviews(message);
    setTokenPreviews(previews);
  }, [message, to, contacts]);

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

  // Add personalization to message
  const addPersonalization = (option: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newMessage = 
      message.substring(0, start) + 
      option + 
      message.substring(start);
    
    setMessage(newMessage);
    setShowPersonalization(false);
    
    // Place cursor after inserted personalization
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + option.length, start + option.length);
    }, 0);
  };

  // Calculate character count and remaining characters
  const characterCount = message.length;
  const remainingCharacters = MAX_CHARACTERS - characterCount;
  const segments = calculateSegments(message);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="border border-gray-300 rounded-md overflow-hidden">
        {/* Formatting toolbar */}
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center">
          <div className="flex space-x-1">
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
          </div>
          
          {/* Personalization Button */}
          <div className="ml-2 relative">
            <button
              type="button"
              onClick={() => setShowPersonalization(!showPersonalization)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
              title="Personalize"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0111 16a13.937 13.937 0 015.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* Personalization Dropdown */}
            {showPersonalization && (
              <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {personalizationOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => addPersonalization(option.key)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-3 border-0 focus:ring-0 focus:outline-none resize-none"
          rows={1}
          maxLength={MAX_CHARACTERS}
        />
      </div>
      
      {/* Token Preview */}
      {tokenPreviews.length > 0 && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md">
          <div className="text-sm font-medium text-gray-700 mb-1">Token Preview:</div>
          <div className="space-y-1">
            {tokenPreviews.map((preview, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-600">{preview.token}:</span>{' '}
                <span className="font-medium">{preview.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Character Counter and Send Button */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {characterCount > WARNING_THRESHOLD && (
            <span 
              className={`mr-2 ${
                characterCount >= MAX_CHARACTERS 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
              }`}
            >
              {characterCount >= MAX_CHARACTERS 
                ? 'Character limit reached!' 
                : 'Approaching character limit'}
            </span>
          )}
          <span className={`${
            characterCount >= WARNING_THRESHOLD 
              ? characterCount >= MAX_CHARACTERS 
                ? 'text-red-600' 
                : 'text-yellow-600'
              : 'text-gray-500'
          }`}>
            {characterCount}/{MAX_CHARACTERS} characters ({segments} {segments === 1 ? 'segment' : 'segments'})
          </span>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending || characterCount >= MAX_CHARACTERS}
          className={`px-4 py-2 rounded-md ${
            !message.trim() || isSending || characterCount >= MAX_CHARACTERS
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