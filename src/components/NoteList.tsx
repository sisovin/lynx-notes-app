import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Note {
  id: number;
  title: string;
  content: string;
  userId: number;
}

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('/api/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Failed to fetch notes', error);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <ul>
        {notes.map((note) => (
          <li key={note.id} className="mb-4 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p>{note.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
