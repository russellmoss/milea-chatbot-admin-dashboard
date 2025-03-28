import React, { useState, useEffect } from 'react';
import { BulkMessageCampaign, Contact, MessageTemplate } from '../../types/sms';
import CampaignHistory from './CampaignHistory';
import CampaignDetail from './CampaignDetail';
import BulkMessaging from './BulkMessaging';
import { toast } from 'react-hot-toast';

interface CampaignManagementProps {
  contacts: Contact[];
  templates: MessageTemplate[];
  onSendMessage: (message: string, phoneNumber: string) => Promise<void>;
}

const CampaignManagement: React.FC<CampaignManagementProps> = ({ 
  contacts,
  templates,
  onSendMessage
}) => {
  // State for campaigns and UI controls
  const [campaigns, setCampaigns] = useState<BulkMessageCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<BulkMessageCampaign | null>(null);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  // Fetch campaigns (mock data for now)
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock campaign data
        const mockCampaigns: BulkMessageCampaign[] = [
          {
            id: 'camp1',
            name: 'Spring Wine Release',
            message: 'Our Spring Wine Release is now available for Club Members! Reply SPRING to pre-order your allocation before general release.',
            recipients: {
              contactIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
              listIds: ['wine-club']
            },
            status: 'completed',
            stats: {
              total: 150,
              sent: 150,
              delivered: 143,
              failed: 7,
              responses: 68
            },
            createdAt: '2023-04-10T15:30:00Z',
            updatedAt: '2023-04-10T15:35:00Z'
          },
          {
            id: 'camp2',
            name: 'Summer Concert Series',
            message: 'Join us for our Summer Concert Series, starting June 15th! Club Members get priority seating. Reply CONCERT for details and to reserve your spot.',
            recipients: {
              contactIds: ['1', '2', '3', '4', '5'],
              listIds: ['wine-club', 'newsletter']
            },
            status: 'scheduled',
            scheduledTime: '2023-05-25T09:00:00Z',
            createdAt: '2023-05-05T14:20:00Z',
            updatedAt: '2023-05-05T14:25:00Z'
          },
          {
            id: 'camp3',
            name: 'Memorial Day Weekend Tasting',
            message: 'Extended hours for Memorial Day Weekend! Join us for special tastings and live music. Club members receive complimentary cheese boards. No reservation needed.',
            recipients: {
              contactIds: [],
              listIds: ['wine-club', 'newsletter', 'local-customers']
            },
            status: 'draft',
            createdAt: '2023-05-15T11:00:00Z',
            updatedAt: '2023-05-15T11:05:00Z'
          },
          {
            id: 'camp4',
            name: 'April Allocation Reminder',
            message: 'Your April wine club allocation is ready! Please pick up by April 30th or contact us to arrange shipping. Reply SHIP to have your allocation shipped to your address on file.',
            recipients: {
              contactIds: [],
              phoneNumbers: ['+15551234567', '+15559876543', '+15557890123']
            },
            status: 'sending',
            stats: {
              total: 85,
              sent: 52,
              delivered: 49,
              failed: 3,
              responses: 12
            },
            createdAt: '2023-04-20T08:45:00Z',
            updatedAt: '2023-04-20T08:50:00Z'
          }
        ];
        
        setCampaigns(mockCampaigns);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to fetch campaigns');
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Handle viewing a campaign
  const handleViewCampaign = (campaign: BulkMessageCampaign) => {
    setSelectedCampaign(campaign);
  };

  // Handle closing campaign detail
  const handleCloseDetail = () => {
    setSelectedCampaign(null);
  };

  // Handle cloning a campaign
  const handleCloneCampaign = async (campaign: BulkMessageCampaign) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const clonedCampaign: BulkMessageCampaign = {
        ...campaign,
        id: `camp_${Date.now()}`,
        name: `${campaign.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCampaigns(prev => [clonedCampaign, ...prev]);
      toast.success('Campaign cloned successfully');
    } catch (error) {
      console.error('Error cloning campaign:', error);
      toast.error('Failed to clone campaign');
    }
  };

  // Handle sending a bulk message
  const handleSendBulkMessage = async (message: string, recipients: string[], scheduleSettings?: any) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new campaign entry
      const newCampaign: BulkMessageCampaign = {
        id: `camp_${Date.now()}`,
        name: `Campaign ${new Date().toLocaleDateString()}`,
        message,
        recipients: {
          phoneNumbers: recipients
        },
        status: scheduleSettings?.type === 'immediate' ? 'sending' : 'scheduled',
        scheduledTime: scheduleSettings?.scheduledDate && scheduleSettings?.scheduledTime
          ? `${scheduleSettings.scheduledDate}T${scheduleSettings.scheduledTime}`
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to campaigns list
      setCampaigns(prev => [newCampaign, ...prev]);
      
      // Send messages to each recipient
      for (const phoneNumber of recipients) {
        await onSendMessage(message, phoneNumber);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending bulk message:', error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Campaign Management</h2>
        <button
          onClick={() => setShowNewCampaignModal(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-darkBrown"
        >
          Create New Campaign
        </button>
      </div>
      
      {/* Campaign History */}
      <CampaignHistory
        campaigns={campaigns}
        onViewCampaign={handleViewCampaign}
        isLoading={isLoading}
        error={error}
      />
      
      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CampaignDetail
              campaign={selectedCampaign}
              onClose={handleCloseDetail}
              onClone={handleCloneCampaign}
            />
          </div>
        </div>
      )}
      
      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <BulkMessaging
              contacts={contacts}
              onClose={() => setShowNewCampaignModal(false)}
              onSendBulkMessage={handleSendBulkMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;