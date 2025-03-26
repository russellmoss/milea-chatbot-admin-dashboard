import React, { useState } from 'react';
import QualityMetricsDashboard from '../components/feedback/QualityMetricsDashboard';
import ResponseCoach from '../components/feedback/ResponseCoach';
import KnowledgeGaps from '../components/feedback/KnowledgeGaps';

const Feedback: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quality');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Response Refinement</h2>
        <p className="text-gray-600 mb-6">
          Monitor chatbot performance, analyze user feedback, and identify areas for improvement.
        </p>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('quality')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quality'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quality Metrics
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coach'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Response Coach
            </button>
            <button
              onClick={() => setActiveTab('gaps')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gaps'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Knowledge Gaps
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'quality' && <QualityMetricsDashboard />}
          {activeTab === 'coach' && <ResponseCoach />}
          {activeTab === 'gaps' && <KnowledgeGaps />}
        </div>
      </div>
    </div>
  );
};

export default Feedback;