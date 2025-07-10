// src/components/SMSTest.tsx
import React, { useEffect } from 'react';
import { useSMS } from '../../contexts/SMSContext';
import { useSocket } from '../../contexts/SocketContext';
import { useMessage } from '../../contexts/MessageContext';
import { toast } from 'react-hot-toast';
import { Conversation } from '../../types/sms';

/**
 * Simple component to test if SMS functionality is working
 */
const SMSTest: React.FC = () => {
  const { 
    conversations, 
    selectedConversation, 
    setSelectedConversation,
    sendMessage, 
    fetchMessages,
    isLoading
  } = useSMS();
  
  const { socket, isConnected } = useSocket();
  const { draftMessages } = useMessage();
  
  useEffect(() => {
    console.log('SMSTest: Component mounted');
    
    if (conversations.length === 0) {
      console.log('SMSTest: No conversations, fetching...');
      fetchMessages();
    }
    
    // Log the state to help debugging
    console.log('SMSTest: Initial state', {
      conversationsCount: conversations.length,
      selectedConversation: selectedConversation ? {
        id: selectedConversation.id, 
        phoneNumber: selectedConversation.phoneNumber
      } : null,
      isConnected,
      socket: !!socket,
      draftMessagesCount: Object.keys(draftMessages).length
    });
    
    return () => {
      console.log('SMSTest: Component unmounting');
    };
  }, [conversations.length, fetchMessages, selectedConversation, isConnected, socket, draftMessages]);
  
  const handleTestMessage = async () => {
    if (!conversations.length) {
      toast.error('No conversations available');
      return;
    }
    
    try {
      // Select the first conversation if none is selected
      const targetConversation = selectedConversation || conversations[0];
      setSelectedConversation(targetConversation);
      
      // Send a test message
      await sendMessage(
        'This is a test message sent at ' + new Date().toLocaleTimeString(),
        targetConversation.phoneNumber,
        targetConversation.id
      );
      
      toast.success('Test message sent successfully');
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('Failed to send test message');
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">SMS System Test</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">Connection Status</h3>
            <p className={`text-sm mt-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">Conversations</h3>
            <p className="text-sm mt-1 text-gray-600">{conversations.length} loaded</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">Selected Conversation</h3>
            <p className="text-sm mt-1 text-gray-600">
              {selectedConversation 
                ? `${selectedConversation.firstname + ' ' + selectedConversation.lastname || selectedConversation.phoneNumber}`
                : 'None selected'
              }
            </p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">Draft Messages</h3>
            <p className="text-sm mt-1 text-gray-600">
              {Object.keys(draftMessages).length} saved drafts
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Loading...' : 'Refresh Conversations'}
          </button>
          
          <button
            onClick={handleTestMessage}
            disabled={isLoading || !isConnected}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              isLoading || !isConnected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Send Test Message
          </button>
        </div>
        
        {/* Display first few conversations */}
        {conversations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Conversations</h3>
            <div className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-48 overflow-y-auto">
              {conversations.slice(0, 3).map((conversation: Conversation) => (
                <div 
                  key={conversation.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">
                      {conversation.firstname + ' ' + conversation.lastname || conversation.phoneNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.lastMessageAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.messages[conversation.messages.length - 1]?.content || 'No messages'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSTest;