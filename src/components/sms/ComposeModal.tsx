import React, { useState, useEffect } from 'react';
import { Contact, MessageTemplate } from '../../types/sms';
import { useSMS } from '../../contexts/SMSContext';
import ContactSelector from './ContactSelector';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose }) => {
  const { contacts, templates, sendMessage } = useSMS();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isPhoneInput, setIsPhoneInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const MAX_MESSAGE_LENGTH = 160;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedContact(null);
    setPhoneNumber('');
    setMessage('');
    setSelectedTemplate(null);
    setIsPhoneInput(false);
    setError(null);
    setShowContactForm(false);
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Basic E.164 validation (can be enhanced)
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(number);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setPhoneNumber(contact.phoneNumber);
    setIsPhoneInput(false);
    setError(null);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setSelectedContact(null);
    setIsPhoneInput(true);
    setError(null);
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setMessage(template.content);
  };

  const handleNewContact = () => {
    setShowContactForm(true);
    // TODO: Implement contact form modal
    console.log('Open contact form');
  };

  const handleSend = async () => {
    try {
      setError(null);
      
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number in E.164 format (e.g., +1234567890)');
        return;
      }

      // Validate message
      if (!message.trim()) {
        setError('Please enter a message');
        return;
      }

      // Send message
      await sendMessage(message, phoneNumber);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  New Message
                </h3>

                {/* Contact Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <div className="flex space-x-2">
                    <ContactSelector
                      contacts={contacts}
                      selectedContact={selectedContact}
                      onSelect={handleContactSelect}
                      onNewContact={handleNewContact}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPhoneInput(!isPhoneInput)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {isPhoneInput ? 'Use Contact' : 'Manual Entry'}
                    </button>
                  </div>
                </div>

                {/* Phone Number Input */}
                {isPhoneInput && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="+1234567890"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter phone number in E.164 format (e.g., +1234567890)
                    </p>
                  </div>
                )}

                {/* Template Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template (Optional)
                  </label>
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value);
                      if (template) handleTemplateSelect(template);
                    }}
                  >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="Type your message..."
                  />
                  <div className="mt-1 flex justify-between">
                    <p className="text-xs text-gray-500">
                      {message.length}/{MAX_MESSAGE_LENGTH} characters
                    </p>
                    {message.length > MAX_MESSAGE_LENGTH && (
                      <p className="text-xs text-red-600">
                        Message exceeds maximum length
                      </p>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || !phoneNumber || message.length > MAX_MESSAGE_LENGTH}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal; 