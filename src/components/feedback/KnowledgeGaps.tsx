import React, { useState } from 'react';

// Define types for the knowledge gap data
interface KnowledgeGap {
  id: number;
  topic: string;
  category: string;
  detectedQueries: number;
  impact: 'Low' | 'Medium' | 'High';
  status: 'Unresolved' | 'In Progress';
  frequency: 'Low' | 'Medium' | 'High' | 'Very High';
  lastDetected: string;
  sampleQueries: string[];
}

type SortField = 'topic' | 'detectedQueries' | 'impact' | 'frequency' | 'lastDetected';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'unresolved' | 'inProgress' | 'highImpact';

// Sample knowledge gaps data
const SAMPLE_GAPS: KnowledgeGap[] = [
  {
    id: 1,
    topic: "2021 Pinot Noir",
    category: "Wine Info",
    detectedQueries: 8,
    impact: "Medium",
    status: "Unresolved",
    frequency: "High",
    lastDetected: "2023-05-08T14:17:00",
    sampleQueries: [
      "I'm trying to find info about your 2021 Pinot Noir",
      "How much is the 2021 Pinot Noir?",
      "What food pairs well with your 2021 Pinot Noir?"
    ]
  },
  {
    id: 2,
    topic: "Wine Shipping to Texas",
    category: "Shipping & Delivery",
    detectedQueries: 5,
    impact: "High",
    status: "In Progress",
    frequency: "Medium",
    lastDetected: "2023-05-09T09:32:00",
    sampleQueries: [
      "Can you ship wine to Dallas, TX?",
      "Are you able to deliver to Texas?",
      "What's the shipping cost to Austin, TX?"
    ]
  },
  {
    id: 3,
    topic: "Summer Concert Series",
    category: "Events",
    detectedQueries: 12,
    impact: "High",
    status: "Unresolved",
    frequency: "Very High",
    lastDetected: "2023-05-15T15:45:00",
    sampleQueries: [
      "When is the summer concert series?",
      "Which bands are playing at your summer concerts?",
      "How can I get tickets to the summer music events?"
    ]
  },
  {
    id: 4,
    topic: "Milea Miles Reward Program",
    category: "Loyalty Program",
    detectedQueries: 6,
    impact: "Medium",
    status: "In Progress",
    frequency: "Medium",
    lastDetected: "2023-05-12T11:24:00",
    sampleQueries: [
      "How do I earn points in the Milea Miles program?",
      "What rewards can I get with Milea Miles?",
      "How many points do I need for a free tasting?"
    ]
  },
  {
    id: 5,
    topic: "Private Event Bookings",
    category: "Events",
    detectedQueries: 4,
    impact: "Low",
    status: "Unresolved",
    frequency: "Low",
    lastDetected: "2023-05-10T10:15:00",
    sampleQueries: [
      "Can I book a private event at your winery?",
      "What's the cost for hosting a corporate event?",
      "Do you do wedding receptions?"
    ]
  }
];

