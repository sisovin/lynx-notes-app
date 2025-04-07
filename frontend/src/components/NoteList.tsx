import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { apiService } from "../api/apiService";
import { directApiHelpers } from "../api/directApi";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NoteListProps {
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: number) => void;
}

export interface NoteListHandle {
  refresh: () => void;
}

const NoteList = forwardRef<NoteListHandle, NoteListProps>(
  ({ onEdit, onDelete }, ref) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotes = async () => {
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
          const response = await apiService.getNotes();
          console.log("Notes response:", response.data);
          setNotes(Array.isArray(response.data) ? response.data : []);
          setError("");
        } catch (axiosError) {
          console.log("Axios notes fetch failed, trying direct API...");

          // Fall back to direct fetch API
          const response = await directApiHelpers.getNotes();
          console.log("Direct API notes response:", response.data);
          setNotes(Array.isArray(response.data) ? response.data : []);
          setError("");
        }
      } catch (error: any) {
        console.error("Failed to fetch notes", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load notes"
        );
      } finally {
        setLoading(false);
      }
    };

    // Expose the refresh method
    useImperativeHandle(ref, () => ({
      refresh: fetchNotes,
    }));

    useEffect(() => {
      fetchNotes();

      // Set up interval to refresh notes every 30 seconds
      const interval = setInterval(() => {
        fetchNotes();
      }, 30000);

      return () => clearInterval(interval);
    }, []);

    if (loading)
      return (
        <div className="text-secondary animate-pulse">Loading notes...</div>
      );
    if (error) return <div className="text-red-500">{error}</div>;
    if (notes.length === 0)
      return (
        <div className="text-secondary">
          No notes yet. Create your first note!
        </div>
      );

    return (
      <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="border border-border rounded-lg p-4 hover:bg-card transition-colors bg-background shadow-sm"
          >
            <h3 className="font-bold text-text">{note.title}</h3>
            <p className="text-secondary text-sm mt-2 line-clamp-4">
              {note.content || "No content"}
            </p>
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-border">
              <span className="text-xs text-secondary">
                {note.updatedAt &&
                  `Updated: ${new Date(note.updatedAt).toLocaleString()}`}
              </span>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    className="text-primary hover:text-hover p-1"
                    aria-label="Edit"
                    onClick={() => onEdit(note)}
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
                )}
                {onDelete && (
                  <button
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Delete"
                    onClick={() => onDelete(note.id)}
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
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default NoteList;
