import React, { useState, useEffect } from 'react';
import { BulkMessageCampaign, CampaignRecipient, Contact, MessageTemplate } from '../../types/sms';
import CampaignHistory from './CampaignHistory';
import CampaignDetail from './CampaignDetail';
import BulkMessaging from './BulkMessaging';
import { toast } from 'react-hot-toast';
import { getAllCampaigns } from '../../apis/sms/apis';

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
        const allCampaigns = await getAllCampaigns();
        setCampaigns(allCampaigns);
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
  const handleSendBulkMessage = async (message: string, recipients: CampaignRecipient[], scheduleSettings?: any) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a new campaign entry
      const newCampaign: BulkMessageCampaign = {
        id: `camp_${Date.now()}`,
        name: `Campaign ${new Date().toLocaleDateString()}`,
        message,
        recipients: [],
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
      for (const recipient of recipients) {
        await onSendMessage(message, recipient.phoneNumber);
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