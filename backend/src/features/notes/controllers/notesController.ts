import { Request, Response } from 'express';
import { Note } from '../models/noteModel';
import { redisClient } from '../../../utils/redisClient';

// Define AuthRequest type to include user property
interface AuthRequest extends Request {
  user?: {
    id: number;
    [key: string]: any;
  };
}

// Create a new note
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content } = req.body;
    
    // Get userId from the authenticated user in the request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    const newNote = await Note.create({ title, content, userId });
    await redisClient.del(`notes:${userId}`);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

// Get all notes for a user
export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    // Get userId from the authenticated user instead of URL params
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }
    
    const cachedNotes = await redisClient.get(`notes:${userId}`);
    if (cachedNotes) {
      return res.status(200).json(JSON.parse(cachedNotes));
    }
    
    const notes = await Note.findAll({ where: { userId } });
    await redisClient.set(`notes:${userId}`, JSON.stringify(notes));
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
};

// Update a note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const note = await Note.findByPk(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    note.title = title;
    note.content = content;
    await note.save();
    await redisClient.del(`notes:${note.userId}`);
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
};

// Delete a note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await note.destroy();
    await redisClient.del(`notes:${note.userId}`);
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
