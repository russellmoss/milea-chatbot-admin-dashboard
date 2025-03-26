import React, { useState } from 'react';
import { MessageTemplate } from './MessagingInbox';

interface TemplateSelectorProps {
  templates: MessageTemplate[];
  onSelectTemplate: (template: MessageTemplate) => string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  // Filter templates by category and search query
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-900">Message Templates</h3>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      
      {/* Category tabs */}
      <div className="flex overflow-x-auto pb-2 mb-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-sm rounded-full mr-2 whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Template list */}
      <div className="max-h-60 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No templates match your criteria
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {template.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={() => onSelectTemplate({ id: 'custom', name: 'Custom', content: '', category: 'Custom' })}
          className="text-sm text-primary hover:text-darkBrown"
        >
          Create New Template
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;