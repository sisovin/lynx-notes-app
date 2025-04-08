import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import '../styles/EditNoteForm.css';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

interface EditNoteFormProps {
  note: Note | null;
  onClose: () => void;
  onSave: (updatedNote: Note) => void;
}

const EditNoteForm: React.FC<EditNoteFormProps> = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with note data when it changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setError('');
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!note) {
      setError('No note to edit');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      console.log(`EditNoteForm: Saving note ${note.id} with title "${title}"`);
      
      const updatedNote = await apiService.updateNote(note.id, { 
        title, 
        content 
      });
      
      if (updatedNote) {
        console.log('EditNoteForm: Note updated successfully');
        onSave({
          ...note,
          title,
          content,
          updatedAt: new Date().toISOString()
        });
        onClose();
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error: any) {
      console.error('EditNoteForm: Error updating note:', error);
      setError(error.message || 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  if (!note) {
    return null;
  }

  return (
    <div className="edit-note-overlay">
      <div className="edit-note-modal">
        <div className="edit-note-header">
          <h2>Edit Note</h2>
          <button 
            className="close-button" 
            onClick={onClose}
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
        
        <form onSubmit={handleSubmit} className="edit-note-form">
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
              onClick={onClose}
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteForm;