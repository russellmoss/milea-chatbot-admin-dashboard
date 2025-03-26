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
            lastMessage: 'I'm interested in booking a tasting for this Saturday',
            lastMessageTime: '2023-05-15T14:30:00',
            unread: true,
            messages: [
              {
                id: 'msg1',
                direction: 'inbound',
                content: 'Hello! I'm interested in booking a tasting for this Saturday',
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
            lastMessage: 'Thank you! I'll bring my receipt when I come to pick up my wine club shipment.',
            lastMessageTime: '2023-05-14T11:20:00',
            unread: false,
            messages: [
              {
                id: 'msg3',
                direction: 'outbound',
                content: 'Hello Sarah, your wine club shipment for May is ready for pickup at the tasting room. We're open daily from 10 AM to 5 PM.',
                timestamp: '2023-05-14T11:15:00',
                status: 'read'
              },
              {
                id: 'msg4',
                direction: 'inbound',
                content: 'Thank you! I'll bring my receipt when I come to pick up my wine club shipment.',
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
            content: 'Hello {name}, your wine club shipment for {month} is ready for pickup at the tasting room. We're open daily from 10 AM to 5 PM.',
            category: 'Wine Club'
          },
          {
            id: 'template3',
            name: 'Event Reminder',
            content: 'Reminder: You're registered for our {event} on {date} at {time}. We look forward to seeing you!',
            category: 'Events'
          },
          {
            id: 'template4',
            name: 'Thank You',
            content: 'Thank you for visiting Milea Estate Vineyard today! We hope you enjoyed your experience. Don't forget to follow us on social media and sign up for our newsletter for updates on events and new releases.',
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
        conv.id === conversationId 
          ? { ...conv, unread: false } 
          : conv
      )
    );

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => 
        prev ? { ...prev, unread: false } : null
      );
    }
  };

  // Select a conversation and mark it as read
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unread) {
      handleMarkAsRead(conversation.id);
    }
  };

  // Handle applying a template
  const handleApplyTemplate = (template: MessageTemplate) => {
    // In a real implementation, you would replace placeholders with actual values
    setShowTemplates(false);
    return template.content;
  };

  // Export conversation to CSV
  const handleExportConversation = () => {
    if (!selectedConversation) return;
    
    // Format messages for CSV
    const csvContent = [
      ['Direction', 'Content', 'Timestamp', 'Status'].join(','),
      ...selectedConversation.messages.map(msg => [
        msg.direction,
        `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes in content
        format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        msg.status || ''
      ].join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up and trigger download
    link.href = url;
    link.setAttribute('download', `conversation_${selectedConversation.phoneNumber}_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create a new conversation
  const handleNewConversation = () => {
    // In a real implementation, this would open a modal to enter phone number and message
    const phoneNumber = prompt('Enter phone number (format: +12345678901):');
    if (!phoneNumber) return;
    
    const initialMessage = prompt('Enter your message:');
    if (!initialMessage) return;
    
    handleSendMessage(initialMessage, phoneNumber);
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px] flex border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Left sidebar - Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Messages</h2>
            <button 
              onClick={handleNewConversation}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-darkBrown"
            >
              New Message
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilterStatus('read')}
              className={`px-3 py-1 text-sm rounded-md ${
                filterStatus === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-red-500">{error}</div>
            </div>
          ) : sortedConversations.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No conversations found
            </div>
          ) : (
            <ul>
              {sortedConversations.map((conversation) => (
                <li 
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
                  } ${
                    conversation.unread ? 'font-semibold' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {conversation.customerName || conversation.phoneNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(conversation.lastMessageTime), 'MM/dd/yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread && (
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full ml-1"></span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Right side - Message Display and Composer */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedConversation.customerName || selectedConversation.phoneNumber}
                </h3>
                {selectedConversation.customerName && (
                  <p className="text-sm text-gray-500">{selectedConversation.phoneNumber}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleExportConversation}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  title="Export conversation"
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                
                <button 
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  title="Message actions"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Message display */}
            <MessageDisplay 
              messages={selectedConversation.messages} 
              customerName={selectedConversation.customerName}
              phoneNumber={selectedConversation.phoneNumber}
            />
            
            {/* Message composer */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2 mb-2">
                <button 
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Templates
                </button>
              </div>
              
              {showTemplates && (
                <TemplateSelector 
                  templates={templates} 
                  onSelectTemplate={handleApplyTemplate}
                />
              )}
              
              <MessageComposer onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-center items-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingInbox;