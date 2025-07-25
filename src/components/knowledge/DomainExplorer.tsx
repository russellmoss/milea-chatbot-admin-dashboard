import React, { useState, useEffect } from 'react';
import FileBrowser from './FileBrowser';
import swal from 'sweetalert';
import { createDomain, getAllDomains } from '../../apis/domain/apis';
import { getAllMarkdownFiles, updateDomainFilenames } from '../../apis/s3/services';
import { Domain } from '../../apis/domain/interfaces';
import { getSyncSetting } from '../../apis/setting/apis';


const DomainExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [newDomainWindowOpen, setNewDomainWindowOpen] = useState<boolean>(false);
  const [newDomainName, setNewDomainName] = useState<string>('');
  const [newDomainDescription, setNewDomainDescription] = useState<string>('');
  const [newDomainIcon, setNewDomainIcon] = useState<string>('🍷');
  const [error, setError] = useState<string | null>(null);


  // handle errors
  useEffect(() => {
    if (error) {
      swal({title: "Error", text: error, icon: "error"});
      setError(null);
    }
  }, [error]);


  // Fetch all domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      const domains = await getAllDomains();
      const syncSettings = await getSyncSetting();
      const markdownFiles = await getAllMarkdownFiles(syncSettings.webSyncSetting.baseurl);
      const updatedDomains = await updateDomainFilenames(domains, markdownFiles);
      console.debug("Updated domains with filenames: ", updatedDomains);
      setAllDomains(updatedDomains);
    };
    fetchDomains();
  }, []);
  
  // Filter domains based on search query
  const filteredDomains = allDomains.filter(domain =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle domain selection
  const handleSelectDomain = (domain: Domain) => {
    setSelectedDomain(domain);
  };
  
  // Handle back to domains button
  const handleBackToDomains = () => {
    setSelectedDomain(null);
  };

  const handleNewDomainCreation = async() => {
    const newDomain = await createDomain({
      name: newDomainName,
      description: newDomainDescription,
      icon: newDomainIcon,
    });
    setAllDomains([...allDomains, newDomain]);
    setNewDomainWindowOpen(false);
    setNewDomainName('');
    setNewDomainDescription('');
    setNewDomainIcon('🍷');
  }

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

        <button className="px-4 py-2 bg-darkBrown text-white rounded hover:bg-darkBrownHover" onClick={() => setNewDomainWindowOpen(true)}>
          New Domain
        </button>
      </div>

      {/* New Domain Creation Modal */}
      {newDomainWindowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Domain</h3>
            {/* Form for creating new domain */}
            <form onSubmit={handleNewDomainCreation}>

              {/* domain name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary py-1 px-2" 
                  required
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                />
              </div>

              {/* domain description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary py-1 px-2" 
                  rows={3} 
                  required
                  value={newDomainDescription}
                  onChange={(e) => setNewDomainDescription(e.target.value)}
                ></textarea>
              </div>

              {/* domain icon selections */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {['🍷', '🎉', '🏡', '🥂', '📦', '❓', '⭐', '🌱'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`text-3xl hover:bg-gray-100 rounded p-2 ${newDomainIcon === icon ? 'bg-gray-200' : ''}`}
                      onClick={() => { setNewDomainIcon(icon) }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setNewDomainWindowOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-darkBrown text-white rounded hover:bg-darkBrownHover">Create Domain</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Domain List or Selected Domain Details */}
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
                  <span>{selectedDomain.filenames.length} files</span>
                  <span>Last updated: {new Date(selectedDomain.updatedAt).toLocaleDateString()}</span>
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
                  <span>{domain.filenames.length} files</span>
                  <span>Updated {new Date(domain.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredDomains.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? (
                <span>No domains found matching <span className="font-medium">"{searchQuery}"</span></span>
              ) : (
                <span>No domains available. Create a new domain to get started.</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainExplorer;