import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { apiService } from "../api/apiService";
import { directApiHelpers } from "../api/directApi";
// Import the CSS file
import "../styles/NoteList.css";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

interface NoteListProps {
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: number) => void;
}

// Ensure this is exported
export interface NoteListHandle {
  refresh: () => Promise<void>; // Change to Promise<void> for better typing
}

const NoteList = forwardRef<NoteListHandle, NoteListProps>(
  ({ onEdit, onDelete }, ref) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Use useCallback to prevent unnecessary re-renders
    const fetchNotes = useCallback(async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        try {
          // First try with axios
          console.log("NoteList: Fetching notes with apiService...");
          const notesData = await apiService.getNotes();
          console.log("NoteList: Notes data received:", notesData);
          
          // Clear any existing error
          setError("");
          
          // If we get a valid array, use it
          if (Array.isArray(notesData) && notesData.length > 0) {
            console.log(`NoteList: Setting ${notesData.length} notes`);
            setNotes(notesData);
          } else {
            console.warn("NoteList: API returned empty array, trying fallback");
            // Empty array, try fallback
            throw new Error("Empty notes array");
          }
        } catch (axiosError) {
          console.log("NoteList: Primary API failed, trying fallback:", axiosError);

          try {
            // Fall back to direct fetch API
            const response = await directApiHelpers.getNotes();
            console.log("NoteList: Direct API response:", response);
            
            if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
              console.log(`NoteList: Setting ${response.data.length} notes from fallback`);
              setNotes(response.data);
              setError("");
            } else {
              console.warn("NoteList: Both APIs returned empty results");
              setNotes([]);
              setError("No notes found. Create your first note!");
            }
          } catch (directError: any) {
            console.error("NoteList: Both API methods failed:", directError);
            setError(directError.message || "Failed to fetch notes with both methods");
            setNotes([]);
          }
        }
      } catch (error: any) {
        console.error("NoteList: Failed to fetch notes", error);
        setError(
          error.response?.data?.message ||
          error.message ||
          "Failed to load notes"
        );
        setNotes([]);
      } finally {
        setLoading(false);
      }
    }, []);

    // Handle edit note function with proper logging
    const handleEditNote = useCallback((note: Note) => {
      console.log("NoteList: Editing note:", note.id);
      if (onEdit) {
        onEdit(note);
      } else {
        console.warn("NoteList: Edit handler not provided");
      }
    }, [onEdit]);

    // Handle delete note function with confirmation
    const handleDeleteNote = useCallback(async (noteId: number) => {
      console.log("NoteList: Deleting note:", noteId);
      
      // Add confirmation dialog
      if (window.confirm("Are you sure you want to delete this note?")) {
        try {
          if (onDelete) {
            onDelete(noteId);
          } else {
            // If no parent handler provided, handle deletion directly
            await apiService.deleteNote(noteId);
            console.log("NoteList: Note deleted successfully");
            // Refresh the notes list
            fetchNotes();
          }
        } catch (error) {
          console.error("NoteList: Failed to delete note:", error);
          alert("Failed to delete note. Please try again.");
        }
      }
    }, [onDelete, fetchNotes]);

    // Expose the refresh method via useImperativeHandle
    useImperativeHandle(ref, () => ({
      refresh: fetchNotes, // This exposes the fetchNotes method as "refresh"
    }));

    // Only run the effect when the component mounts
    useEffect(() => {
      console.log("NoteList: Component mounted, fetching notes");
      fetchNotes();

      // Set up interval to refresh notes every 30 seconds
      const interval = setInterval(() => {
        console.log("NoteList: Refreshing notes from interval");
        fetchNotes();
      }, 30000);

      return () => clearInterval(interval);
    }, [fetchNotes]);
    
    // Add effect to log notes state changes
    useEffect(() => {
      console.log("NoteList: Notes state updated:", notes);
    }, [notes]);

    // Debug render
    console.log("NoteList: Rendering with", notes.length, "notes, loading:", loading, "error:", error);

    if (loading)
      return (
        <div className="notes-loading animate-pulse text-foreground bg-card p-4 rounded-md">
          Loading notes...
        </div>
      );
      
    if (error) 
      return (
        <div className="text-red-500 bg-card p-4 rounded-md border border-red-300">
          {error}
        </div>
      );
      
    if (notes.length === 0)
      return (
        <div className="notes-empty text-foreground bg-card p-6 rounded-md text-center border border-border">
          No notes yet. Create your first note!
        </div>
      );

        // In your return statement where you render the notes:
    
    return (
      <div data-testid="notes-container" className="notes-container">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            data-testid={`note-${note.id}`}
          >
            <div className="note-content">
              <h3 className="note-title">{note.title}</h3>
              <p className="note-body">{note.content || "No content"}</p>
            </div>
            <div className="note-footer">
              <span>
                {note.updatedAt &&
                  `Updated: ${new Date(note.updatedAt).toLocaleString()}`}
              </span>
              <div className="note-actions always-visible">              
                <button
                  className="note-action-button"
                  aria-label="Edit"
                  onClick={() => handleEditNote(note)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  className="note-action-button"
                  aria-label="Delete"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

NoteList.displayName = "NoteList";

export default NoteList;