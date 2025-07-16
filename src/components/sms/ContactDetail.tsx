import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Contact, Message } from '../../types/sms';

interface ContactDetailProps {
  contact: Contact;
  messageHistory?: Message[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onSendMessage: (phoneNumber: string) => void;
  onAddToList?: () => void;
  onRemoveFromList?: () => void;
  onToggleOptStatus: (contact: Contact, status: boolean) => void;
  isLoading?: boolean;
}

const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  messageHistory = [],
  onEdit,
  onDelete,
  onSendMessage,
  onAddToList,
  onRemoveFromList,
  onToggleOptStatus,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'events'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber: string) => {
    // Basic formatting: +1 (234) 567-8901
    const cleaned = phoneNumber.replace(/\D/g, '');
    let formatted = phoneNumber; // Default to original if can't format
    
    if (cleaned.length === 10) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    return formatted;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Group messages by date for display
  const groupedMessages = messageHistory.reduce((groups, message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  // Handle delete confirmation
  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(contact);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-y-auto h-full">
      {/* Contact Header */}
      <div className="bg-primary text-white p-4 sm:p-6 overflow-y-auto rounded-t-lg">
        <div className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold">{`${contact.firstName} ${contact.lastName}`}</h2>
            <p className="mt-1">{formatPhoneNumber(contact.phoneNumber)}</p>
            {contact.email && <p className="mt-1">{contact.email}</p>}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onSendMessage(contact.phoneNumber)}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Message
            </button>
            <button
              onClick={() => onEdit(contact)}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-light hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>
        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {contact.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-primary-light rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Message History
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6 h-5/6 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="mt-1">{`${contact.firstName} ${contact.lastName}`}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="mt-1">{formatPhoneNumber(contact.phoneNumber)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1">{contact.email || 'Not provided'}</p>
                      </div>
                      {contact.birthdate && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Birthdate</p>
                          <p className="mt-1">{formatDate(contact.birthdate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Status</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Opt-In Status</p>
                        <div className="mt-1 flex items-center">
                          {contact.optIn ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Opted In
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Opted Out
                            </span>
                          )}
                          <button
                            onClick={() => onToggleOptStatus(contact, !contact.optIn)}
                            className="ml-2 text-sm text-primary hover:text-primary-dark"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="mt-1">{contact.createdAt ? formatDate(contact.createdAt) : 'Unknown'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="mt-1">{contact.updatedAt ? formatDate(contact.updatedAt) : 'Unknown'}</p>
                      </div>
                      
                      {contact.lists && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact Lists</p>
                          <div className="mt-1">
                            {contact.lists.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {contact.lists.map((list) => (
                                  <span key={list} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {list}
                                    {onRemoveFromList && (
                                      <button
                                        onClick={() => onRemoveFromList()}
                                        className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                                      >
                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Not in any lists</p>
                            )}
                            {onAddToList && (
                              <button
                                onClick={onAddToList}
                                className="mt-2 text-sm text-primary hover:text-primary-dark flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add to list
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {contact.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Contact
                  </button>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className='w-full h-full'>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Message History</h3>
                {messageHistory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md w-full flex items-center flex-col">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">No message history with this contact yet.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => onSendMessage(contact.phoneNumber)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Start Conversation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md overflow-hidden max-h-96 overflow-y-auto">
                    {Object.keys(groupedMessages).map(date => (
                      <div key={date}>
                        <div className="sticky top-0 bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
                          {format(new Date(date), 'MMMM d, yyyy')}
                        </div>
                        <div className="divide-y divide-gray-200">
                          {groupedMessages[date].map((message: Message) => (
                            <div key={message.id} className="px-4 py-3">
                              <div className="flex justify-between">
                                <div className={`flex items-center text-xs ${
                                  message.direction === 'outbound' ? 'text-primary' : 'text-gray-500'
                                }`}>
                                  {message.direction === 'outbound' ? 'Sent' : 'Received'} at{' '}
                                  {format(new Date(message.timestamp), 'h:mm a')}
                                </div>
                                {message.status && (
                                  <span className={`text-xs ${
                                    message.status === 'sent' ? 'text-green-500' :
                                    message.status === 'delivered' ? 'text-blue-500' :
                                    message.status === 'read' ? 'text-purple-500' :
                                    'text-red-500'
                                  }`}>
                                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-900">{message.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Events</h3>
                <div className="text-center py-12 bg-gray-50 rounded-md w-full flex items-center flex-col">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
                  <p className="mt-1 text-sm text-gray-500">This contact has no events yet.</p>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Events will be shown here when this contact interacts with messages, <br/>
                      joins or leaves contact lists, or updates their information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Contact</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this contact? All their data will be permanently removed.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetail;