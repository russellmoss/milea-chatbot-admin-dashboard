import React, { useState, useEffect, useMemo } from 'react';
import { Contact, Message, Conversation } from '../../types/sms';

interface ExclusionRule {
  type: 'tag' | 'list' | 'optIn' | 'createdBefore' | 'neverContacted' | 'lastContactedBefore';
  value?: string | boolean | Date;
}

interface ContactHistory {
  phoneNumber: string;
  lastContacted: Date;
  contactCount: number;
  lastMessageType: 'inbound' | 'outbound' | 'none';
}

interface RecipientSelectorProps {
  contacts: Contact[];
  lists: string[];
  onRecipientsSelected: (recipients: Contact[]) => void;
  conversations?: Conversation[];
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ 
  contacts, 
  lists, 
  onRecipientsSelected,
  conversations = []
}) => {
  // State for filtering and selection
  const [selectedList, setSelectedList] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<{
    optIn?: boolean;
    tags?: string[];
    createdAfter?: string;
  }>({});
  const [exclusionRules, setExclusionRules] = useState<ExclusionRule[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  // Filtering criteria
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Contact history tracking
  const contactHistory = useMemo(() => {
    const history: Record<string, ContactHistory> = {};
    
    contacts.forEach(contact => {
      history[contact.phoneNumber] = {
        phoneNumber: contact.phoneNumber,
        lastContacted: new Date(0),
        contactCount: 0,
        lastMessageType: 'none'
      };
    });

    // Process conversations
    conversations.forEach(conversation => {
      const phoneNumber = conversation.phoneNumber;
      if (phoneNumber && history[phoneNumber]) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        if (lastMessage) {
          const messageDate = new Date(lastMessage.timestamp);
          const currentHistory = history[phoneNumber];
          
          if (messageDate > currentHistory.lastContacted) {
            currentHistory.lastContacted = messageDate;
            currentHistory.lastMessageType = lastMessage.direction;
          }
          currentHistory.contactCount += conversation.messages.length;
        }
      }
    });

    return history;
  }, [contacts, conversations]);

  // Extract unique tags from contacts
  useEffect(() => {
    const tagSet = new Set<string>();
    contacts.forEach(contact => 
      contact.tags?.forEach(tag => tagSet.add(tag))
    );
    setAvailableTags(Array.from(tagSet));
  }, [contacts]);

  // Filter contacts based on selected criteria
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // List filtering - early return if list filter is active
      if (selectedList && (!contact.lists || !contact.lists.includes(selectedList))) {
        return false;
      }

      // Search query filtering - early return if no match
      if (searchQuery && searchQuery.length > 0) {
        const searchQueryLower = searchQuery.toLowerCase();
        const matchesSearch = 
          contact.firstName.toLowerCase().includes(searchQueryLower) ||
          contact.lastName.toLowerCase().includes(searchQueryLower) ||
          contact.phoneNumber.includes(searchQueryLower) ||
          (contact.email && contact.email.toLowerCase().includes(searchQueryLower));
        
        if (!matchesSearch) return false;
      }

      // Opt-in filtering
      if (filterOptions.optIn !== undefined && 
          contact.optIn !== filterOptions.optIn) {
        return false;
      }

      // Tags filtering - early return if no match
      if (filterOptions.tags && filterOptions.tags.length > 0) {
        const contactTags = contact.tags || [];
        if (!filterOptions.tags.every(tag => contactTags.includes(tag))) {
          return false;
        }
      }

      // Created after filtering
      if (filterOptions.createdAfter && contact.createdAt) {
        const contactDate = new Date(contact.createdAt);
        if (contactDate < new Date(filterOptions.createdAfter)) {
          return false;
        }
      }

      // Enhanced exclusion rules filtering
      const isExcluded = exclusionRules.some(rule => {
        switch (rule.type) {
          case 'tag':
            return contact.tags?.includes(rule.value as string);
          case 'list':
            return contact.lists?.includes(rule.value as string);
          case 'optIn':
            return contact.optIn === rule.value;
          case 'createdBefore':
            return contact.createdAt && 
              new Date(contact.createdAt) < new Date(rule.value as string);
          case 'neverContacted':
            return contactHistory[contact.phoneNumber]?.contactCount === 0;
          case 'lastContactedBefore':
            const lastContacted = contactHistory[contact.phoneNumber]?.lastContacted;
            return lastContacted && lastContacted < new Date(rule.value as string);
          default:
            return false;
        }
      });

      return !isExcluded;
    });
  }, [contacts, selectedList, searchQuery, filterOptions, exclusionRules, contactHistory]);

  // Add an exclusion rule
  const addExclusionRule = (rule: ExclusionRule) => {
    setExclusionRules(prev => [...prev, rule]);
  };

  // Remove an exclusion rule
  const removeExclusionRule = (ruleToRemove: ExclusionRule) => {
    setExclusionRules(prev => 
      prev.filter(rule => 
        !(rule.type === ruleToRemove.type && rule.value === ruleToRemove.value)
      )
    );
  };

  // Render exclusion rules section
  const renderExclusionRules = () => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Exclusion Rules
        </h3>
        <button
          onClick={() => setExclusionRules([])}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear All Rules
        </button>
      </div>
      
      {/* Exclusion Rule Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {/* Tag Exclusion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exclude by Tag
          </label>
          <select
            onChange={(e) => {
              const tag = e.target.value;
              if (tag) {
                addExclusionRule({ type: 'tag', value: tag });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a tag</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* List Exclusion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exclude by List
          </label>
          <select
            onChange={(e) => {
              const list = e.target.value;
              if (list) {
                addExclusionRule({ type: 'list', value: list });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a list</option>
            {lists.map(list => (
              <option key={list} value={list}>{list}</option>
            ))}
          </select>
        </div>

        {/* Opt-in Exclusion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exclude by Opt-in Status
          </label>
          <select
            onChange={(e) => {
              const optIn = e.target.value === 'true';
              addExclusionRule({ type: 'optIn', value: optIn });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select opt-in status</option>
            <option value="true">Opted In</option>
            <option value="false">Opted Out</option>
          </select>
        </div>

        {/* Created Before Exclusion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exclude Contacts Created Before
          </label>
          <input
            type="date"
            onChange={(e) => {
              const date = e.target.value;
              if (date) {
                addExclusionRule({ type: 'createdBefore', value: date });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Last Contacted Before Exclusion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exclude Not Contacted Since
          </label>
          <input
            type="date"
            onChange={(e) => {
              const date = e.target.value;
              if (date) {
                addExclusionRule({ type: 'lastContactedBefore', value: date });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Never Contacted Exclusion with Count */}
        <div>
          <button
            onClick={() => addExclusionRule({ type: 'neverContacted' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-between"
          >
            <span>Exclude Never Contacted</span>
            <span className="text-sm text-gray-500">
              ({contacts.filter(c => contactHistory[c.phoneNumber]?.contactCount === 0).length})
            </span>
          </button>
        </div>
      </div>

      {/* Active Exclusion Rules with Enhanced UI */}
      {exclusionRules.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Active Exclusion Rules ({exclusionRules.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {exclusionRules.map((rule, index) => (
              <div 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs group"
              >
                <span className="mr-1">
                  {rule.type === 'tag' && `Exclude Tag: ${rule.value}`}
                  {rule.type === 'list' && `Exclude List: ${rule.value}`}
                  {rule.type === 'optIn' && `Exclude Opt-in: ${rule.value ? 'Opted In' : 'Opted Out'}`}
                  {rule.type === 'createdBefore' && `Exclude Before: ${rule.value}`}
                  {rule.type === 'neverContacted' && 'Exclude Never Contacted'}
                  {rule.type === 'lastContactedBefore' && `Exclude Not Contacted Since: ${rule.value}`}
                </span>
                <button
                  onClick={() => removeExclusionRule(rule)}
                  className="ml-1 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove rule"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exclusion Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Exclusion Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Total Contacts:</span>
            <span className="ml-2 font-medium">{contacts.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Excluded Contacts:</span>
            <span className="ml-2 font-medium text-red-600">
              {contacts.length - filteredContacts.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Available Contacts:</span>
            <span className="ml-2 font-medium text-green-600">
              {filteredContacts.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Never Contacted:</span>
            <span className="ml-2 font-medium">
              {contacts.filter(c => contactHistory[c.phoneNumber]?.contactCount === 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Rest of the component remains the same as in the previous implementation
  // (Toggle contact selection, select all, clear all, etc.)

  return (
    <div className="space-y-4">
      {/* Existing search and filter components */}
      
      {/* New Exclusion Rules Section */}
      {renderExclusionRules()}

      {/* Existing recipient list and preview components */}
    </div>
  );
};

export default RecipientSelector;