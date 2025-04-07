import express from 'express';
import { sequelize } from '../utils/database';

const router = express.Router();

// Simple health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: errorMessage
    });
  }
});

export default router;