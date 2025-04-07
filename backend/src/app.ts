import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./features/auth/routes/authRoutes";
import noteRoutes from "./features/notes/routes/noteRoutes";
import { User } from "./features/auth/models/userModel";
import sequelize from "./utils/database";
import healthRoutes from './routes/healthRoutes';

// Create and configure Express app without starting the server
const app = express();

/// Update CORS configuration to accept requests from different devices
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.50.131:3000',
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'file://',
    // Add all network IP variations
    'http://192.168.50.131:3000',
    'http://192.168.50.131',
    'http://0.0.0.0:3000',
    // Allow all origins in development mode
    ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  // Enable CORS debugging for development
  preflightContinue: process.env.NODE_ENV === 'development'
}));

// Define more flexible CORS settings
const corsOptions = {
  // Allow all origins in development
  origin: function(origin: any, callback: any) {
    callback(null, true); // This allows all origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

// Apply CORS middleware with the options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
// Add this before other route definitions
app.use('/health', healthRoutes);

// Better error handling for JSON parsing
app.use(bodyParser.json({
  verify: (req: any, res, buf, encoding) => {
    try {
      JSON.parse(buf.toString());
      // Store raw body for debugging purposes
      req.rawBody = buf.toString();
    } catch (e) {
      const error = e as Error;
      const errorMessage = `Invalid JSON: ${error.message}`;
      console.error(errorMessage);
      (res as express.Response).status(400).json({ 
        error: 'Invalid JSON in request body',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      throw new Error(errorMessage);
    }
  }
}));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes); // Make sure noteRoutes is registered

// Debug endpoint
app.post('/api/debug', (req: any, res) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw Body:', req.rawBody);
  
  res.json({
    received: {
      headers: req.headers,
      body: req.body,
      rawBody: req.rawBody
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// Add this near your other routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

app.get("/api/status", async (req, res) => {
  // Status check code...
  try {
    await sequelize.authenticate(); // Test database connection
    const userCount = await User.count(); // Count users in the database
    res.json({ status: "OK", userCount });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ status: "ERROR", message: "Database connection failed" });
  }
});

// Export the configured app
export default app;