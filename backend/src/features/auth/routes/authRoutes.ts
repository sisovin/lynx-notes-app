import { Router } from 'express';
import { 
  signup, 
  login, 
  requestPasswordReset,
  resetPassword,
  logout,
  refreshToken,
  getProfile,
  devResetPassword
} from '../controllers/authController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Auth endpoints
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Password reset
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', verifyToken, getProfile);

// Add to your routes
if (process.env.NODE_ENV === 'development') {
  router.post('/auth/dev-reset-password', devResetPassword);
}

export default router;