const KnowledgeGaps: React.FC = () => {
  const [sortField, setSortField] = useState<SortField>('impact');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedGap, setSelectedGap] = useState<KnowledgeGap | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // Sort knowledge gaps
  const sortedGaps = [...SAMPLE_GAPS].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'topic') {
      comparison = a.topic.localeCompare(b.topic);
    } else if (sortField === 'detectedQueries') {
      comparison = a.detectedQueries - b.detectedQueries;
    } else if (sortField === 'impact') {
      const impactValues: Record<KnowledgeGap['impact'], number> = { 'Low': 1, 'Medium': 2, 'High': 3 };
      comparison = impactValues[a.impact] - impactValues[b.impact];
    } else if (sortField === 'frequency') {
      const frequencyValues: Record<KnowledgeGap['frequency'], number> = { 
        'Low': 1, 
        'Medium': 2, 
        'High': 3, 
        'Very High': 4 
      };
      comparison = frequencyValues[a.frequency] - frequencyValues[b.frequency];
    } else if (sortField === 'lastDetected') {
      comparison = new Date(a.lastDetected).getTime() - new Date(b.lastDetected).getTime();
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Filter knowledge gaps
  const filteredGaps = sortedGaps.filter(gap => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return gap.status === 'Unresolved';
    if (filter === 'inProgress') return gap.status === 'In Progress';
    if (filter === 'highImpact') return gap.impact === 'High';
    return true;
  });
  
  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Mark as resolved
  const handleMarkResolved = (gapId: number) => {
    alert(`Knowledge gap #${gapId} marked as resolved.`);
    // In a real implementation, this would update the knowledge gap status
  };
  
  // Mark as false positive
  const handleMarkFalsePositive = (gapId: number) => {
    alert(`Knowledge gap #${gapId} marked as false positive.`);
    // In a real implementation, this would remove the knowledge gap
  };
  
  // Create content
  const handleCreateContent = (gapId: number) => {
    alert(`Redirecting to knowledge base editor for gap #${gapId}`);
    // In a real implementation, this would redirect to the knowledge base editor
  };
  
  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all'
                ? 'bg-darkBrown text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Gaps
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'unresolved'
                ? 'bg-darkBrown text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter('inProgress')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'inProgress'
                ? 'bg-darkBrown text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('highImpact')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'highImpact'
                ? 'bg-darkBrown text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            High Impact
          </button>
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Search knowledge gaps..."
            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      
      {/* Knowledge gaps table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('topic')}
                >
                  <div className="flex items-center">
                    Topic
                    {sortField === 'topic' && (
                      <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('detectedQueries')}
                >
                  <div className="flex items-center">
                    Queries
                    {sortField === 'detectedQueries' && (
                      <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('impact')}
                >
                  <div className="flex items-center">
                    Impact
                    {sortField === 'impact' && (
                      <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('frequency')}
                >
                  <div className="flex items-center">
                    Frequency
                    {sortField === 'frequency' && (
                      <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGaps.map(gap => (
                <tr 
                  key={gap.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedGap(selectedGap?.id === gap.id ? null : gap)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {gap.topic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gap.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gap.detectedQueries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      gap.impact === 'High' ? 'bg-red-100 text-red-800' :
                      gap.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {gap.impact}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      gap.frequency === 'Very High' ? 'bg-red-100 text-red-800' :
                      gap.frequency === 'High' ? 'bg-orange-100 text-orange-800' :
                      gap.frequency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {gap.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      gap.status === 'Unresolved' ? 'bg-gray-100 text-gray-800' :
                      gap.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {gap.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateContent(gap.id);
                      }}
                      className="text-primary hover:text-darkBrown mr-3"
                    >
                      Create Content
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Selected gap details */}
      {selectedGap && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{selectedGap.topic}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleMarkFalsePositive(selectedGap.id)}
                className="px-3 py-1 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Mark as False Positive
              </button>
              <button
                onClick={() => handleMarkResolved(selectedGap.id)}
                className="px-3 py-1 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleCreateContent(selectedGap.id)}
                className="px-3 py-1 text-sm rounded-md bg-darkBrown text-white hover:bg-darkBrownHover"
              >
                Create Content
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
              <div className="font-medium">{selectedGap.category}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Detected Queries</div>
              <div className="font-medium">{selectedGap.detectedQueries}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Last Detected</div>
              <div className="font-medium">{new Date(selectedGap.lastDetected).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Sample Queries</h4>
            <ul className="bg-gray-50 rounded-lg p-3 space-y-2">
              {selectedGap.sampleQueries.map((query, index) => (
                <li key={index} className="text-sm">
                  "{query}"
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Suggested Topics to Cover</h4>
            <ul className="bg-gray-50 rounded-lg p-3 space-y-2">
              <li className="text-sm">Description of {selectedGap.topic}</li>
              <li className="text-sm">Key details about {selectedGap.topic}</li>
              <li className="text-sm">Frequently asked questions about {selectedGap.topic}</li>
              <li className="text-sm">Related information that may be helpful</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGaps;