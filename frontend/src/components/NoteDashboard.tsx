import React, { useState, useRef } from "react";
import NoteList, { NoteListHandle } from "./NoteList";
import { apiService } from "../api/apiService";

interface User {
  id: number;
  username: string;
  email: string;
}

interface NoteDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

const NoteDashboard: React.FC<NoteDashboardProps> = ({ user, onLogout }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [noteAdded, setNoteAdded] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Later in the component
  const noteListRef = useRef<NoteListHandle>(null);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      if (editingNote) {
        // Update existing note
        await apiService.updateNote(editingNote.id, { title, content });
      } else {
        // Create new note
        await apiService.createNote({ title, content });
      }

      // Reset form and trigger refresh
      setTitle("");
      setContent("");
      setError(null);
      setEditingNote(null);
      setNoteAdded(!noteAdded); // Toggle to trigger useEffect in NoteList
      // After successful add/update
      noteListRef.current?.refresh();
    } catch (err: any) {
      console.error("Error saving note:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save note. Please try again."
      );
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      await apiService.deleteNote(noteId);
      setNoteAdded(!noteAdded); // Toggle to trigger useEffect in NoteList
      // After successful delete
      noteListRef.current?.refresh();
    } catch (err: any) {
      console.error("Error deleting note:", err);
      alert(
        "Failed to delete note: " +
          (err.response?.data?.error || "Unknown error")
      );
    }
  };

  const handleEditNote = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNote(note);
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setTitle("");
    setContent("");
    setEditingNote(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Notes</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            Welcome, {user.username || "User"}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add/Edit note form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingNote ? "Edit Note" : "Add New Note"}
          </h2>
          {error && (
            <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter note title"
                title="Note title"
                required
                aria-label="Note title"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Enter note content"
                title="Note content"
                aria-label="Note content"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                {editingNote ? "Update Note" : "Add Note"}
              </button>

              {editingNote && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notes list */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Notes</h2>
          <NoteList
            ref={noteListRef}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteDashboard;
