import sequelize from './database';
import { IS_PRODUCTION, IS_DEVELOPMENT } from '../config/env';
import fs from 'fs';
import path from 'path';

// Import all models here so they get registered with Sequelize
import '../features/auth/models/userModel';
import '../features/notes/models/noteModel';
import { hashPassword } from './passwordUtils';
import { User } from '../features/auth/models/userModel';

// Initialize database connection with improved error handling
export const initDatabase = async (syncOptions = { force: false, alter: false }) => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Only sync schema if explicitly requested via environment variable
    const shouldSync = process.env.SYNC_DB === 'true';
    const shouldForceSync = process.env.FORCE_SYNC_DB === 'true';
    
    // Override with provided options if they are explicitly set
    const finalSyncOptions = {
      force: shouldForceSync || syncOptions.force,
      alter: shouldSync || syncOptions.alter
    };
    
    if (finalSyncOptions.force || finalSyncOptions.alter) {
      console.log(`Syncing database with options: ${JSON.stringify(finalSyncOptions)}`);
      
      try {
        await sequelize.sync(finalSyncOptions);
        console.log('Database schema synchronized successfully.');
        
        // If we forced sync, we need to recreate our test user
        if (finalSyncOptions.force) {
          await seedDatabase(true);
        }
      } catch (syncError) {
        console.error('Failed to sync database schema:', syncError);
        
        // If database is locked, we may need to delete it and recreate
        if (syncError instanceof Error && syncError.message.includes('SQLITE_BUSY')) {
          console.warn('SQLite database is locked. If this persists, try manually deleting the database file.');
        }
        
        throw syncError; // Re-throw to be handled by caller
      }
    } else {
      console.log('Database schema sync skipped. Use SYNC_DB=true or FORCE_SYNC_DB=true to enable.');
    }
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    
    // Only exit in production, allow for retry in development
    if (IS_PRODUCTION) {
      process.exit(1);
    }
    
    return false;
  }
};

// Rest of your code remains the same
// ...

// Handle graceful shutdown of database connection
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
    return true;
  } catch (error) {
    console.error('Error closing database connection:', error);
    return false;
  }
};

// Create a separate seed function to add initial data
export const seedDatabase = async (force = false) => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ where: { email: 'admin@niewin.local' } });
    
    // Create admin user if it doesn't exist or if force is true
    if (!adminExists || force) {
      if (adminExists && force) {
        // Delete existing admin user if force is true
        await User.destroy({ where: { email: 'admin@niewin.local' } });
      }
      
      console.log('Creating admin user...');
      const hashedPassword = await hashPassword('TestPas$953#&699');
      
      const admin = await User.create({
        username: 'Niewin',
        email: 'admin@niewin.local',
        password: hashedPassword,
      });
      
      console.log('Admin user created successfully:', admin.get({ plain: true }));
    } else {
      console.log('Admin user already exists, skipping creation.');
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};