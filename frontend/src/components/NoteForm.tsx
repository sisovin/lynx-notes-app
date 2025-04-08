import React,  { useEffect, useState } from "react";
import { apiService } from "../api/apiService";
import config from "../config";

interface NoteFormProps {
  onSave: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ onSave }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Log API URL for debugging
  useEffect(() => {
    console.log("API URL in NoteForm:", config.api.baseURL);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setError("");

    // Validate input
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating note with API URL:", config.api.baseURL);

      // Use apiService instead of direct API calls
      await apiService.createNote({ title, content });

      setTitle("");
      setContent("");
      onSave();
    } catch (err: any) {
      console.error("Error creating note:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Failed to create note");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
      <h3 className="text-xl font-semibold mb-4 text-text">Add New Note</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-text font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-text font-medium mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary hover:bg-hover text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;
