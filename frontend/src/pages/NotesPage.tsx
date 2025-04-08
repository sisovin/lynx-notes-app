import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteList, { NoteListHandle } from '../components/NoteList';
import AddNoteForm from '../components/AddNoteForm';
import EditNoteForm from '../components/EditNoteForm';
import Navbar from '../components/Navbar';
import { apiService } from '../api/apiService';
import '../styles/NotesPage.css';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

interface NoteFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const NotesPage: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  // Add this state
  const [showAddNote, setShowAddNote] = useState(false);
  const noteListRef = useRef<NoteListHandle>(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // Add this handler
// In the handleSaveNewNote function, update it to use await
const handleSaveNewNote = async () => {
  setShowAddNote(false);
  if (noteListRef.current) {
    await noteListRef.current.refresh();
  }
};
  
  const handleEditNote = (note: Note) => {
    console.log('NotesPage: Opening edit form for note:', note.id);
    setSelectedNote(note);
  };

  const handleCloseEditForm = () => {
    console.log('NotesPage: Closing edit form');
    setSelectedNote(null);
  };

  const handleSaveNote = (updatedNote: Note) => {
    console.log('NotesPage: Note saved, refreshing list');
    // Refresh the note list to show updated note
    if (noteListRef.current) {
      noteListRef.current.refresh();
    }
    setSelectedNote(null);
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      console.log('NotesPage: Deleting note:', noteId);
      await apiService.deleteNote(noteId);
      
      // Refresh the note list
      if (noteListRef.current) {
        noteListRef.current.refresh();
      }
    } catch (error) {
      console.error('NotesPage: Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

    // Update the return section with better styling:
  
  return (
    <div className="notes-page">
      <Navbar />
  
      <div className="notes-content">
        <div className="notes-header">
          <h1>My Notes</h1>
          <button
            className="add-note-button"
            onClick={() => setShowAddNote(!showAddNote)}
          >
            {showAddNote ? 'Cancel' : 'Add Note'}
          </button>
        </div>
        
        {/* Add Note Form */}
        {showAddNote && (
          <AddNoteForm
            onSave={handleSaveNewNote}
            onCancel={() => setShowAddNote(false)}
          />
        )}
        
        <NoteList
          ref={noteListRef}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
  
        {selectedNote && (
          <EditNoteForm
            note={selectedNote}
            onClose={handleCloseEditForm}
            onSave={handleSaveNote}
          />
        )}
      </div>
    </div>
  );
};

export default NotesPage;