import { Sequelize, Options } from 'sequelize';
import { DB_CONNECTION, IS_PRODUCTION, IS_DEVELOPMENT, IS_TEST } from '../config/env';
import path from 'path';
import fs from 'fs';

// Configure database options based on environment
const getConnectionOptions = (): Options => {
  // Extract database path from connection string or use default
  const dbPath = DB_CONNECTION.includes('sqlite:') 
    ? DB_CONNECTION.replace('sqlite:', '') 
    : './database.sqlite';

  const absolutePath = path.resolve(process.cwd(), dbPath);
  
  // Ensure directory exists
  const dbDir = path.dirname(absolutePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  console.log(`Using SQLite database at: ${absolutePath}`);
  
  // Set SQLite-specific options for better concurrency handling
  const baseOptions: Options = {
    dialect: 'sqlite',
    storage: absolutePath,
    logging: IS_DEVELOPMENT ? console.log : false,
    pool: {
      max: 5, // Reduce pool size to minimize concurrent connections
      min: 0,
      acquire: 60000, // Increase timeout to 60 seconds
      idle: 10000
    },
    retry: {
      max: 3 // Retry failed queries up to 3 times
    },
    dialectOptions: {
      // Set SQLite pragmas for better concurrency and reliability
      // See: https://www.sqlite.org/pragma.html
      pragmas: {
        'journal_mode': 'WAL', // Use Write-Ahead Logging for better concurrency
        'busy_timeout': 5000,   // Wait 5000ms when database is busy before failing
        'foreign_keys': 'ON'    // Enforce foreign key constraints
      }
    }
  };

  if (IS_TEST) {
    return {
      ...baseOptions,
      logging: false,
    };
  }

  return baseOptions;
};

// Create Sequelize instance with improved connection handling
export const sequelize = new Sequelize(getConnectionOptions());

// Export the instance for models to use
export default sequelize;