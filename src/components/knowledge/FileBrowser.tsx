import React, { useState } from 'react';

// Define types
interface KnowledgeFile {
  id: string;
  name: string;
  content: string;
  path: string;
  lastModified: string;
  size: number;
  author: string;
  type: 'markdown' | 'html' | 'json';
}

interface FileBrowserProps {
  domainId: string;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ domainId }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortField, setSortField] = useState<'name' | 'lastModified' | 'size'>('lastModified');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);
  const [search, setSearch] = useState('');
  
  // Sample files data
  const files: KnowledgeFile[] = [
    {
      id: '1',
      name: 'Red Wines Overview.md',
      content: '# Red Wines\n\nThis document provides an overview of our red wine selection.\n\n## Cabernet Franc\n\nOur signature wine. Bold, full-bodied with notes of black cherry and bell pepper.\n\n## Pinot Noir\n\nElegant and medium-bodied with notes of raspberry and earth.\n\n## Merlot\n\nSoft, approachable with plum and chocolate notes.',
      path: `/${domainId}/red-wines-overview.md`,
      lastModified: '2023-05-12T10:30:00',
      size: 1254,
      author: 'Sarah Johnson',
      type: 'markdown'
    },
    {
      id: '2',
      name: 'White Wines Overview.md',
      content: '# White Wines\n\nThis document provides an overview of our white wine selection.\n\n## Chardonnay\n\nRich and full-bodied with notes of apple and vanilla.\n\n## Riesling\n\nAromatic with bright acidity and notes of peach and lime.\n\n## Grüner Veltliner\n\nCrisp and peppery with notes of green apple and white pepper.',
      path: `/${domainId}/white-wines-overview.md`,
      lastModified: '2023-05-11T15:45:00',
      size: 1102,
      author: 'Sarah Johnson',
      type: 'markdown'
    },
    {
      id: '3',
      name: '2022 Vintages.md',
      content: '# 2022 Vintages\n\nThis document covers our 2022 vintage wines.\n\n## Growing Season\n\nThe 2022 growing season was characterized by moderate temperatures and ideal rainfall, leading to balanced ripening and excellent fruit quality.\n\n## Wines\n\n- **Cabernet Franc 2022**: Exceptional concentration with dark fruit flavors and well-integrated tannins.\n- **Chardonnay 2022**: Bright acidity with perfect balance of fruit and oak influence.\n- **Riesling 2022**: Vibrant aromatics and pristine fruit expression.',
      path: `/${domainId}/2022-vintages.md`,
      lastModified: '2023-05-08T09:20:00',
      size: 876,
      author: 'James Wilson',
      type: 'markdown'
    },
    {
      id: '4',
      name: 'Tasting Notes.md',
      content: '# Tasting Notes\n\nDetailed tasting notes for our current releases.\n\n## Cabernet Franc 2021\n\n**Appearance**: Deep ruby with purple edges\n**Nose**: Black cherry, blackberry, bell pepper, and subtle herbs\n**Palate**: Full-bodied with firm tannins, flavors of dark fruits, graphite, and spice\n**Finish**: Long and persistent with notes of cedar and vanilla\n\n## Chardonnay 2022\n\n**Appearance**: Pale gold\n**Nose**: Apple, pear, vanilla, and a hint of butter\n**Palate**: Medium to full-bodied with balanced acidity, flavors of baked apple, citrus, and oak\n**Finish**: Creamy with lingering notes of caramel and spice',
      path: `/${domainId}/tasting-notes.md`,
      lastModified: '2023-05-10T11:15:00',
      size: 1528,
      author: 'Emily Rodriguez',
      type: 'markdown'
    },
    {
      id: '5',
      name: 'Wine and Food Pairings.md',
      content: '# Wine and Food Pairings\n\nSuggested food pairings for our wines.\n\n## Cabernet Franc\n\n- Grilled ribeye steak\n- Lamb chops with rosemary\n- Aged cheddar\n- Mushroom dishes\n\n## Chardonnay\n\n- Roasted chicken\n- Cream-based pasta dishes\n- Lobster and crab\n- Semi-soft cheeses\n\n## Riesling\n\n- Spicy Asian cuisine\n- Pork dishes\n- Fresh fruit desserts\n- Blue cheese',
      path: `/${domainId}/wine-food-pairings.md`,
      lastModified: '2023-05-09T14:30:00',
      size: 932,
      author: 'Michael Parkers',
      type: 'markdown'
    },
    {
      id: '6',
      name: 'Winemaking Process.md',
      content: '# Winemaking Process\n\nAn overview of our winemaking philosophy and techniques.\n\n## Harvest\n\nAll grapes are hand-harvested and carefully sorted to ensure only the highest quality fruit is used.\n\n## Fermentation\n\nRed wines undergo traditional fermentation in stainless steel tanks with regular punchdowns. White wines are gently pressed and fermented at cooler temperatures to preserve aromatics.\n\n## Aging\n\nRed wines are aged in French oak barrels for 12-18 months. White wines see a mix of stainless steel and neutral oak aging to achieve balanced complexity.',
      path: `/${domainId}/winemaking-process.md`,
      lastModified: '2023-05-07T16:45:00',
      size: 1358,
      author: 'James Wilson',
      type: 'markdown'
    }
  ];
  
  // Filter files based on search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    // Sort by selected field
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'lastModified') {
      comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
    } else if (sortField === 'size') {
      comparison = a.size - b.size;
    }
    
    // Apply sort direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Handle sort change
  const handleSort = (field: 'name' | 'lastModified' | 'size') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Open file in editor
  const handleOpenFile = (file: KnowledgeFile) => {
    setSelectedFile(file);
    // In a real implementation, this might navigate to the editor tab with the file loaded
    alert(`Opening ${file.name} in editor`);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* File browser header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-gray-900">Files</div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="List View"
            >
              <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <svg className="h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div className="h-6 border-l border-gray-300 mx-2"></div>
            <button
              className="text-primary hover:text-darkBrown"
              title="New File"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* File list or grid */}
      <div className="p-4">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortField === 'name' && (
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
                    onClick={() => handleSort('lastModified')}
                  >
                    <div className="flex items-center">
                      Last Modified
                      {sortField === 'lastModified' && (
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
                    onClick={() => handleSort('size')}
                  >
                    <div className="flex items-center">
                      Size
                      {sortField === 'size' && (
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
                    Author
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedFiles.map(file => (
                  <tr 
                    key={file.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOpenFile(file)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        {file.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.lastModified).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // This would show a dropdown menu in a real implementation
                          alert(`Options for ${file.name}`);
                        }}
                        className="text-primary hover:text-darkBrown"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                
                {sortedFiles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No files found matching "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedFiles.map(file => (
              <div
                key={file.id}
                onClick={() => handleOpenFile(file)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-primary truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // This would show a dropdown menu in a real implementation
                      alert(`Options for ${file.name}`);
                    }}
                    className="text-gray-400 hover:text-darkBrown"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Last modified: {new Date(file.lastModified).toLocaleDateString()}</p>
                  <p className="mt-1">By: {file.author}</p>
                </div>
              </div>
            ))}
            
            {sortedFiles.length === 0 && (
              <div className="col-span-full text-center py-4 text-gray-500">
                No files found matching "{search}"
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* File preview panel (could be implemented as a modal or sidebar) */}
      {selectedFile && (
        <div className="hidden md:block border-t border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-3 h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedFile.content}</pre>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>Last modified: {new Date(selectedFile.lastModified).toLocaleString()}</span>
            <span>Size: {formatFileSize(selectedFile.size)}</span>
            <span>Author: {selectedFile.author}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;