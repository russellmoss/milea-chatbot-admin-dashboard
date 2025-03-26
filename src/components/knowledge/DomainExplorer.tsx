import React, { useState } from 'react';
import FileBrowser from './FileBrowser';

// Define types
interface KnowledgeDomain {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  lastUpdated: string;
  icon: string;
}

const DomainExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain | null>(null);
  
  // Sample knowledge domains data
  const knowledgeDomains: KnowledgeDomain[] = [
    {
      id: 'wines',
      name: 'Wines',
      description: 'Information about our wine products, varieties, and tasting notes',
      fileCount: 28,
      lastUpdated: '2023-05-12T10:30:00',
      icon: '🍷'
    },
    {
      id: 'events',
      name: 'Events',
      description: 'Information about vineyard events, tastings, and special occasions',
      fileCount: 12,
      lastUpdated: '2023-05-08T14:45:00',
      icon: '🎉'
    },
    {
      id: 'visiting',
      name: 'Visiting',
      description: 'Information about visiting hours, reservations, and accommodations',
      fileCount: 10,
      lastUpdated: '2023-05-15T09:20:00',
      icon: '🏡'
    },
    {
      id: 'club',
      name: 'Wine Club',
      description: 'Information about wine club tiers, benefits, and membership',
      fileCount: 8,
      lastUpdated: '2023-05-10T16:15:00',
      icon: '🥂'
    },
    {
      id: 'shipping',
      name: 'Shipping & Delivery',
      description: 'Information about shipping policies, costs, and delivery times',
      fileCount: 6,
      lastUpdated: '2023-05-05T11:30:00',
      icon: '📦'
    },
    {
      id: 'faq',
      name: 'FAQs',
      description: 'Frequently asked questions and their answers',
      fileCount: 15,
      lastUpdated: '2023-05-11T13:45:00',
      icon: '❓'
    },
    {
      id: 'miles',
      name: 'Milea Miles',
      description: 'Information about our loyalty program and referrals',
      fileCount: 5,
      lastUpdated: '2023-05-09T10:10:00',
      icon: '⭐'
    },
    {
      id: 'about',
      name: 'About Us',
      description: 'Information about our history, team, and vineyard',
      fileCount: 7,
      lastUpdated: '2023-05-01T15:30:00',
      icon: '🌱'
    }
  ];
  
  // Filter domains based on search query
  const filteredDomains = knowledgeDomains.filter(domain => 
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle domain selection
  const handleSelectDomain = (domain: KnowledgeDomain) => {
    setSelectedDomain(domain);
  };
  
  // Handle back to domains button
  const handleBackToDomains = () => {
    setSelectedDomain(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Global search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search all knowledge content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-darkBrown text-white rounded hover:bg-darkBrownHover">
          New Domain
        </button>
      </div>
      
      {selectedDomain ? (
        <div>
          <div className="mb-4">
            <button 
              onClick={handleBackToDomains}
              className="flex items-center text-primary hover:text-darkBrown"
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Domains
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">{selectedDomain.icon}</span>
              <div>
                <h3 className="text-xl font-medium text-gray-900">{selectedDomain.name}</h3>
                <p className="text-gray-500">{selectedDomain.description}</p>
                <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                  <span>{selectedDomain.fileCount} files</span>
                  <span>Last updated: {new Date(selectedDomain.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <FileBrowser domainId={selectedDomain.id} />
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Knowledge Domains</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map(domain => (
              <div
                key={domain.id}
                onClick={() => handleSelectDomain(domain)}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:border-primary transition-colors"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{domain.icon}</span>
                  <h4 className="text-lg font-medium text-gray-900">{domain.name}</h4>
                </div>
                <p className="text-gray-500 text-sm mb-3">{domain.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{domain.fileCount} files</span>
                  <span>Updated {new Date(domain.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredDomains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No domains found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainExplorer;