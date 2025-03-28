import React, { useState, useRef, useEffect } from 'react';
import { Contact } from '../../types/sms';

interface ContactSelectorProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelect: (contact: Contact) => void;
  onNewContact: () => void;
  className?: string;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({
  contacts,
  selectedContact,
  onSelect,
  onNewContact,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter contacts based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(query) ||
      contact.lastName.toLowerCase().includes(query) ||
      contact.phoneNumber.includes(query)
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Contact Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      >
        {selectedContact ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {selectedContact.firstName} {selectedContact.lastName}
            </span>
            <span className="text-xs text-gray-500">
              {selectedContact.phoneNumber}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Select a contact</span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              autoFocus
            />
          </div>

          {/* Contact List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSelect(contact);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {contact.phoneNumber}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No contacts found
              </div>
            )}
          </div>

          {/* New Contact Option */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={() => {
                onNewContact();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-md focus:outline-none focus:bg-gray-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              New Contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSelector; 