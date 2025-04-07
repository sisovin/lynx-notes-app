import app from './app';
import { PORT, HOST, IS_DEVELOPMENT } from './config/env';
import { initDatabase, closeDatabase } from './utils/initDatabase';
import { ensureTestUser } from './features/auth/services/authService';


// Initialize the database before starting the server
initDatabase().then((connected) => {
  if (!connected) {
    console.error('Failed to connect to database. Server will not start.');
    return;
  }

  // Start the server
  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
    console.log(`For local access: http://localhost:${PORT}`);
    
    if (IS_DEVELOPMENT) {
      console.log(`For network access: http://192.168.50.131:${PORT}`);
    }
  });

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Starting graceful shutdown...`);
    
    // Close server first (stop accepting new connections)
    server.close(() => {
      console.log('HTTP server closed.');
      
      // Then close database connection
      closeDatabase().finally(() => {
        console.log('Shutdown complete.');
        process.exit(0);
      });
    });
    
    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});

// Ensure test user exists in development
await ensureTestUser();

export default app;