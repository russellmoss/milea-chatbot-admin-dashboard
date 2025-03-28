import React, { useState } from 'react';
import BusinessMetricsDashboard from '../components/analytics/BusinessMetricsDashboard';
import DataCaptureAnalytics from '../components/analytics/DataCaptureAnalytics';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<'business' | 'data-capture' | 'wine-club' | 'reservations'>('business');

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Analytics Center</h2>
        <p className="text-gray-600 mb-6">
          Monitor key performance indicators across all aspects of your winery business.
        </p>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('business')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'business'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Business Metrics
            </button>
            
            <button
              onClick={() => setActiveTab('data-capture')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'data-capture'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Capture
            </button>
            
            <button
              onClick={() => setActiveTab('wine-club')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wine-club'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wine Club
            </button>
            
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reservations
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'business' && <BusinessMetricsDashboard />}
          {activeTab === 'data-capture' && <DataCaptureAnalytics />}
          {activeTab === 'wine-club' && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Wine Club Conversion Analytics</h3>
              <p className="mt-1 text-sm text-gray-500">
                This section will be implemented in Phase 7, Step 3.
              </p>
            </div>
          )}
          {activeTab === 'reservations' && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Reservations Analytics</h3>
              <p className="mt-1 text-sm text-gray-500">
                This section will be implemented in Phase 7, Step 4.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}