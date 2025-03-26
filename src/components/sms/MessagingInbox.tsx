import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MessageDisplay from './MessageDisplay';
import MessageComposer from './MessageComposer';
import TemplateSelector from './TemplateSelector';

// Types
export interface Conversation {
  id: string;
  phoneNumber: string;
  customerName: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: Message[];
}

export interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrls?: string[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}

interface MessagingInboxProps {
  twilioApiKey?: string;
  twilioAccountSid?: string;
}

const MessagingInbox: React.FC<MessagingInboxProps> = ({ twilioApiKey, twilioAccountSid }) => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would be fetched from your API that interfaces with Twilio
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockConversations: Conversation[] = [
          {
            id: 'conv1',
            phoneNumber: '+15551234567',
            customerName: 'John Smith',
            lastMessage: "I'm interested in booking a tasting for this Saturday",
            lastMessageTime: '2023-05-15T14:30:00',
            unread: true,
            messages: [
              {
                id: 'msg1',
                direction: 'inbound',
                content: "Hello! I'm interested in booking a tasting for this Saturday",
                timestamp: '2023-05-15T14:30:00'
              },
              {
                id: 'msg2',
                direction: 'outbound',
                content: 'Hi John! Thank you for your interest. We have openings at 11 AM, 1 PM, and 3 PM this Saturday. Would any of those times work for you?',
                timestamp: '2023-05-15T14:35:00',
                status: 'delivered'
              }
            ]
          },
          {
            id: 'conv2',
            phoneNumber: '+15559876543',
            customerName: 'Sarah Johnson',
            lastMessage: "Thank you! I'll bring my receipt when I come to pick up my wine club shipment.",
            lastMessageTime: '2023-05-14T11:20:00',
            unread: false,
            messages: [
              {
                id: 'msg3',
                direction: 'outbound',
                content: "Hello Sarah, your wine club shipment for May is ready for pickup at the tasting room. We're open daily from 10 AM to 5 PM.",
                timestamp: '2023-05-14T11:15:00',
                status: 'read'
              },
              {
                id: 'msg4',
                direction: 'inbound',
                content: "Thank you! I'll bring my receipt when I come to pick up my wine club shipment.",
                timestamp: '2023-05-14T11:20:00'
              }
            ]
          },
          {
            id: 'conv3',
            phoneNumber: '+15552223333',
            customerName: null,
            lastMessage: 'Do you have any Chardonnay available?',
            lastMessageTime: '2023-05-13T16:05:00',
            unread: true,
            messages: [
              {
                id: 'msg5',
                direction: 'inbound',
                content: 'Do you have any Chardonnay available?',
                timestamp: '2023-05-13T16:05:00'
              }
            ]
          }
        ];

        // Mock message templates
        const mockTemplates: MessageTemplate[] = [
          {
            id: 'template1',
            name: 'Tasting Confirmation',
            content: 'Your tasting reservation for {date} at {time} is confirmed. We look forward to welcoming you to Milea Estate Vineyard!',
            category: 'Reservations'
          },
          {
            id: 'template2',
            name: 'Wine Club Pickup',
            content: 'Hello {name}, your wine club shipment for {month} is ready for pickup at the tasting room. We\'re open daily from 10 AM to 5 PM.',
            category: 'Wine Club'
          },
          {
            id: 'template3',
            name: 'Event Reminder',
            content: 'Reminder: You\'re registered for our {event} on {date} at {time}. We look forward to seeing you!',
            category: 'Events'
          },
          {
            id: 'template4',
            name: 'Thank You',
            content: 'Thank you for visiting Milea Estate Vineyard today! We hope you enjoyed your experience. Don\'t forget to follow us on social media and sign up for our newsletter for updates on events and new releases.',
            category: 'General'
          }
        ];

        setConversations(mockConversations);
        setTemplates(mockTemplates);
        setSelectedConversation(mockConversations[0]);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load conversations. Please try again later.');
        setIsLoading(false);
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
  }, []);

  // Filter conversations based on search query and filter status
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.phoneNumber.includes(searchQuery) || 
      (conversation.customerName && conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'unread' && conversation.unread) ||
      (filterStatus === 'read' && !conversation.unread);
    
    return matchesSearch && matchesFilter;
  });

  // Sort conversations by last message time (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  // Handle sending a new message
  const handleSendMessage = async (content: string, to?: string) => {
    if (!content.trim()) return;
    
    // In a real implementation, this would send the message via your API to Twilio
    try {
      const recipientPhone = to || selectedConversation?.phoneNumber;
      if (!recipientPhone) {
        throw new Error('No recipient selected');
      }

      // Mock sending message
      console.log(`Sending message to ${recipientPhone}: ${content}`);
      
      // Create a new message
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        direction: 'outbound',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Update conversations with the new message
      if (selectedConversation) {
        // Update existing conversation
        const updatedConversation = {
          ...selectedConversation,
          lastMessage: content,
          lastMessageTime: newMessage.timestamp,
          messages: [...selectedConversation.messages, newMessage]
        };

        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === updatedConversation.id ? updatedConversation : conv
          )
        );
        setSelectedConversation(updatedConversation);
      } else if (to) {
        // Create a new conversation if sending to a new number
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          phoneNumber: to,
          customerName: null,
          lastMessage: content,
          lastMessageTime: newMessage.timestamp,
          unread: false,
          messages: [newMessage]
        };

        setConversations(prevConversations => [...prevConversations, newConversation]);
        setSelectedConversation(newConversation);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Show error to user
    }
  };

  // Handle marking a conversation as read
  const handleMarkAsRead = (conversationId: string) => {
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === conversationId ? { ...conv, unread: false } : conv
      )
    );
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { ...prev, unread: false } : null);
    }
  };

  // Handle selecting a conversation
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    handleMarkAsRead(conversation.id);
  };

  // Handle applying a message template
  const handleApplyTemplate = (template: MessageTemplate): string => {
    if (selectedConversation) {
      // Replace template variables with actual values
      let content = template.content;
      // Add logic to replace variables based on context
      handleSendMessage(content);
      return content;
    }
    return '';
  };

  // Handle exporting conversation
  const handleExportConversation = () => {
    if (!selectedConversation) return;
    
    const exportData = {
      conversation: selectedConversation,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${selectedConversation.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle starting a new conversation
  const handleNewConversation = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'unread' | 'read')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            sortedConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {conversation.customerName || conversation.phoneNumber}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {format(new Date(conversation.lastMessageTime), 'MMM d, h:mm a')}
                    </p>
                    {conversation.unread && (
                      <span className="inline-block w-2 h-2 bg-primary rounded-full mt-1"></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Display */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedConversation.customerName || selectedConversation.phoneNumber}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedConversation.phoneNumber}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Templates
                  </button>
                  <button
                    onClick={handleExportConversation}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>

            <MessageDisplay
              messages={selectedConversation.messages}
              customerName={selectedConversation.customerName}
              phoneNumber={selectedConversation.phoneNumber}
              onMarkAsRead={() => handleMarkAsRead(selectedConversation.id)}
            />

            <MessageComposer
              onSendMessage={handleSendMessage}
              to={selectedConversation.phoneNumber}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or start a new one
          </div>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TemplateSelector
              templates={templates}
              onSelectTemplate={handleApplyTemplate}
              onClose={() => setShowTemplates(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInbox;