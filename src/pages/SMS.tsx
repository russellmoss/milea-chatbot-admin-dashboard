import React, { useState } from 'react';
import { useSMSOperations } from '../hooks/useSMSOperations';
import { useSMS } from '../contexts/SMSContext';
import { Contact, BulkMessageCampaign, Conversation } from '../types/sms';
import ContactList from '../components/sms/ContactList';
import ContactDetail from '../components/sms/ContactDetail';
import ContactForm from '../components/sms/ContactForm';
import BulkMessaging from '../components/sms/BulkMessaging';
import MessagingInbox from '../components/sms/MessagingInbox';
import SchedulingBulkMessage from '../components/sms/SchedulingBulkMessage';
import CampaignManagement from '../components/sms/CampaignManagement';
import type { ScheduleSettings } from '../components/sms/SchedulingControls';

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

  const {
    conversations,
    selectConversation,
    markConversationAsRead,
    sendMessage
  } = useSMS();

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

  const handleEditContact = async (contact: Contact) => {
    if (contact.id) {
      await updateContact(contact.id, contact);
      setShowContactForm(false);
      setEditingContact(undefined);
    }
  };

  const handleSendBulkMessage = async (message: string, recipients: string[], scheduleSettings?: ScheduleSettings): Promise<boolean> => {
    // TODO: Implement bulk message sending
    return true;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('messaging')}
            className={`py-4 px-6 ${
              activeTab === 'messaging'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Messaging
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-4 px-6 ${
              activeTab === 'contacts'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-4 px-6 ${
              activeTab === 'campaigns'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Campaigns
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'messaging' && (
          <div className="h-full">
            <MessagingInbox />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4">
                <ContactList
                  contacts={contacts}
                  onSelectContact={(contact) => handleContactSelect(contact as Contact)}
                  onCreateContact={() => setShowContactForm(true)}
                  onSelectList={(list) => {
                    // TODO: Implement list selection
                  }}
                  listNames={lists.map(list => list.name)}
                  selectedList=""
                />
              </div>
              <div className="col-span-8">
                {selectedContact ? (
                  <ContactDetail
                    contact={selectedContact}
                    onEdit={() => {
                      setEditingContact(selectedContact);
                      setShowContactForm(true);
                    }}
                    onDelete={async () => {
                      if (selectedContact.id) {
                        await deleteContact(selectedContact.id);
                      }
                    }}
                    onToggleOptStatus={async () => {
                      if (selectedContact.id) {
                        await toggleOptIn(selectedContact.id, !selectedContact.optIn);
                      }
                    }}
                    onSendMessage={(phoneNumber) => {
                      // TODO: Implement sending message to contact
                      console.log('Sending message to:', phoneNumber);
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Select a contact to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="p-6">
            <CampaignManagement 
              contacts={contacts}
              onSendBulkMessage={handleSendBulkMessage}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onSubmit={(contact) => {
            if (editingContact) {
              handleEditContact(contact as Contact);
            } else {
              handleCreateContact(contact as Omit<Contact, 'id'>);
            }
          }}
          onCancel={() => {
            setShowContactForm(false);
            setEditingContact(undefined);
          }}
        />
      )}

      {showBulkMessaging && (
        <BulkMessaging
          onClose={() => setShowBulkMessaging(false)}
          contacts={contacts}
          onSendBulkMessage={handleSendBulkMessage}
        />
      )}

      {showSchedulingModal && (
        <SchedulingBulkMessage
          onClose={() => setShowSchedulingModal(false)}
          contacts={contacts}
          onSendBulkMessage={handleSendBulkMessage}
        />
      )}
    </div>
  );
};

export default SMS;