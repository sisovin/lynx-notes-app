import React, { useState } from 'react';
import { apiService } from '../api/apiService';
import '../styles/AddNoteForm.css';

interface AddNoteFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      console.log(`AddNoteForm: Creating note with title "${title}"`);
      
      await apiService.createNote({ 
        title, 
        content 
      });
      
      console.log('AddNoteForm: Note created successfully');
      setTitle('');
      setContent('');
      setError('');
      onSave();
    } catch (error: any) {
      console.error('AddNoteForm: Error creating note:', error);
      setError(error.message || 'Failed to create note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-note-form-container">
      <div className="add-note-form-header">
        <h2>Add New Note</h2>
        <button 
          className="close-button" 
          onClick={onCancel}
          aria-label="Close"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="add-note-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            disabled={isSaving}
            className="title-input"
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note content"
            disabled={isSaving}
            className="content-textarea"
            rows={8}
          />
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNoteForm;