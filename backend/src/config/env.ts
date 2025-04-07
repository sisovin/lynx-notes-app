import { config } from 'dotenv';
import crypto from 'crypto';

// Load environment variables from .env file
config();

// Generate random secrets for development only if not provided
const generateSecret = () => crypto.randomBytes(64).toString('hex');

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' 
    ? undefined 
    : generateSecret() // Only generate in non-production
);

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || JWT_SECRET;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || (
  process.env.NODE_ENV === 'production' 
    ? undefined 
    : generateSecret() // Only generate in non-production
);

// Database configuration
export const DB_CONNECTION =
  process.env.DATABASE_URL || "sqlite:./database.sqlite";

// Redis configuration
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Server configuration
export const PORT = parseInt(process.env.PORT || '3001', 10);
export const HOST = '0.0.0.0';

// Client configuration
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

// Validate critical environment variables
if (IS_PRODUCTION && !JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in environment variables');
  process.exit(1); // Exit if missing in production
}

if (IS_PRODUCTION && !REFRESH_TOKEN_SECRET) {
  console.error('ERROR: REFRESH_TOKEN_SECRET is not defined in environment variables');
  process.exit(1); // Exit if missing in production
}

if (!REDIS_URL) {
  console.warn('Warning: REDIS_URL is not defined in environment variables');
}