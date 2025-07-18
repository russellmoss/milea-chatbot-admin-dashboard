import React from 'react';
import { format } from 'date-fns';
import { BulkMessageCampaign, CampaignRecipient } from '../../types/sms';

interface CampaignDetailProps {
  campaign: BulkMessageCampaign;
  onClose: () => void;
  onClone?: (campaign: BulkMessageCampaign) => void;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onClose,
  onClone
}) => {
  // Format date
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'PP p'); // Format: Aug 23, 2023, 2:30 PM
  };

  // Get recipient count by type
  const getRecipientDetails = (recipients: CampaignRecipient[]): { count: number, detail: string } => {
    const total = recipients.length;
    const phoneNumbers = recipients.map(r => r.phoneNumber).join(', ');
    return {
      count: total,
      detail: `Total: ${total}, Numbers: ${phoneNumbers}`
    };
  };

  // Get status badge classes
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recipientDetails = getRecipientDetails(campaign.recipients);

  return (
    <div className="bg-white rounded-lg shadow-md max-h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Campaign Details</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Campaign Basic Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
            <p className="text-sm text-gray-500">
              Created: {formatDate(campaign.createdAt)}
            </p>
            {campaign.updatedAt !== campaign.createdAt && (
              <p className="text-sm text-gray-500">
                Last updated: {formatDate(campaign.updatedAt)}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${getStatusBadgeClasses(campaign.status)}`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Message Content */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Message Content</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{campaign.message}</p>
        </div>
      </div>

      {/* Recipients */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Recipients</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-900">
            {recipientDetails.count} total recipients ({recipientDetails.detail})
          </p>
        </div>
      </div>

      {/* Scheduling Info (if applicable) */}
      {campaign.scheduledTime && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Schedule Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-900">
              Scheduled for: {formatDate(campaign.scheduledTime)}
            </p>
          </div>
        </div>
      )}

      {/* Campaign Stats (if available) */}
      {campaign.stats && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Recipients</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {campaign.stats.total}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Sent</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {campaign.stats.sent}
                {campaign.stats.total > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({Math.round((campaign.stats.sent / campaign.stats.total) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-xl font-semibold text-green-600 mt-1">
                {campaign.stats.delivered}
                {campaign.stats.sent > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({Math.round((campaign.stats.delivered / campaign.stats.sent) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-xl font-semibold text-red-600 mt-1">
                {campaign.stats.failed}
                {campaign.stats.sent > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({Math.round((campaign.stats.failed / campaign.stats.sent) * 100)}%)
                  </span>
                )}
              </p>
            </div>
            
            {campaign.stats.responses !== undefined && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Responses</p>
                <p className="text-xl font-semibold text-blue-600 mt-1">
                  {campaign.stats.responses}
                  {campaign.stats.delivered > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      ({Math.round((campaign.stats.responses / campaign.stats.delivered) * 100)}%)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          Close
        </button>
        
        {onClone && (
          <button
            onClick={() => onClone(campaign)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-primary hover:bg-darkBrown"
          >
            Clone Campaign
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;