import React, { useState } from 'react';
import { useSMSOperations } from '../hooks/useSMSOperations';
import { Contact, BulkMessageCampaign } from '../types/sms';
import { ScheduleSettings } from '../components/sms/SchedulingControls';
import ContactList from '../components/sms/ContactList';
import ContactDetail from '../components/sms/ContactDetail';
import ContactForm from '../components/sms/ContactForm';
import BulkMessaging from '../components/sms/BulkMessaging';
import MessagingInbox from '../components/sms/MessagingInbox';
import SchedulingBulkMessage from '../components/sms/SchedulingBulkMessage';
import CampaignManagement from '../components/sms/CampaignManagement';

const SMS: React.FC = () => {
  const {
    contacts,
    selectedContact,
    createContact,
    updateContact,
    deleteContact,
    toggleOptIn,
    lists,
    createList,
    addContactToList,
    removeContactFromList,
    isLoading,
    error
  } = useSMSOperations();

  const [activeTab, setActiveTab] = useState<'messaging' | 'contacts' | 'campaigns'>('messaging');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [showBulkMessaging, setShowBulkMessaging] = useState(false);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);

  const handleContactSelect = (contact: Contact) => {
    // TODO: Implement contact selection
  };

  const handleCreateContact = async (contact: Omit<Contact, 'id'>) => {
    await createContact(contact);
    setShowContactForm(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      if (contact.id) {
        deleteContact(contact.id);
      }
    }
  };

  const handleSendMessage = async (content: string, to?: string) => {
    try {
      // Find the contact if sending to a specific number
      const recipientContact = contacts.find(c => c.phoneNumber === to);
      
      // Replace personalization tokens
      let personalizedContent = content;
      if (recipientContact) {
        personalizedContent = personalizedContent
          .replace(/{firstName}/g, recipientContact.firstName)
          .replace(/{lastName}/g, recipientContact.lastName)
          .replace(/{fullName}/g, `${recipientContact.firstName} ${recipientContact.lastName}`);
      }
      
      // TODO: Implement actual message sending
      console.log('Sending personalized message:', personalizedContent, 'to:', to);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleToggleOptStatus = (contact: Contact, status: boolean) => {
    if (contact.id) {
      toggleOptIn(contact.id, status);
    }
  };

  const handleBulkMessageSend = async (message: string, recipients: string[], scheduleSettings?: ScheduleSettings) => {
    try {
      console.log('Bulk message details:');
      console.log('- Message:', message);
      console.log('- Recipients:', recipients);
      console.log('- Schedule:', scheduleSettings);
      
      // Mock API call by delaying response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would send to your backend which would handle the scheduling
      if (scheduleSettings?.type === 'immediate') {
        console.log('Sending message immediately');
      } else if (scheduleSettings?.type === 'scheduled') {
        console.log(`Message scheduled for ${scheduleSettings.scheduledDate} at ${scheduleSettings.scheduledTime}`);
      } else if (scheduleSettings?.type === 'recurring') {
        console.log(`Setting up recurring message with pattern:`, scheduleSettings.recurringPattern);
      }
      
      // Create a new campaign record
      const newCampaign: BulkMessageCampaign = {
        id: `camp_${Date.now()}`,
        name: `Campaign ${new Date().toLocaleDateString()}`,
        message,
        recipients: {
          phoneNumbers: recipients
        },
        status: scheduleSettings?.type === 'immediate' ? 'sending' : 'scheduled',
        scheduledTime: scheduleSettings?.scheduledDate && scheduleSettings?.scheduledTime
          ? `${scheduleSettings.scheduledDate}T${scheduleSettings.scheduledTime}`
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Created new campaign:', newCampaign);
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error sending bulk message:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SMS Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowBulkMessaging(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send Bulk Message
          </button>
          <button
            onClick={() => setShowSchedulingModal(true)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-darkBrown"
          >
            Schedule Messages
          </button>
          <button
            onClick={() => {
              setEditingContact(undefined);
              setShowContactForm(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Contact
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('messaging')}
            className={`${
              activeTab === 'messaging'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Messaging
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`${
              activeTab === 'contacts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Campaigns
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'messaging' ? (
          <div className="p-6">
            <MessagingInbox contacts={contacts} />
          </div>
        ) : activeTab === 'contacts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Contact List */}
            <div className="border-r border-gray-200">
              <ContactList
                contacts={contacts}
                onSelectContact={handleContactSelect}
                onCreateContact={() => setShowContactForm(true)}
                onSelectList={(list) => {
                  // TODO: Implement list selection
                }}
                listNames={lists}
                selectedList=""
              />
            </div>

            {/* Contact Detail */}
            <div className="border-r border-gray-200">
              {selectedContact ? (
                <ContactDetail
                  contact={selectedContact}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                  onSendMessage={handleSendMessage}
                  onToggleOptStatus={handleToggleOptStatus}
                />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Select a contact to view details
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <CampaignManagement 
              contacts={contacts} 
              onSendBulkMessage={handleBulkMessageSend}
            />
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <ContactForm
              contact={editingContact}
              onSubmit={editingContact ? handleEditContact : handleCreateContact}
              onCancel={() => {
                setShowContactForm(false);
                setEditingContact(undefined);
              }}
            />
          </div>
        </div>
      )}

      {/* Bulk Messaging Modal */}
      {showBulkMessaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <BulkMessaging 
              onClose={() => setShowBulkMessaging(false)} 
              contacts={contacts}
              onSendBulkMessage={handleBulkMessageSend}
            />
          </div>
        </div>
      )}

      {/* Message Scheduling Modal */}
      {showSchedulingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SchedulingBulkMessage
              contacts={contacts}
              onClose={() => setShowSchedulingModal(false)}
              onSendBulkMessage={handleBulkMessageSend}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMS;