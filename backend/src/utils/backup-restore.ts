import fs from 'fs';
import path from 'path';
import { DB_CONNECTION } from '../config/env';

// Get the database file path from connection string
const getDbPath = () => {
  const dbPath = DB_CONNECTION.includes('sqlite:') 
    ? DB_CONNECTION.replace('sqlite:', '') 
    : './database.sqlite';
  
  return path.resolve(process.cwd(), dbPath);
};

// Create backup directory if it doesn't exist
const getBackupDir = () => {
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

// Backup the database
export const backupDatabase = () => {
  try {
    const dbPath = getDbPath();
    const backupDir = getBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);
    
    fs.copyFileSync(dbPath, backupPath);
    console.log(`Database backed up to: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Failed to backup database:', error);
    return null;
  }
};

// Restore from a backup
export const restoreDatabase = (backupFile: string) => {
  try {
    const dbPath = getDbPath();
    const backupDir = getBackupDir();
    const backupPath = path.join(backupDir, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found: ${backupPath}`);
      return false;
    }
    
    // Make a backup of current state before restore
    backupDatabase();
    
    // Copy backup file to database location
    fs.copyFileSync(backupPath, dbPath);
    console.log(`Database restored from: ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Failed to restore database:', error);
    return false;
  }
};