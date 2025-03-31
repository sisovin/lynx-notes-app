import { Router } from 'express';
import { createNote, getNotes, updateNote, deleteNote } from '../controllers/notesController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', verifyToken, createNote);
router.get('/:userId', verifyToken, getNotes);
router.put('/:id', verifyToken, updateNote);
router.delete('/:id', verifyToken, deleteNote);

export default router;
