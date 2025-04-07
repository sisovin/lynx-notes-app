// In your noteRoutes.ts file
import { Router } from 'express';
import { verifyToken } from '../../auth/middleware/authMiddleware';
import { getNotes, createNote, updateNote, deleteNote } from '../../notes/controllers/notesController';

const router = Router();

// All note routes are protected
router.use(verifyToken);

router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;