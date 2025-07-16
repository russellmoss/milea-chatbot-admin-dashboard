import React, { useState, useEffect, useMemo } from 'react';
import { MessageTemplate } from '../../types/sms';
import { toast } from 'react-hot-toast';
import { createTemplate, updateTemplate, deleteTemplate } from '../../apis/sms/apis';

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

interface TemplateLibraryProps {
  templates: MessageTemplate[];
  setTemplates: (templates: MessageTemplate[]) => void;
  onSendMessage: (message: string, phoneNumber: string) => Promise<void>;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  setTemplates,
  onSendMessage
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);

  // Filter templates based on category and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  // Get unique categories for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(templates.map(t => t.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, [templates]);

  // Handle template deletion
  const handleDeleteTemplate = async (template: MessageTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteConfirm(true);
  };

  // Confirm template deletion
  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await deleteTemplate(templateToDelete.id);
      const updatedTemplates = templates.filter(t => t.id !== templateToDelete.id);
      setTemplates(updatedTemplates);
      toast.success('Template deleted successfully');
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  // Handle template edit
  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  // Handle template creation/update
  const handleSaveTemplate = async (templateData: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        setTemplates(templates.map(t => (t.id === editingTemplate.id ? { ...t, ...templateData } : t)));
        toast.success('Template updated successfully');
      } else {
        const newTemplate = await createTemplate(templateData);
        setTemplates([...templates, newTemplate]);
        toast.success('Template created successfully');
      }
      
      setShowCreateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  // Handle template usage
  const handleUseTemplate = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast.success('The template content has been copied to clipboard. Please exchange the variables with real data and select recipients to send the message.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Message Templates</h2>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-darkBrown"
        >
          Create New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="text-primary hover:text-darkBrown"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{template.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{template.category}</span>
              <button
                onClick={() => handleUseTemplate(template)}
                className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-darkBrown"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveTemplate({
                name: formData.get('name') as string,
                content: formData.get('content') as string,
                category: formData.get('category') as string,
                variables: (formData.get('variables') as string).split(',').map(v => v.trim()).filter(Boolean)
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingTemplate?.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingTemplate?.category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <textarea
                    name="content"
                    defaultValue={editingTemplate?.content}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variables (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="variables"
                    defaultValue={editingTemplate?.variables.join(', ')}
                    placeholder="e.g., name, date, time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-darkBrown"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Template
            </h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTemplate}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;