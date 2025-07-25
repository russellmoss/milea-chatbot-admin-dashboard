import React, { useState } from 'react';
import DomainExplorer from '../components/knowledge/DomainExplorer';
import MarkdownEditor from '../components/knowledge/MarkdownEditor';
import SyncControls from '../components/knowledge/SyncControls';
import type { KnowledgeFile } from '../components/knowledge/FileBrowser';

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explorer');
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);

  const handleUpdateSelectedFile = (file: KnowledgeFile) => {
    setSelectedFile(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Knowledge Base Management</h2>
        <p className="text-gray-600 mb-6">
          Manage and update knowledge content that powers the Milea chatbot.
        </p>
        
        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'explorer'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Domain Explorer
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'editor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Markdown Editor
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sync'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sync Controls
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div>
          {activeTab === 'explorer' && <DomainExplorer setActiveTab={setActiveTab} handleUpdateSelectedFile={handleUpdateSelectedFile} />}
          {activeTab === 'editor' && <MarkdownEditor selectedFile={selectedFile} />}
          {activeTab === 'sync' && <SyncControls />}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;