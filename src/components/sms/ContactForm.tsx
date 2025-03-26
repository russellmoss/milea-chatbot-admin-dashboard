import React, { useState, useEffect } from 'react';

// Define types for contact
export interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  birthdate?: string;
  tags?: string[];
  notes?: string;
  optIn: boolean;
  lists?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (contact: Contact) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  // Initialize form state with provided contact or defaults
  const [formData, setFormData] = useState<Contact>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    birthdate: '',
    tags: [],
    notes: '',
    optIn: true,
    lists: []
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        // Ensure all optional fields exist even if not in provided contact
        email: contact.email || '',
        birthdate: contact.birthdate || '',
        tags: contact.tags || [],
        notes: contact.notes || '',
        lists: contact.lists || []
      });
    }
  }, [contact]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle key press in tag input (add tag on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Require first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Require last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Require and validate phone number
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (e.g., +12345678901)';
    }

    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate phone number format
  const isValidPhoneNumber = (phone: string): boolean => {
    // Simple validation: should be in E.164 format (+12345678901)
    return /^\+?[1-9]\d{9,14}$/.test(phone.replace(/\D/g, ''));
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {contact?.id ? 'Edit Contact' : 'New Contact'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              required
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              required
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+12345678901"
              className={`w-full px-3 py-2 border ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
              required
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Birthdate */}
          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
              Birthdate
            </label>
            <input
              type="date"
              name="birthdate"
              id="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {formData.tags?.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 inline-flex text-primary-400 hover:text-primary-600 focus:outline-none"
                  >
                    <span className="sr-only">Remove tag</span>
                    <svg 
                      className="h-3 w-3" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Opt-in Status */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="optIn"
                id="optIn"
                checked={formData.optIn}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="optIn" className="ml-2 block text-sm text-gray-700">
                Consent to receive SMS messages
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              By checking this box, you confirm that this contact has given explicit consent to receive SMS messages.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isSubmitting ? 'Saving...' : contact?.id ? 'Update Contact' : 'Create Contact'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;