import React, { useState, useEffect, useMemo } from 'react';
import { Contact } from '../../types/sms';
import { on } from 'events';

interface RecipientSelectorProps {
  contacts: Contact[];
  selectedContacts: Contact[];
  lists: string[];  // Array of list IDs or names
  onRecipientsSelected: (recipients: Contact[]) => void;
  initialSelectedContacts?: Contact[];
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ 
  contacts,
  selectedContacts,
  lists, 
  onRecipientsSelected,
  initialSelectedContacts = []
}) => {
  // State for filtering and selection
  const [selectedListId, setSelectedListId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [optInFilter, setOptInFilter] = useState<boolean | null>(true); // Default to opted-in contacts
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all available tags from contacts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach(contact => {
      if (contact.tags) {
        contact.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  // Filter contacts based on selected criteria
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // List filtering
      if (selectedListId !== 'all' && (!contact.lists || !contact.lists.includes(selectedListId))) {
        return false;
      }

      // Opt-in filtering
      if (optInFilter !== null && contact.optIn !== optInFilter) {
        return false;
      }

      // Tag filtering
      if (selectedTags.length > 0) {
        if (!contact.tags) return false;
        if (!selectedTags.every(tag => contact.tags?.includes(tag))) {
          return false;
        }
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          contact.firstName.toLowerCase().includes(query) ||
          contact.lastName.toLowerCase().includes(query) ||
          contact.phoneNumber.includes(query) ||
          (contact.email && contact.email.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [contacts, selectedListId, optInFilter, selectedTags, searchQuery]);

  // When filtered contacts change, update the parent component
  useEffect(() => {
    onRecipientsSelected(selectedContacts);
  }, [selectedContacts, onRecipientsSelected]);

  // Select all contacts in the filtered list
  const handleSelectAll = () => {
    onRecipientsSelected(filteredContacts);
  };

  // Clear all selections
  const handleClearAll = () => {
    onRecipientsSelected([]);
  };

  // Toggle a specific contact selection
  const toggleContactSelection = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      onRecipientsSelected(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      onRecipientsSelected([...selectedContacts, contact]);
    }
  };

  // Toggle a tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  // Check if a contact is selected
  const isContactSelected = (contact: Contact) => {
    return selectedContacts.some(c => c.id === contact.id);
  };

  return (
    <div className="space-y-6">
      {/* Filters section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Recipients</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Contacts
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* List filter */}
          <div>
            <label htmlFor="listFilter" className="block text-sm font-medium text-gray-700 mb-1">
              List
            </label>
            <select
              id="listFilter"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="all">All Contacts</option>
              {lists.map(list => (
                <option key={list} value={list}>{list}</option>
              ))}
            </select>
          </div>

          {/* Opt-in status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opt-in Status
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={optInFilter === true}
                  onChange={() => setOptInFilter(true)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Opted In</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={optInFilter === false}
                  onChange={() => setOptInFilter(false)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Opted Out</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={optInFilter === null}
                  onChange={() => setOptInFilter(null)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">All</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {availableTags.length === 0 && (
                <span className="text-sm text-gray-500">No tags available</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipient selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Available Recipients ({filteredContacts.length})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-darkBrown"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Recipient list */}
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No contacts match your filters
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={filteredContacts.length > 0 && filteredContacts.every(contact => isContactSelected(contact))}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map(contact => (
                  <tr 
                    key={contact.id} 
                    className={isContactSelected(contact) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    onClick={() => toggleContactSelection(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isContactSelected(contact)}
                        onChange={() => toggleContactSelection(contact)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.optIn ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Opted In
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Opted Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected count */}
        <div className="mt-4 text-right">
          <span className="text-sm text-gray-700">
            {selectedContacts.length} of {filteredContacts.length} contacts selected
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipientSelector;