import React, { useState, useEffect } from 'react';
import { useSMSOperations } from '../hooks/useSMSOperations';
import { useSMS } from '../contexts/SMSContext';
import { Contact } from '../types/sms';
import ContactList from '../components/sms/ContactList';
import ContactDetail from '../components/sms/ContactDetail';
import ContactForm from '../components/sms/ContactForm';
import BulkMessaging from '../components/sms/BulkMessaging';
import MessagingInbox from '../components/sms/MessagingInbox';
import CampaignManagement from '../components/sms/CampaignManagement';
import TemplateLibrary from '../components/sms/TemplateLibrary';
import { toast } from 'react-hot-toast';

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
    selectContact,
    isLoading: contactsLoading,
    error: contactsError
  } = useSMSOperations();

  const {
    conversations,
    sendMessage,
    handleArchiveToggle,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useSMS();

  const [activeTab, setActiveTab] = useState<'messaging' | 'contacts' | 'campaigns' | 'templates'>('messaging');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [showBulkMessaging, setShowBulkMessaging] = useState(false);

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    selectContact(contact);
  };

  // Handle contact creation
  const handleCreateContact = async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createContact(contact);
      setShowContactForm(false);
      toast.success('Contact created successfully');
    } catch (err) {
      toast.error('Failed to create contact');
    }
  };

  // Handle contact update
  const handleUpdateContact = async (contact: Contact) => {
    try {
      if (contact.id) {
        await updateContact(contact.id, contact);
        setShowContactForm(false);
        setEditingContact(undefined);
        toast.success('Contact updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update contact');
    }
  };

  // Handle contact deletion
  const handleDeleteContact = async (contact: Contact) => {
    try {
      if (contact.id) {
        await deleteContact(contact.id);
        toast.success('Contact deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  // Handle sending a message to a contact
  const handleSendMessageToContact = (phoneNumber: string) => {
    // Find the conversation for this contact or create a new one
    const existingConversation = conversations.find(conv => conv.phoneNumber === phoneNumber);
    
    if (existingConversation) {
      // Switch to messaging tab and select this conversation
      setActiveTab('messaging');
    } else {
      // Switch to messaging tab, selection will happen when message is sent
      setActiveTab('messaging');
      toast.info('Switch to messaging tab to start a new conversation', {
        duration: 3000
      });
    }
  };

  // Handle bulk message sending
  const handleSendBulkMessage = async (message: string, recipients: string[]): Promise<boolean> => {
    try {
      // In a real app, we would call an API here
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Message sent to ${recipients.length} recipients`);
      return true;
    } catch (err) {
      toast.error('Failed to send bulk message');
      return false;
    }
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
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-6 ${
              activeTab === 'templates'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
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
              <div className="col-span-12 md:col-span-5 lg:col-span-4">
                <ContactList
                  contacts={contacts}
                  onSelectContact={handleContactSelect}
                  onCreateContact={() => {
                    setEditingContact(undefined);
                    setShowContactForm(true);
                  }}
                  onSelectList={() => {}}
                  listNames={lists.map(list => list.name)}
                  selectedList=""
                  isLoading={contactsLoading}
                  error={contactsError}
                />
              </div>
              <div className="col-span-12 md:col-span-7 lg:col-span-8">
                {selectedContact ? (
                  <ContactDetail
                    contact={selectedContact}
                    onEdit={() => {
                      setEditingContact(selectedContact);
                      setShowContactForm(true);
                    }}
                    onDelete={handleDeleteContact}
                    onToggleOptStatus={async (contact, status) => {
                      try {
                        await toggleOptIn(contact.id, status);
                        toast.success(`Contact ${status ? 'opted in' : 'opted out'} successfully`);
                      } catch (err) {
                        toast.error('Failed to update opt-in status');
                      }
                    }}
                    onSendMessage={handleSendMessageToContact}
                    onAddToList={async () => {
                      // This would normally show a modal to select lists
                      if (lists.length > 0 && selectedContact?.id) {
                        try {
                          await addContactToList(selectedContact.id, lists[0].id);
                          toast.success(`Contact added to ${lists[0].name}`);
                        } catch (err) {
                          toast.error('Failed to add contact to list');
                        }
                      } else {
                        toast.error('No lists available');
                      }
                    }}
                    onRemoveFromList={async () => {
                      // This would normally show a modal to select lists to remove
                      if (selectedContact?.lists?.length && selectedContact?.id) {
                        try {
                          await removeContactFromList(selectedContact.id, selectedContact.lists[0]);
                          toast.success('Contact removed from list');
                        } catch (err) {
                          toast.error('Failed to remove contact from list');
                        }
                      }
                    }}
                    isLoading={contactsLoading}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-sm">
                    <div className="text-center p-6">
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        aria-hidden="true"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No contact selected</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a contact to view details or create a new contact.
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContact(undefined);
                            setShowContactForm(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-darkBrown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <svg 
                            className="-ml-1 mr-2 h-5 w-5" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            aria-hidden="true"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          New Contact
                        </button>
                      </div>
                    </div>
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

        {activeTab === 'templates' && (
          <div className="p-6">
            <TemplateLibrary />
          </div>
        )}
      </div>

      {/* Modals */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ContactForm
              contact={editingContact}
              onSubmit={(contact) => {
                if (editingContact) {
                  handleUpdateContact(contact as Contact);
                } else {
                  handleCreateContact(contact);
                }
              }}
              onCancel={() => {
                setShowContactForm(false);
                setEditingContact(undefined);
              }}
              isSubmitting={contactsLoading}
            />
          </div>
        </div>
      )}

      {showBulkMessaging && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BulkMessaging
              onClose={() => setShowBulkMessaging(false)}
              contacts={contacts}
              onSendBulkMessage={handleSendBulkMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SMS;