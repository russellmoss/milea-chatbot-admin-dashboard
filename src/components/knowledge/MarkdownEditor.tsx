import React, { useState, useEffect } from 'react';
import { KnowledgeFile } from './FileBrowser';
import { updateS3MarkdownContent } from '../../apis/s3/services';
import { pullS3MarkdownContent } from '../../apis/s3/services';

interface MarkdownEditorProps {
  selectedFile: KnowledgeFile | null;
  setSelectedFile: (file: KnowledgeFile | null) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ selectedFile, setSelectedFile }) => {
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [savedContent, setSavedContent] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(30);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Initialize editor with sample file content
  useEffect(() => {
    // Simulate loading a file
    if (!selectedFile) return;

    const fetchFileContent = async () => {
      console.debug('Fetching content from path:', selectedFile.path);
      const fileContent = await pullS3MarkdownContent(selectedFile.path);
      // console.debug('Fetched content:', fileContent);
      setContent(fileContent);
      setSavedContent(fileContent);
      setFileName(selectedFile.name);
      setLastSaved(new Date(selectedFile.lastModified || '').toLocaleString());
    };
    fetchFileContent();
  }, [selectedFile]);
  
  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, autoSaveInterval * 1000);
    
    return () => clearTimeout(timer);
  }, [content, isDirty, autoSaveEnabled, autoSaveInterval]);
  
  // Check if content has changed
  useEffect(() => {
    setIsDirty(content !== savedContent);
  }, [content, savedContent]);
  
  // Handle save
  const handleSave = async() => {
    if (!isDirty || !selectedFile) return;
    
    console.debug('Saving content to S3, path:', selectedFile.path);
    await updateS3MarkdownContent(selectedFile.path, content);
    const newContent = await pullS3MarkdownContent(selectedFile.path);
    const updatedFile = {
      ...selectedFile,
      lastModified: new Date().toISOString()
    };
    setSelectedFile(updatedFile);
    setContent(newContent);
    setSavedContent(newContent);
    setLastSaved(new Date().toLocaleString());
    setIsDirty(false);
  };
  
  // Preview rendered markdown
  const renderMarkdown = (text: string) => {
    if (!text) return { __html: '' };
    
    // Basic markdown rendering (a real app would use a proper markdown library)
    const html = text
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^[0-9]+\. (.*$)/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');
    
    return { __html: html };
  };
  
  // Format toolbar buttons
  const formatText = (type: string) => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let replacement = '';
    let newCursorPos = 0;
    
    switch (type) {
      case 'h1':
        replacement = `# ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'h2':
        replacement = `## ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'h3':
        replacement = `### ${selectedText}`;
        newCursorPos = start + 4;
        break;
      case 'bold':
        replacement = `**${selectedText}**`;
        newCursorPos = selectedText.length ? start + 2 : start + 4;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        newCursorPos = selectedText.length ? start + 1 : start + 2;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        newCursorPos = selectedText.length ? start + selectedText.length + 3 : start + 1;
        break;
      case 'list-ul':
        replacement = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        newCursorPos = start + 2;
        break;
      case 'list-ol':
        replacement = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        newCursorPos = start + 3;
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    // Set focus and cursor position after state update
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length === 0) {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      } else {
        textarea.setSelectionRange(start, start + replacement.length);
      }
    }, 0);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
      {/* Editor header */}
      <div className="bg-white border border-gray-200 rounded-t-lg p-4 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="text-lg font-medium text-gray-900 px-2 py-1 border border-transparent rounded hover:border-gray-300 focus:border-primary focus:outline-none"
          />
          {isDirty && (
            <span className="ml-3 text-sm text-gray-500 italic">
              (unsaved changes)
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setEditMode(true)}
              className={`px-3 py-1 text-sm ${editMode ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`px-3 py-1 text-sm ${previewMode ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Preview
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`px-4 py-2 rounded text-white ${
              isDirty ? 'bg-darkBrown hover:bg-primary' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Formatting toolbar */}
      <div className="bg-gray-50 border-l border-r border-gray-200 p-2 flex items-center space-x-1">
        <button 
          onClick={() => formatText('h1')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Heading 1"
        >
          H1
        </button>
        <button 
          onClick={() => formatText('h2')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Heading 2"
        >
          H2
        </button>
        <button 
          onClick={() => formatText('h3')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Heading 3"
        >
          H3
        </button>
        <div className="h-4 border-l border-gray-300 mx-1"></div>
        <button 
          onClick={() => formatText('bold')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.5 10a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm-4-7a2 2 0 100 4 2 2 0 000-4zm8 8a2 2 0 11-4 0 2 2 0 014 0zM6.5 18a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        <button 
          onClick={() => formatText('italic')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-3-1a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={() => formatText('link')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Link"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="h-4 border-l border-gray-300 mx-1"></div>
        <button 
          onClick={() => formatText('list-ul')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={() => formatText('list-ol')}
          className="p-1 text-gray-700 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Auto-save toggle */}
        <div className="ml-auto flex items-center">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className="mr-2"
            />
            Auto-save
          </label>
          
          {lastSaved && (
            <span className="ml-4 text-sm text-gray-500">
              Last saved: {lastSaved}
            </span>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex border-l border-r border-b border-gray-200 rounded-b-lg overflow-hidden">
        {editMode && (
          <div className={`${previewMode ? 'w-1/2' : 'w-full'} bg-white`}>
            <textarea
              id="markdown-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-4 focus:outline-none resize-none font-mono text-sm"
              placeholder="Type your markdown here..."
            ></textarea>
          </div>
        )}
        
        {previewMode && (
          <div className={`${editMode ? 'w-1/2' : 'w-full'} bg-white overflow-auto border-l border-gray-200`}>
            <div 
              className="markdown-preview p-4 prose max-w-none"
              dangerouslySetInnerHTML={renderMarkdown(content)}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;