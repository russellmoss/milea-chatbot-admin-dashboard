import React, { useState } from 'react';
import { Contact } from '../../types/sms';
import { ScheduleSettings } from './SchedulingControls';
import SchedulingControls from './SchedulingControls';
import RecipientSelector from './RecipientSelector';
import BulkMessageComposer from './BulkMessageComposer';

interface SchedulingBulkMessageProps {
  contacts: Contact[];
  onClose: () => void;
  onSendBulkMessage: (message: string, recipients: string[], scheduleSettings?: ScheduleSettings) => Promise<boolean>;
}

const SchedulingBulkMessage: React.FC<SchedulingBulkMessageProps> = ({
  contacts,
  onClose,
  onSendBulkMessage
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | undefined>();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    setIsSending(true);
    try {
      const recipientPhones = selectedContacts.map(c => c.phoneNumber);
      await onSendBulkMessage(message, recipientPhones, scheduleSettings);
      onClose();
    } catch (error) {
      console.error('Error sending bulk message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Bulk Message</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Recipient Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Recipients</h3>
          <RecipientSelector
            contacts={contacts}
            selectedContacts={selectedContacts}
            onRecipientsSelected={setSelectedContacts}
            lists={[]}
          />
        </div>

        {/* Message Composition */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Message</h3>
          <BulkMessageComposer
            availableRecipients={selectedContacts}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            message={message}
            setMessage={setMessage}
          />
        </div>

        {/* Scheduling Controls */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Settings</h3>
          <SchedulingControls
            onChange={setScheduleSettings}
            initialSettings={{
              type: 'immediate',
              timeZone: 'America/New_York'
            }}
            isVisible={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim() || selectedContacts.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-darkBrown disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Schedule Message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulingBulkMessage; 