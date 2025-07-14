// src/pages/SMS.tsx
import React, { useState, useEffect } from 'react';
import { useSMSOperations } from '../../hooks/useSMSOperations';
import { useSMS } from '../../contexts/SMSContext';
import ContactList from './ContactList';
import ContactDetail from './ContactDetail';
import MessagingInbox from './MessagingInbox';
import CampaignManagement from './CampaignManagement';
import TemplateLibrary from './TemplateLibrary';
import { toast } from 'react-hot-toast';
import { Conversation, Contact, MessageTemplate } from '../../types/sms';

const SMS: React.FC = () => {
  const { 
    conversations, 
    templates, 
    contacts, 
    selectedConversation,
    setSelectedConversation,
    selectedContacts,
    setSelectedContacts,
    sendMessage,
    markConversationAsRead,
    markMessageAsRead,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    isLoading,
    error
  } = useSMS();

  const [activeTab, setActiveTab] = useState('inbox');
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Handle conversation selection
  const handleConversationSelect = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  // Handle contact list selection
  const handleContactListSelect = (list: Contact[]) => {
    setSelectedContacts(list);
  };

  // Handle contact status change
  const handleContactStatusChange = (contact: Contact, status: string) => {
    // Update contact status logic here
    toast.success(`Contact ${contact.firstName} ${contact.lastName} status updated to ${status}`);
  };

  // Handle message sending
  const handleSendMessage = async (message: string, phoneNumber: string) => {
    try {
      await sendMessage(message, phoneNumber);
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  // Handle conversation archive toggle
  const handleArchiveToggle = async (conversationId: string, archived: boolean) => {
    try {
      if (archived) {
        await archiveConversation(conversationId);
        toast.success('Conversation archived');
      } else {
        await unarchiveConversation(conversationId);
        toast.success('Conversation unarchived');
      }
    } catch (error) {
      toast.error('Failed to update conversation status');
      console.error('Error updating conversation:', error);
    }
  };

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId, true);
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
      console.error('Error deleting conversation:', error);
    }
  };

  // Handle message read status
  const handleMessageRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Handle conversation read status
  const handleConversationRead = async (conversationId: string) => {
    try {
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`${
                activeTab === 'inbox'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`${
                activeTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`${
                activeTab === 'campaigns'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Templates
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'inbox' && (
            <MessagingInbox
              conversations={conversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              onArchiveToggle={handleArchiveToggle}
              onDelete={handleDeleteConversation}
              onMessageRead={handleMessageRead}
              onConversationRead={handleConversationRead}
              isLoading={isLoading}
              error={error}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactList
              contacts={contacts}
              selectedContacts={selectedContacts}
              onContactSelect={handleContactListSelect}
              onStatusChange={handleContactStatusChange}
            />
          )}
          {activeTab === 'campaigns' && (
            <CampaignManagement
              contacts={contacts}
              templates={templates}
              onSendMessage={handleSendMessage}
            />
          )}
          {activeTab === 'templates' && (
            <TemplateLibrary
              templates={templates}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-gray-200 overflow-y-auto">
        {selectedConversation && (
          <ContactDetail
            contact={{
              id: selectedConversation.id,
              firstName: selectedConversation.firstname,
              lastName: selectedConversation.lastname,
              phoneNumber: selectedConversation.phoneNumber,
              email: '',
              optIn: true,
              createdAt: selectedConversation.timestamp,
              updatedAt: selectedConversation.lastMessageAt,
              lists: [],
              tags: []
            }}
            messageHistory={selectedConversation.messages}
            onEdit={() => {}}
            onDelete={(contact) => handleDeleteConversation(contact.id)}
            onSendMessage={(phoneNumber) => handleSendMessage('', phoneNumber)}
            onToggleOptStatus={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default SMS;