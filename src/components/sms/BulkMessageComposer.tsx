import React, { useState, useRef, useEffect } from 'react';
import SchedulingControls, { ScheduleSettings, TimeZoneType } from './SchedulingControls';
import { Contact } from '../../types/sms';

interface BulkMessageComposerProps {
  selectedContacts: Contact[];
  setSelectedContacts: (contacts: Contact[]) => void;
  availableRecipients: Contact[];
  initialText?: string;
  message: string;
  setMessage: (message: string) => void;
}

const BulkMessageComposer: React.FC<BulkMessageComposerProps> = ({
  selectedContacts,
  setSelectedContacts,
  availableRecipients,
  message = '',
  setMessage
}) => {
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showRecipientsModal, setShowRecipientsModal] = useState<boolean>(false);
  const [showSchedulingModal, setShowSchedulingModal] = useState<boolean>(false);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    type: 'immediate',
    timeZone: 'America/New_York' as TimeZoneType
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    console.debug('selectedContacts changed:', selectedContacts);
  }, [selectedContacts]);

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

  // Toggle recipient selection
  const toggleRecipientSelection = (contact: Contact) => {
    if (selectedContacts.some(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  // Select all recipients
  const selectAllRecipients = () => {
    setSelectedContacts(availableRecipients);
  };

  // Clear all recipients
  const clearAllRecipients = () => {
    setSelectedContacts([]);
  };

  // Handler for schedule settings change
  const handleScheduleSettingsChange = (settings: ScheduleSettings) => {
    setScheduleSettings(settings);
  };

  // Format schedule information for display
  const formatScheduleInfo = () => {
    if (scheduleSettings.type === 'immediate') {
      return 'Message will be sent immediately';
    }
    
    if (scheduleSettings.type === 'scheduled') {
      if (scheduleSettings.scheduledDate && scheduleSettings.scheduledTime) {
        const scheduledDateTime = new Date(`${scheduleSettings.scheduledDate}T${scheduleSettings.scheduledTime}`);
        return `Scheduled for ${scheduledDateTime.toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZoneName: 'short',
          timeZone: scheduleSettings.timeZone
        })}`;
      }
      return 'Scheduled for later (date and time not set)';
    }
    
    if (scheduleSettings.type === 'recurring') {
      const pattern = scheduleSettings.recurringPattern;
      if (pattern) {
        let text = `Recurring ${pattern.type}`;
        if (pattern.type === 'weekly' && pattern.daysOfWeek?.length) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          text += ` on ${pattern.daysOfWeek.map(d => days[d]).join(', ')}`;
        }
        if (pattern.type === 'monthly' && pattern.dayOfMonth) {
          text += ` on day ${pattern.dayOfMonth}`;
        }
        if (pattern.interval && pattern.interval > 1) {
          text += ` every ${pattern.interval} ${pattern.type === 'daily' ? 'days' : pattern.type === 'weekly' ? 'weeks' : 'months'}`;
        }
        return text;
      }
      return 'Recurring message (pattern not set)';
    }
    
    return 'Schedule not configured';
  };

  return (
    <div className="space-y-4">
      {/* Recipient Selection Modal */}
      {showRecipientsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Select Recipients</h3>
              <button 
                onClick={() => setShowRecipientsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <button
                  onClick={selectAllRecipients}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllRecipients}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-2">
                {availableRecipients.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      id={contact.id}
                      checked={selectedContacts.some(c => c.id === contact.id)}
                      onChange={() => toggleRecipientSelection(contact)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-2"
                    />
                    <label 
                      htmlFor={`recipient-${contact.id}`}
                      className="text-sm text-gray-700"
                    >
                      {contact.phoneNumber}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRecipientsModal(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Scheduling Modal */}
      {showSchedulingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Message Scheduling</h3>
              <button 
                onClick={() => setShowSchedulingModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <SchedulingControls 
                initialSettings={scheduleSettings}
                onChange={handleScheduleSettingsChange}
              />
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSchedulingModal(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Apply Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Recipient Selection Bar */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <span className="mr-2 text-sm text-gray-600">To:</span>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {selectedContacts.length === 0 ? (
            <button
              onClick={() => setShowRecipientsModal(true)}
              className="text-sm text-gray-500 hover:text-primary"
            >
              Select Recipients
            </button>
          ) : (
            <>
              {selectedContacts.map(recipient => (
                <span 
                  key={recipient.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                >
                  {recipient.phoneNumber}
                  <button
                    onClick={() => toggleRecipientSelection(recipient)}
                    className="ml-1 text-primary-400 hover:text-primary-600"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path 
                        fillRule="evenodd" 
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </button>
                </span>
              ))}
              <button
                onClick={() => setShowRecipientsModal(true)}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Edit
              </button>
            </>
          )}
        </div>
        <div className="ml-2">
          <span className="text-sm text-gray-500">
            {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>
      
      {/* Formatting Toolbar */}
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
      
      {/* Message Textarea */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your bulk message..."
        className="w-full p-3 border-0 focus:ring-0 focus:outline-none resize-none min-h-[150px]"
      />
      
      {/* Time Zone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Zone
        </label>
        <select
          value={scheduleSettings.timeZone}
          onChange={(e) => setScheduleSettings(prev => ({
            ...prev,
            timeZone: e.target.value as TimeZoneType
          }))}
          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="America/Anchorage">Alaska Time (AKT)</option>
          <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
          <option value="UTC">Universal Time (UTC)</option>
          <option value="Europe/London">London (GMT)</option>
        </select>
      </div>
      
      {/* Message Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Scheduling Button */}
          <button
            type="button"
            onClick={() => setShowSchedulingModal(true)}
            className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
          >
            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {scheduleSettings.type === 'immediate' ? 'Schedule Message' : 'Edit Schedule'}
          </button>
          
          {/* Template Selector */}
          <button
            type="button"
            className="text-sm text-primary hover:text-primary-dark flex items-center"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Use Template
          </button>
          
          {/* Schedule Display */}
          {scheduleSettings.type !== 'immediate' && (
            <div className="text-sm text-gray-600 flex items-center">
              <svg className="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatScheduleInfo()}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {message.length} characters
          </span>
          
          <button
            type="submit"
            onClick={() => {}}
            disabled={!message.trim() || selectedContacts.length === 0 || isSending}
            className={`px-4 py-2 rounded-md ${
              !message.trim() || selectedContacts.length === 0 || isSending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {isSending ? 'Sending...' : scheduleSettings.type === 'immediate' 
              ? `Send to ${selectedContacts.length} Recipients` 
              : scheduleSettings.type === 'scheduled'
                ? 'Schedule Message'
                : 'Set Up Recurring Messages'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkMessageComposer;