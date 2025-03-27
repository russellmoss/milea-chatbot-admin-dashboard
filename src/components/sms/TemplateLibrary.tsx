import React, { useState, useEffect } from 'react';
import { MessageTemplate } from '../../types/sms';

// Template Editor Modal
interface TemplateEditorProps {
  template?: MessageTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<MessageTemplate, 'id'>) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  template, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [category, setCategory] = useState(template?.category || 'General');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(template?.name || '');
      setContent(template?.content || '');
      setCategory(template?.category || 'General');
      setError('');
    }
  }, [isOpen, template]);

  // Extract variables from content
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{(\w+)\}/g);
    return matches ? matches.map(v => v.slice(1, -1)) : [];
  };

  // Validate and save template
  const handleSave = () => {
    // Basic validation
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!content.trim()) {
      setError('Template content is required');
      return;
    }

    // Save template
    onSave({
      name: name.trim(),
      content: content.trim(),
      category,
      variables: extractVariables(content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              id="templateName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label htmlFor="templateCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="templateCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="General">General</option>
              <option value="Reservations">Reservations</option>
              <option value="Wine Club">Wine Club</option>
              <option value="Events">Events</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label htmlFor="templateContent" className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <textarea
              id="templateContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter template message. Use {variable} for dynamic content."
            />
            <p className="mt-1 text-xs text-gray-500">
              Tip: Use {'{variable}'} for dynamic content replacement
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBrown"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Template Library Component
const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: 'template1',
      name: 'Tasting Confirmation',
      content: 'Your tasting reservation for {date} at {time} is confirmed. We look forward to welcoming you to Milea Estate Vineyard!',
      category: 'Reservations',
      variables: ['date', 'time'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template2',
      name: 'Wine Club Pickup',
      content: 'Hello {name}, your wine club shipment for {month} is ready for pickup at the tasting room. We\'re open daily from 10 AM to 5 PM.',
      category: 'Wine Club',
      variables: ['name', 'month'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template3',
      name: 'Event Reminder',
      content: 'Reminder: You\'re registered for our {event} on {date} at {time}. We look forward to seeing you!',
      category: 'Events',
      variables: ['event', 'date', 'time'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'template4',
      name: 'Thank You',
      content: 'Thank you for visiting Milea Estate Vineyard today! We hope you enjoyed your experience. Don\'t forget to follow us on social media and sign up for our newsletter for updates on events and new releases.',
      category: 'General',
      variables: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | undefined>(undefined);

  // Get unique categories
  const categories = [
    'All', 
    ...Array.from(new Set(templates.map(t => t.category)))
  ];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Handle template creation
  const handleCreateTemplate = (templateData: Omit<MessageTemplate, 'id'>) => {
    const newTemplate: MessageTemplate = {
      ...templateData,
      id: `template_${Date.now()}`
    };
    setTemplates([...templates, newTemplate]);
    setIsEditorOpen(false);
  };

  // Handle template update
  const handleUpdateTemplate = (templateData: Omit<MessageTemplate, 'id'>) => {
    if (!editingTemplate) return;

    setTemplates(templates.map(t => 
      t.id === editingTemplate.id 
        ? { ...editingTemplate, ...templateData } 
        : t
    ));
    setIsEditorOpen(false);
    setEditingTemplate(undefined);
  };

  // Handle template deletion
  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Editor Modal */}
      <TemplateEditor
        isOpen={isEditorOpen}
        template={editingTemplate}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(undefined);
        }}
        onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">Message Templates</h2>
          <button
            onClick={() => {
              setEditingTemplate(undefined);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBrown"
          >
            Create New Template
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            <svg 
              className="absolute left-3 top-3 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No templates found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div 
                key={template.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {template.content}
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setIsEditorOpen(true);
                    }}
                    className="text-sm text-primary hover:text-darkBrown"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibrary;