import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSMSOperations } from '../../hooks/useSMSOperations';
import { Contact, BulkMessageCampaign, MessageTemplate, CampaignRecipient } from '../../types/sms';
import { ScheduleSettings } from './SchedulingControls';
import BulkMessageComposer from './BulkMessageComposer';
import RecipientSelector from './RecipientSelector';
import TemplateSelector from './TemplateSelector';
import { createCampaign } from '../../apis/sms/apis';
import { set } from 'date-fns';

// Constants for pagination and performance monitoring
const ITEMS_PER_PAGE = 50;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface BulkMessagingProps {
  onClose: () => void;
  contacts: Contact[];
  onSendBulkMessage: (message: string, recipients: CampaignRecipient[], scheduleSettings?: ScheduleSettings) => Promise<boolean>;
}

const BulkMessaging: React.FC<BulkMessagingProps> = ({ onClose, contacts, onSendBulkMessage }) => {
  const { 
    lists,
    createList,
    addContactToList,
    removeContactFromList,
    isLoading,
    error
  } = useSMSOperations();

  const [selectedList, setSelectedList] = useState<string>('');
  const [message, setMessage] = useState('');
  const [availableContacts, setAvailableContacts] = useState<Contact[]>(contacts);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<BulkMessageCampaign[]>([]);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const campaignTimeoutRef = useRef<NodeJS.Timeout>();
  const [campaign, setCampaign] = useState<BulkMessageCampaign>({
    id: Date.now().toString(),
    name: '',
    message: '',
    recipients: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [metrics, setMetrics] = useState({
    filterTime: 0,
    renderTime: 0,
    lastUpdate: null as Date | null,
    cacheHits: 0,
    cacheMisses: 0
  });
  const [cache, setCache] = useState<Map<string, Contact>>(new Map());
  const performanceRef = useRef<{ startTime: number }>({ startTime: 0 });
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Filter contacts based on selected list
  useEffect(() => {
    if (selectedList) {
      const filteredContacts = contacts.filter(contact => 
        contact.lists?.includes(selectedList)
      );
      setAvailableContacts(filteredContacts);
    } else {
      setAvailableContacts(contacts);
    }
  }, [selectedList, contacts]);

  // Validate campaign data
  const validateCampaign = useCallback((body?: any) => {
    const newErrors: { field: string; message: string }[] = [];

    if (!(body || campaign).name.trim()) {
      newErrors.push({ field: 'name', message: 'Campaign name is required' });
    }

    if (!(body || campaign).message.trim()) {
      newErrors.push({ field: 'message', message: 'Message content is required' });
    }

    if ((body || campaign).message.length > 1600) {
      newErrors.push({ field: 'message', message: 'Message exceeds 1600 characters' });
    }

    if (!(body || campaign).recipients.length) {
      newErrors.push({ field: 'recipients', message: 'At least one recipient is required' });
    }
    console.debug('Campaign validation:', body || campaign);
    console.debug('Campaign validation errors:', newErrors);

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [campaign]);

  // Enhanced campaign tracking
  const updateCampaignStatus = useCallback((status: BulkMessageCampaign['status'], stats?: BulkMessageCampaign['stats']) => {
    setCampaign((prev: BulkMessageCampaign) => ({
      ...prev,
      status,
      stats: stats || prev.stats,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Cache cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      setCache(new Map());
      setMetrics(prev => ({
        ...prev,
        cacheHits: 0,
        cacheMisses: 0
      }));
    }, CACHE_EXPIRY);

    return () => clearInterval(cleanup);
  }, []);

  // Enhanced error recovery
  const handleSubmit = useCallback(async () => {
    console.debug('Starting campaign submission 1:', campaign);
    const body = {
      name: campaign.name,
      recipients: contacts.map(contact => ({
        contactId: contact.id,
        listId: contact.lists?.[0] || '',
        phoneNumber: contact.phoneNumber
      })),
      message: message,
      status: 'completed',
      stats: {
          total: 0,
          sent: 0,
          delivered: 0,
          failed: 0,
          responses: 0
      }
    };
    if (!validateCampaign(body)) return;

    setIsSubmitting(true);
    setErrors([]);
    console.debug('Starting campaign submission 2:', campaign);

    try {
      performanceRef.current.startTime = performance.now();

      console.debug('Starting campaign submission3 :', campaign);
      const newCampaign = await createCampaign(campaign);
      setCampaigns(prev => [newCampaign, ...prev]);

      // Clear timeout on unmount
      if (campaignTimeoutRef.current) {
        clearTimeout(campaignTimeoutRef.current);
      }

      // Close modal after 3 seconds
      campaignTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      setErrors([{ field: 'general', message: 'Failed to start campaign. Please try again.' }]);
      updateCampaignStatus('failed');
    } finally {
      setIsSubmitting(false);
      const endTime = performance.now();
      setMetrics(prev => ({
        ...prev,
        submitTime: endTime - performanceRef.current.startTime
      }));
    }
  }, [validateCampaign, campaign, onClose, updateCampaignStatus]);

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     if (campaignTimeoutRef.current) {
  //       clearTimeout(campaignTimeoutRef.current);
  //     }
  //   };
  // }, []);

  // Send bulk message
  const handleSendBulkMessage = async (message: string, contacts: Contact[], scheduleSettings?: ScheduleSettings) => {
    if (!message.trim() || contacts.length === 0) {
      setErrors([{ field: 'message', message: 'Message and recipients are required' }]);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const recipients: CampaignRecipient[] = contacts.map(contact => ({
        contactId: contact.id,
        listId: contact.lists?.[0] || '',
        phoneNumber: contact.phoneNumber
      }));
      const success = await onSendBulkMessage(message, recipients, scheduleSettings);
      if (success) {
        // Update campaign status
        setCampaign(prev => ({
          ...prev,
          message,
          recipients: {
            ...prev.recipients,
            phoneNumbers: recipients
          },
          status: 'scheduled',
          updatedAt: new Date().toISOString()
        }));

        // Add to campaigns list
        setCampaigns(prev => [...prev, campaign]);

        // Clear form
        setMessage('');
        setSelectedContacts([]);
        setSelectedList('');
      } else {
        setErrors([{ field: 'message', message: 'Failed to send bulk message' }]);
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
      setErrors([{ field: 'message', message: 'An error occurred while sending the message' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add handleApplyTemplate function
  const handleApplyTemplate = useCallback((template: MessageTemplate): string => {
    setCampaign(prev => ({
      ...prev,
      message: template.content
    }));
    setShowTemplates(false);
    return template.content;
  }, []);

  return (
    <div className="flex flex-col h-[90vh] max-h-[800px] bg-white rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Send Bulk Message</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaign.name}
              onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter campaign name"
            />
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <RecipientSelector
              contacts={availableContacts}
              selectedContacts={selectedContacts}
              lists={lists.map(list => list.id)}
              onRecipientsSelected={setSelectedContacts}
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <BulkMessageComposer
              availableRecipients={availableContacts}
              selectedContacts={selectedContacts}
              setSelectedContacts={setSelectedContacts}
              message={message}
              setMessage={setMessage}
            />
          </div>

          {/* Campaign Status */}
          {campaign.status !== 'draft' && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Campaign Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    campaign.status === 'completed' ? 'text-green-600' :
                    campaign.status === 'failed' ? 'text-red-600' :
                    campaign.status === 'sending' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
                {campaign.stats && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Recipients:</span>
                      <span className="font-medium">{campaign.stats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium">{campaign.stats.sent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="font-medium text-green-600">{campaign.stats.delivered}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Failed:</span>
                      <span className="font-medium text-red-600">{campaign.stats.failed}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Filter Time:</span>
                <span className="ml-2 text-sm font-medium">{metrics.filterTime.toFixed(2)}ms</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Render Time:</span>
                <span className="ml-2 text-sm font-medium">{metrics.renderTime.toFixed(2)}ms</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Cache Hits:</span>
                <span className="ml-2 text-sm font-medium">{metrics.cacheHits}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Cache Misses:</span>
                <span className="ml-2 text-sm font-medium">{metrics.cacheMisses}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Update:</span>
                <span className="ml-2 text-sm font-medium">
                  {metrics.lastUpdate?.toLocaleTimeString() || 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send Messages1'}
        </button>
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-500"
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

export default BulkMessaging;