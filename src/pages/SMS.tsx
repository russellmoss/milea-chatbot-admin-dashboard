import React, { useState } from 'react';
import MessagingInbox from '../components/sms/MessagingInbox';
import ContactList from '../components/sms/ContactList';
import ContactDetail from '../components/sms/ContactDetail';
import ContactForm, { Contact } from '../components/sms/ContactForm';

// Sample contact data
const SAMPLE_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '+1 (555) 123-4567',
    email: 'john.smith@example.com',
    tags: ['VIP', 'Wine Club'],
    lastContact: '2024-03-25T14:30:00',
    notes: 'Preferred customer, interested in red wines',
    optIn: true
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phoneNumber: '+1 (555) 234-5678',
    email: 'sarah.j@example.com',
    tags: ['Event Attendee'],
    lastContact: '2024-03-24T09:15:00',
    notes: 'Attended last summer wine tasting event',
    optIn: true
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Brown',
    phoneNumber: '+1 (555) 345-6789',
    email: 'michael.b@example.com',
    tags: ['Newsletter'],
    lastContact: '2024-03-23T16:45:00',
    notes: 'Subscribed to newsletter, interested in wine education',
    optIn: true
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Davis',
    phoneNumber: '+1 (555) 456-7890',
    email: 'emily.d@example.com',
    tags: ['VIP', 'Wine Club'],
    lastContact: '2024-03-22T11:20:00',
    notes: 'Regular wine club member, prefers white wines',
    optIn: true
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Wilson',
    phoneNumber: '+1 (555) 567-8901',
    email: 'david.w@example.com',
    tags: ['Event Attendee'],
    lastContact: '2024-03-21T15:10:00',
    notes: 'Attended last month\'s wine pairing dinner',
    optIn: true
  }
];

const SMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messaging' | 'contacts'>('messaging');
  const [contacts, setContacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [listNames, setListNames] = useState<string[]>(['VIP', 'Wine Club', 'Event Attendee', 'Newsletter']);
  const [selectedList, setSelectedList] = useState<string>('All Contacts');

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  // Handle contact creation
  const handleCreateContact = () => {
    setEditingContact(undefined);
    setIsContactFormOpen(true);
  };

  // Handle contact edit
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactFormOpen(true);
  };

  // Handle contact delete
  const handleDeleteContact = (contact: Contact) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== contact.id));
      if (selectedContact?.id === contact.id) {
        setSelectedContact(undefined);
      }
    }
  };

  // Handle contact form submit
  const handleContactFormSubmit = (contactData: Contact) => {
    if (editingContact) {
      // Update existing contact
      setContacts(contacts.map(contact => 
        contact.id === editingContact.id ? { ...contact, ...contactData } : contact
      ));
    } else {
      // Create new contact
      const newContact: Contact = {
        ...contactData,
        id: Date.now().toString(),
        lastContact: new Date().toISOString()
      };
      setContacts([...contacts, newContact]);
    }
    setIsContactFormOpen(false);
    setEditingContact(undefined);
  };

  // Handle sending message
  const handleSendMessage = (phoneNumber: string) => {
    // TODO: Implement message sending functionality
    console.log('Sending message to:', phoneNumber);
  };

  // Handle opt-in status toggle
  const handleToggleOptStatus = (contact: Contact, status: boolean) => {
    setContacts(contacts.map(c => 
      c.id === contact.id ? { ...c, optIn: status } : c
    ));
    if (selectedContact?.id === contact.id) {
      setSelectedContact(prev => prev ? { ...prev, optIn: status } : undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary mb-4">SMS Management</h2>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('messaging')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messaging'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messaging
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contacts
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'messaging' ? (
            <MessagingInbox />
          ) : (
            <div className="flex h-[calc(100vh-300px)] min-h-[500px]">
              {/* Contact list */}
              <div className="w-1/3 border-r border-gray-200">
                <ContactList
                  contacts={contacts}
                  onSelectContact={handleContactSelect}
                  onCreateContact={handleCreateContact}
                  onImportContacts={() => console.log('Import contacts')}
                  onCreateList={() => console.log('Create list')}
                  selectedContact={selectedContact}
                  listNames={listNames}
                  selectedList={selectedList}
                  onSelectList={setSelectedList}
                />
              </div>

              {/* Contact detail */}
              <div className="flex-1 p-6">
                {selectedContact ? (
                  <ContactDetail
                    contact={selectedContact}
                    onEdit={() => handleEditContact(selectedContact)}
                    onDelete={() => handleDeleteContact(selectedContact)}
                    onSendMessage={handleSendMessage}
                    onToggleOptStatus={(status) => handleToggleOptStatus(selectedContact, status)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Select a contact to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact form modal */}
      {isContactFormOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsContactFormOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <ContactForm
                contact={editingContact}
                onSubmit={handleContactFormSubmit}
                onCancel={() => {
                  setIsContactFormOpen(false);
                  setEditingContact(undefined);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMS;