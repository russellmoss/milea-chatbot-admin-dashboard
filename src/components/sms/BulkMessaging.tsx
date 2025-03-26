import React, { useState, useEffect } from 'react';
import { useSMSOperations } from '../../hooks/useSMSOperations';
import { Contact, BulkMessageCampaign } from '../../types/sms';
import BulkMessageComposer from './BulkMessageComposer';
import ContactList from './ContactList';

interface BulkMessagingProps {
  onClose: () => void;
}

const BulkMessaging: React.FC<BulkMessagingProps> = ({ onClose }) => {
  const { 
    contacts,
    lists,
    createList,
    addContactToList,
    removeContactFromList,
    isLoading,
    error
  } = useSMSOperations();

  const [selectedList, setSelectedList] = useState<string>('');
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<BulkMessageCampaign[]>([]);

  // Filter contacts based on selected list
  useEffect(() => {
    if (selectedList) {
      const filteredContacts = contacts.filter(contact => 
        contact.lists?.includes(selectedList)
      );
      setSelectedContacts(filteredContacts);
    } else {
      setSelectedContacts(contacts);
    }
  }, [selectedList, contacts]);

  // Send bulk message
  const handleSendBulkMessage = async (message: string, recipients: string[]) => {
    try {
      // Create a new campaign
      const newCampaign: BulkMessageCampaign = {
        id: `campaign_${Date.now()}`,
        name: `Bulk Message - ${new Date().toLocaleString()}`,
        message,
        recipients: {
          phoneNumbers: recipients
        },
        status: 'sending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate sending messages
      console.log('Sending bulk message:', newCampaign);

      // In a real implementation, this would call a service to send messages
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update campaigns
      setCampaigns(prev => [newCampaign, ...prev]);

      // Clear selected contacts
      setSelectedContacts([]);

      alert(`Message sent to ${recipients.length} recipients`);
      onClose();
    } catch (error) {
      console.error('Failed to send bulk message:', error);
      alert('Failed to send bulk message');
    }
  };

  // Render campaigns list
  const renderCampaignsList = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Messaging Campaigns</h3>
        </div>
        {campaigns.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No messaging campaigns yet
          </div>
        ) : (
          <ul>
            {campaigns.map(campaign => (
              <li 
                key={campaign.id} 
                className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(campaign.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sent to {campaign.recipients.phoneNumbers?.length || 0} recipients
                    </p>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Bulk Messaging</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipients Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Recipients</h3>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="contactList" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contact List
                </label>
                <select
                  id="contactList"
                  value={selectedList}
                  onChange={(e) => setSelectedList(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">All Contacts</option>
                  {lists.map(list => (
                    <option key={list} value={list}>{list}</option>
                  ))}
                </select>
              </div>
              
              {/* Contact List */}
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {selectedContacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 flex items-center"
                  >
                    <input
                      type="checkbox"
                      id={`contact-${contact.id}`}
                      checked={selectedContacts.some(c => c.id === contact.id)}
                      onChange={() => {
                        setSelectedContacts(prev => 
                          prev.some(c => c.id === contact.id)
                            ? prev.filter(c => c.id !== contact.id)
                            : [...prev, contact]
                        );
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-3"
                    />
                    <label 
                      htmlFor={`contact-${contact.id}`} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.phoneNumber}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-500">
                {selectedContacts.length} recipients selected
              </div>
            </div>
          </div>
          
          {/* Message Composer */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Message</h3>
            <BulkMessageComposer
              onSendBulkMessage={handleSendBulkMessage}
              availableRecipients={selectedContacts.map(c => c.phoneNumber)}
            />
          </div>
        </div>
      </div>
      
      {/* Campaigns History */}
      <div>
        {renderCampaignsList()}
      </div>
    </div>
  );
};

export default BulkMessaging;